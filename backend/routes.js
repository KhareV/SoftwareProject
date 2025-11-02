import express from "express";
import { Project, Analysis } from "./models.js";
import {
  analyzeSecurity,
  analyzeQuality,
  analyzePerformance,
  generateSuggestions,
  checkOWASPCompliance,
  calculateSecurityScore,
} from "./groq.js";
import { asyncHandler } from "./auth.js";
import { saveExcelToBuffer } from "./services/excelGenerator.js";
import { generatePDFReport } from "./services/pdfGenerator.js";
import enhancedAnalysisRoutes from "./routes/enhancedAnalysis.js";
import practiceRoutes from "./routes/practice.js";
import githubRoutes from "./routes/github.js";

const router = express.Router();

// Mount all feature routes
router.use(enhancedAnalysisRoutes);
router.use(practiceRoutes);
router.use(githubRoutes);

// ========== PROJECT ROUTES ==========

// Create new project
router.post(
  "/projects",
  asyncHandler(async (req, res) => {
    const { name, language } = req.body;

    if (!name || !language) {
      return res.status(400).json({ error: "Name and language are required" });
    }

    const project = await Project.create({
      userId: req.userId,
      name,
      language,
    });

    res.status(201).json(project);
  })
);

// Get all projects for user
router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const projects = await Project.find({ userId: req.userId })
      .sort({ lastAnalyzed: -1 })
      .limit(50);

    res.json(projects);
  })
);

// Get single project
router.get(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  })
);

// Delete project
router.delete(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete associated analyses
    await Analysis.deleteMany({ projectId: req.params.id });

    res.json({ message: "Project deleted successfully" });
  })
);

// ========== ANALYSIS ROUTES ==========

// Analyze code
router.post(
  "/analysis",
  asyncHandler(async (req, res) => {
    const { code, language, projectId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const startTime = Date.now();

    // Run all analyses in parallel
    const [securityResults, qualityResults, performanceResults] =
      await Promise.all([
        analyzeSecurity(code, language),
        analyzeQuality(code, language),
        analyzePerformance(code, language),
      ]);

    const vulnerabilities = securityResults;
    const qualityMetrics = qualityResults;
    const performanceMetrics = performanceResults;

    // Extract for backwards compatibility
    const { metrics, qualityScore, codeSmells } = qualityResults;
    const { performanceScore } = performanceResults;

    // Generate suggestions
    const suggestions = await generateSuggestions(
      code,
      language,
      vulnerabilities,
      codeSmells || []
    );

    // Calculate scores
    const securityScore = calculateSecurityScore(vulnerabilities);
    const owaspCompliance = checkOWASPCompliance(vulnerabilities);
    const technicalDebtScore = metrics?.technicalDebt || 0;

    // Create analysis record
    const analysis = await Analysis.create({
      projectId: projectId || null,
      userId: req.userId,
      code,
      language,
      vulnerabilities,
      metrics,
      qualityMetrics,
      performanceMetrics,
      qualityScore,
      securityScore,
      performanceScore,
      suggestions,
      owaspCompliance,
      technicalDebtScore,
      analysisTimeMs: Date.now() - startTime,
    });

    // Update project if provided
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        lastAnalyzed: new Date(),
        $inc: { analysisCount: 1 },
      });
    }

    res.status(201).json(analysis);
  })
);

// Get single analysis
router.get(
  "/analysis/:id",
  asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("projectId", "name language");

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  })
);

// Get all analyses for user
router.get(
  "/analysis",
  asyncHandler(async (req, res) => {
    const { projectId, limit = 20, skip = 0 } = req.query;

    const query = { userId: req.userId };
    if (projectId) {
      query.projectId = projectId;
    }

    const analyses = await Analysis.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select("-code") // Exclude code for list view
      .populate("projectId", "name language");

    const total = await Analysis.countDocuments(query);

    res.json({
      analyses,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit),
    });
  })
);

