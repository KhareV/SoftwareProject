import express from "express";
import { Analysis, Project } from "../models.js";
import { asyncHandler } from "../auth.js";
import {
  analyzeSecurity,
  analyzeQuality,
  analyzePerformance,
  generateSuggestions,
  checkOWASPCompliance,
  calculateSecurityScore,
} from "../groq.js";
import { parseCode, detectHardcodedSecrets } from "../services/codeParser.js";
import { calculateAllMetrics } from "../services/metricsCalculator.js";
import {
  emitAnalysisStarted,
  emitAnalysisProgress,
  emitAnalysisCompleted,
  emitAnalysisError,
  emitCriticalVulnerability,
} from "../services/websocket.js";
import { saveExcelToBuffer } from "../services/excelGenerator.js";

const router = express.Router();

/**
 * Enhanced analysis endpoint with AST parsing and advanced metrics
 */
router.post(
  "/analyze/enhanced",
  asyncHandler(async (req, res) => {
    const { projectId, code } = req.body;
    const userId = req.userId;

    if (!projectId || !code) {
      return res
        .status(400)
        .json({ error: "Project ID and code are required" });
    }

    // Get project
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create analysis record
    const analysis = await Analysis.create({
      projectId,
      userId,
      code,
      language: project.language,
      status: "processing",
    });

    // Emit analysis started
    emitAnalysisStarted(userId, analysis._id.toString(), {
      projectName: project.name,
      language: project.language,
    });

    // Background processing
    processEnhancedAnalysis(analysis, project, code, userId).catch((error) => {
      console.error("Analysis error:", error);
      emitAnalysisError(userId, analysis._id.toString(), error);
    });

    res.json({
      analysisId: analysis._id,
      message:
        "Analysis started. You will receive real-time updates via WebSocket.",
    });
  })
);

/**
 * Background processing function with all advanced features
 */
async function processEnhancedAnalysis(analysis, project, code, userId) {
  try {
    const analysisId = analysis._id.toString();
    const language = project.language;

    // Step 1: Parse code (10%)
    emitAnalysisProgress(userId, analysisId, 10, "Parsing code structure...");
    const parseResult = parseCode(code, language);

    let ast = null;
    let codeStructure = null;

    if (parseResult.success) {
      ast = parseResult.ast;
      codeStructure = parseResult.structure;
    }

    // Step 2: Detect hardcoded secrets (20%)
    emitAnalysisProgress(
      userId,
      analysisId,
      20,
      "Scanning for hardcoded secrets..."
    );
    const secrets = detectHardcodedSecrets(code);

    if (secrets.length > 0) {
      console.log(`⚠️  Found ${secrets.length} hardcoded secrets`);
    }

    // Step 3: Security analysis with Groq (40%)
    emitAnalysisProgress(
      userId,
      analysisId,
      40,
      "Analyzing security vulnerabilities..."
    );
    const vulnerabilities = await analyzeSecurity(code, language);

    // Add hardcoded secrets to vulnerabilities
    secrets.forEach((secret) => {
      vulnerabilities.push({
        severity: "Critical",
        title: `Hardcoded ${secret.type}`,
        description: `Found hardcoded ${secret.type} in code. This is a security risk.`,
        lineNumber: secret.line,
        cwe: "CWE-798",
        owaspCategory: "A07",
        recommendation:
          "Move this secret to environment variables or a secure vault.",
        codeSnippet: secret.snippet,
        fixSuggestion: "Use process.env.VARIABLE_NAME or a secrets manager",
      });
    });

    // Emit critical vulnerability alerts
    const criticalVulns = vulnerabilities.filter(
      (v) => v.severity === "Critical"
    );
    criticalVulns.forEach((vuln) => {
      emitCriticalVulnerability(userId, project._id.toString(), vuln);
    });

    // Step 4: Quality analysis with Groq (60%)
    emitAnalysisProgress(userId, analysisId, 60, "Analyzing code quality...");
    const qualityAnalysis = await analyzeQuality(code, language);

    // Step 5: Calculate advanced metrics (70%)
    emitAnalysisProgress(
      userId,
      analysisId,
      70,
      "Calculating advanced metrics..."
    );
    const advancedMetrics = await calculateAllMetrics(
      code,
      ast,
      language,
      vulnerabilities,
      qualityAnalysis.codeSmells || []
    );

    // Merge metrics
    const finalMetrics = {
      ...qualityAnalysis.metrics,
      ...advancedMetrics,
      halstead: advancedMetrics.halstead,
      duplication: advancedMetrics.duplication,
    };

    // Step 6: Performance analysis (80%)
    emitAnalysisProgress(userId, analysisId, 80, "Analyzing performance...");
    const performanceMetrics = await analyzePerformance(code, language);

    // Step 7: Generate suggestions (90%)
    emitAnalysisProgress(
      userId,
      analysisId,
      90,
      "Generating improvement suggestions..."
    );
    const suggestions = await generateSuggestions(
      code,
      language,
      vulnerabilities,
      qualityAnalysis.codeSmells || []
    );

    // Step 8: Calculate scores (95%)
    emitAnalysisProgress(userId, analysisId, 95, "Calculating final scores...");
    const securityScore = calculateSecurityScore(vulnerabilities);
    const owaspCompliance = checkOWASPCompliance(vulnerabilities);

    // Step 9: Save results (100%)
    emitAnalysisProgress(userId, analysisId, 100, "Finalizing analysis...");

    const results = {
      vulnerabilities,
      qualityMetrics: {
        ...qualityAnalysis,
        metrics: finalMetrics,
      },
      performanceMetrics,
      suggestions,
      securityScore,
      owaspCompliance,
      codeStructure,
      secrets: secrets.length,
    };

    // Update analysis
    analysis.status = "completed";
    analysis.vulnerabilities = vulnerabilities;
    analysis.qualityMetrics = results.qualityMetrics;
    analysis.performanceMetrics = performanceMetrics;
    analysis.suggestions = suggestions;
    analysis.securityScore = securityScore;
    analysis.owaspCompliance = owaspCompliance;
    await analysis.save();

    // Update project
    project.lastAnalyzed = new Date();
    project.analysisCount = (project.analysisCount || 0) + 1;
    await project.save();

    // Emit completion
    emitAnalysisCompleted(userId, analysisId, results);
  } catch (error) {
    console.error("Enhanced analysis error:", error);
    analysis.status = "failed";
    analysis.error = error.message;
    await analysis.save();
    throw error;
  }
}