// ========== ANALYTICS ROUTES ==========

// Get overview analytics
router.get(
  "/analytics/overview",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Get aggregated stats
    const [totalAnalyses, recentAnalyses, projects] = await Promise.all([
      Analysis.countDocuments({ userId }),
      Analysis.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10)
        .select("-code"),
      Project.find({ userId }),
    ]);

    // Calculate aggregate metrics
    const allAnalyses = await Analysis.find({ userId }).select(
      "vulnerabilities qualityScore securityScore language"
    );

    const stats = {
      totalAnalyses,
      totalProjects: projects.length,
      totalVulnerabilities: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      mediumVulnerabilities: 0,
      lowVulnerabilities: 0,
      averageQualityScore: 0,
      averageSecurityScore: 0,
      languagesUsed: new Set(),
    };

    let totalQuality = 0;
    let totalSecurity = 0;

    allAnalyses.forEach((analysis) => {
      analysis.vulnerabilities.forEach((vuln) => {
        stats.totalVulnerabilities++;
        stats[`${vuln.severity.toLowerCase()}Vulnerabilities`]++;
      });

      totalQuality += analysis.qualityScore || 0;
      totalSecurity += analysis.securityScore || 0;
      stats.languagesUsed.add(analysis.language);
    });

    if (allAnalyses.length > 0) {
      stats.averageQualityScore = Math.round(totalQuality / allAnalyses.length);
      stats.averageSecurityScore = Math.round(
        totalSecurity / allAnalyses.length
      );
    }

    stats.languagesUsed = Array.from(stats.languagesUsed);

    res.json({
      stats,
      recentAnalyses,
    });
  })
);

// Get trend analytics
router.get(
  "/analytics/trends",
  asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const userId = req.userId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analyses = await Analysis.find({
      userId,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .select("timestamp qualityScore securityScore vulnerabilities language");

    // Group by day
    const trendData = [];
    const languageBreakdown = {};
    const vulnerabilityTrends = {
      Critical: [],
      High: [],
      Medium: [],
      Low: [],
    };

    analyses.forEach((analysis) => {
      const date = analysis.timestamp.toISOString().split("T")[0];

      // Quality and security trends
      const existing = trendData.find((d) => d.date === date);
      if (existing) {
        existing.qualityScore =
          (existing.qualityScore + analysis.qualityScore) / 2;
        existing.securityScore =
          (existing.securityScore + analysis.securityScore) / 2;
        existing.count++;
      } else {
        trendData.push({
          date,
          qualityScore: analysis.qualityScore,
          securityScore: analysis.securityScore,
          count: 1,
        });
      }

      // Language breakdown
      languageBreakdown[analysis.language] =
        (languageBreakdown[analysis.language] || 0) + 1;

      // Vulnerability trends
      analysis.vulnerabilities.forEach((vuln) => {
        const vulnDate = vulnerabilityTrends[vuln.severity].find(
          (v) => v.date === date
        );
        if (vulnDate) {
          vulnDate.count++;
        } else {
          vulnerabilityTrends[vuln.severity].push({ date, count: 1 });
        }
      });
    });

    res.json({
      trendData,
      languageBreakdown,
      vulnerabilityTrends,
    });
  })
);

// ========== REPORT ROUTES ==========

// Generate PDF report
router.get(
  "/reports/:id/pdf",
  asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("projectId", "name language");

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Use professional PDF generator
    const doc = generatePDFReport(analysis, analysis.projectId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=CodeReview-AI-Analysis-${analysis._id}.pdf`
    );

    doc.pipe(res);
  })
);

// Generate Excel report
router.get(
  "/reports/:id/excel",
  asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("projectId", "name language");

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Generate Excel buffer
    const buffer = await saveExcelToBuffer(analysis, analysis.projectId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=CodeReview-AI-Analysis-${analysis._id}.xlsx`
    );

    res.send(buffer);
  })
);

export default router;