/**
 * Export analysis as Excel
 */
router.get(
  "/analysis/:id/excel",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const analysis = await Analysis.findOne({ _id: id, userId });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const project = await Project.findById(analysis.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const buffer = await saveExcelToBuffer(analysis, project);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${project.name}-analysis-${Date.now()}.xlsx"`
    );
    res.send(buffer);
  })
);

/**
 * Get analysis metrics summary
 */
router.get(
  "/analytics/metrics",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { projectId, days = 30 } = req.query;

    const query = { userId };
    if (projectId) {
      query.projectId = projectId;
    }

    // Get analyses from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.createdAt = { $gte: startDate };

    const analyses = await Analysis.find(query).sort({ createdAt: 1 });

    // Calculate trend data
    const trends = analyses.map((a) => ({
      date: a.createdAt,
      qualityScore: a.qualityMetrics?.qualityScore || 0,
      securityScore: a.securityScore || 0,
      performanceScore: a.performanceMetrics?.performanceScore || 0,
      vulnerabilities: a.vulnerabilities?.length || 0,
      criticalVulns:
        a.vulnerabilities?.filter((v) => v.severity === "Critical").length || 0,
      technicalDebt: a.qualityMetrics?.metrics?.technicalDebt || 0,
    }));

    // Calculate aggregates
    const totals = {
      totalAnalyses: analyses.length,
      avgQualityScore:
        trends.reduce((sum, t) => sum + t.qualityScore, 0) /
        (trends.length || 1),
      avgSecurityScore:
        trends.reduce((sum, t) => sum + t.securityScore, 0) /
        (trends.length || 1),
      totalVulnerabilities: trends.reduce(
        (sum, t) => sum + t.vulnerabilities,
        0
      ),
      totalCriticalVulns: trends.reduce((sum, t) => sum + t.criticalVulns, 0),
      avgTechnicalDebt:
        trends.reduce((sum, t) => sum + t.technicalDebt, 0) /
        (trends.length || 1),
    };

    res.json({
      trends,
      totals,
      period: { days, startDate, endDate: new Date() },
    });
  })
);

export default router;
