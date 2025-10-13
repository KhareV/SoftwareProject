import express from "express";
import { asyncHandler } from "../auth.js";
import {
  createGitHubRepo,
  pushCodeToRepo,
  getUserRepos,
  getRepoContents,
  getFileContent,
  createOrUpdateFile,
  createWebhook,
  analyzeRepository,
  getCommitHistory,
} from "../services/githubIntegration.js";
import {
  analyzeSecurity,
  analyzeQuality,
  analyzePerformance,
  generateSuggestions,
  calculateSecurityScore,
} from "../groq.js";
import { parseCode } from "../services/codeParser.js";
import { calculateAllMetrics } from "../services/metricsCalculator.js";
import mongoose from "mongoose";
import crypto from "crypto";

const router = express.Router();

// GitHub Integration Schema
const GitHubIntegrationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  accessToken: { type: String, required: true },
  username: String,
  repositories: [Object],
  webhooks: [Object],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const GitHubIntegration = mongoose.model(
  "GitHubIntegration",
  GitHubIntegrationSchema
);

// Repository Analysis Schema
const RepoAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  repositoryId: String,
  repositoryName: String,
  fullName: String,
  analysisResults: Object,
  filesAnalyzed: Number,
  totalFiles: Number,
  overallScore: Number,
  createdAt: { type: Date, default: Date.now },
});

const RepoAnalysis = mongoose.model("RepoAnalysis", RepoAnalysisSchema);

/**
 * Connect GitHub account
 */
router.post(
  "/github/connect",
  asyncHandler(async (req, res) => {
    const { accessToken, username } = req.body;
    const userId = req.userId;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    // Test token by fetching repos
    const reposResult = await getUserRepos(accessToken);
    if (!reposResult.success) {
      return res.status(401).json({ error: "Invalid GitHub token" });
    }

    // Save integration
    let integration = await GitHubIntegration.findOne({ userId });

    if (integration) {
      integration.accessToken = accessToken;
      integration.username = username;
      integration.repositories = reposResult.repos;
      integration.updatedAt = new Date();
    } else {
      integration = await GitHubIntegration.create({
        userId,
        accessToken,
        username,
        repositories: reposResult.repos,
      });
    }

    await integration.save();

    res.json({
      success: true,
      integration: {
        id: integration._id,
        username: integration.username,
        repoCount: reposResult.repos.length,
      },
    });
  })
);

/**
 * Get user's GitHub repositories
 */
router.get(
  "/github/repos",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { page = 1, perPage = 30 } = req.query;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await getUserRepos(
      integration.accessToken,
      parseInt(page),
      parseInt(perPage)
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Update cached repos
    integration.repositories = result.repos;
    integration.updatedAt = new Date();
    await integration.save();

    res.json({ repos: result.repos });
  })
);

/**
 * Check if repository name is available
 */
router.get(
  "/github/repos/check-name/:name",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name } = req.params;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const repos = await getUserRepos(integration.accessToken);
    if (!repos.success) {
      return res.status(500).json({ error: "Failed to fetch repositories" });
    }

    const exists = repos.repos.some(
      (repo) => repo.name.toLowerCase() === name.toLowerCase()
    );

    // Generate suggestions if name exists
    const suggestions = [];
    if (exists) {
      const timestamp = Date.now().toString().slice(-6);
      suggestions.push(`${name}-${timestamp}`);
      suggestions.push(`${name}-v2`);
      suggestions.push(`${name}-new`);

      // Filter out suggestions that also exist
      const availableSuggestions = suggestions.filter(
        (suggestion) =>
          !repos.repos.some(
            (repo) => repo.name.toLowerCase() === suggestion.toLowerCase()
          )
      );

      res.json({
        available: false,
        suggestions: availableSuggestions.slice(0, 3),
      });
    } else {
      res.json({ available: true });
    }
  })
);

/**
 * Create new repository
 */
router.post(
  "/github/repos/create",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, description, isPrivate, language } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }

    // Validate repository name
    const repoNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!repoNameRegex.test(name)) {
      return res.status(400).json({
        error:
          "Repository name can only contain alphanumeric characters, hyphens, underscores, and dots",
      });
    }

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await createGitHubRepo(integration.accessToken, {
      name,
      description,
      private: isPrivate,
      language,
    });

    if (!result.success) {
      const statusCode =
        result.status === 422
          ? 400
          : result.status === 401
          ? 401
          : result.status === 403
          ? 403
          : 500;
      return res.status(statusCode).json({ error: result.error });
    }

    res.json({ repo: result.repo });
  })
);

/**
 * Push code to repository
 */
router.post(
  "/github/repos/:owner/:repo/push",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const { files, message } = req.body;
    const userId = req.userId;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: "Files array is required" });
    }

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await pushCodeToRepo(
      integration.accessToken,
      owner,
      repo,
      files,
      message || "Update from CodeReview.AI"
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ commit: result.commit });
  })
);

/**
 * Get repository contents
 */
router.get(
  "/github/repos/:owner/:repo/contents",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const { path = "" } = req.query;
    const userId = req.userId;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await getRepoContents(
      integration.accessToken,
      owner,
      repo,
      path
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ contents: result.contents });
  })
);

/**
 * Get file content
 */
router.get(
  "/github/repos/:owner/:repo/files/:path(*)",
  asyncHandler(async (req, res) => {
    const { owner, repo, path } = req.params;
    const userId = req.userId;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await getFileContent(
      integration.accessToken,
      owner,
      repo,
      path
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ file: result.file });
  })
);

/**
 * Analyze entire repository
 */
router.post(
  "/github/repos/:owner/:repo/analyze",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const userId = req.userId;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    // Get repository files
    const repoResult = await analyzeRepository(
      integration.accessToken,
      owner,
      repo
    );

    if (!repoResult.success) {
      return res.status(500).json({ error: repoResult.error });
    }

    // Analyze each file
    const fileAnalyses = await Promise.all(
      repoResult.files.map(async (file) => {
        try {
          const language = file.name.split(".").pop();

          // Parse code
          const parseResult = parseCode(file.content, language);

          // Run security analysis
          const vulnerabilities = await analyzeSecurity(file.content, language);

          // Run quality analysis
          const qualityMetrics = await analyzeQuality(file.content, language);

          // Calculate advanced metrics
          const metrics = await calculateAllMetrics(
            file.content,
            parseResult.ast,
            language,
            vulnerabilities,
            qualityMetrics.codeSmells || []
          );

          return {
            file: file.name,
            path: file.path,
            language,
            vulnerabilities: vulnerabilities.length,
            criticalVulns: vulnerabilities.filter(
              (v) => v.severity === "Critical"
            ).length,
            qualityScore: qualityMetrics.qualityScore,
            complexity: metrics.cyclomaticComplexity,
            maintainability: metrics.maintainabilityIndex,
            linesOfCode: metrics.linesOfCode,
          };
        } catch (error) {
          console.error(`Error analyzing ${file.name}:`, error);
          return {
            file: file.name,
            path: file.path,
            error: error.message,
          };
        }
      })
    );

    // Calculate overall scores
    const validAnalyses = fileAnalyses.filter((a) => !a.error);
    const overallScore =
      validAnalyses.length > 0
        ? Math.round(
            validAnalyses.reduce((sum, a) => sum + (a.qualityScore || 0), 0) /
              validAnalyses.length
          )
        : 0;

    const totalVulnerabilities = validAnalyses.reduce(
      (sum, a) => sum + (a.vulnerabilities || 0),
      0
    );
    const totalCritical = validAnalyses.reduce(
      (sum, a) => sum + (a.criticalVulns || 0),
      0
    );

    const analysisResults = {
      repository: repoResult.repository,
      filesAnalyzed: validAnalyses.length,
      totalFiles: repoResult.totalCodeFiles,
      overallScore,
      totalVulnerabilities,
      totalCritical,
      fileAnalyses,
    };

    // Save analysis
    const analysis = await RepoAnalysis.create({
      userId,
      repositoryId: repoResult.repository.fullName,
      repositoryName: repoResult.repository.name,
      fullName: repoResult.repository.fullName,
      analysisResults,
      filesAnalyzed: validAnalyses.length,
      totalFiles: repoResult.totalCodeFiles,
      overallScore,
    });

    res.json({
      analysisId: analysis._id,
      results: analysisResults,
    });
  })
);

/**
 * Get repository analysis history
 */
router.get(
  "/github/repos/:owner/:repo/analyses",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const userId = req.userId;

    const analyses = await RepoAnalysis.find({
      userId,
      fullName: `${owner}/${repo}`,
    }).sort({ createdAt: -1 });

    res.json({ analyses });
  })
);

/**
 * Setup webhook for repository
 */
router.post(
  "/github/repos/:owner/:repo/webhook",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const userId = req.userId;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const webhookUrl = `${
      process.env.API_URL || "http://localhost:5000"
    }/api/github/webhook`;

    const result = await createWebhook(
      integration.accessToken,
      owner,
      repo,
      webhookUrl
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Save webhook info
    if (!integration.webhooks) {
      integration.webhooks = [];
    }

    integration.webhooks.push({
      repositoryFullName: `${owner}/${repo}`,
      webhookId: result.webhook.id,
      url: result.webhook.url,
      events: result.webhook.events,
      createdAt: new Date(),
    });

    await integration.save();

    res.json({ webhook: result.webhook });
  })
);

/**
 * Handle GitHub webhook events
 */
router.post("/github/webhook", express.json(), async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];

  // Verify signature
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret);
    const digest =
      "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

    if (signature !== digest) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  // Handle push event
  if (event === "push") {
    const { repository, commits } = req.body;
    console.log(
      `📦 Push to ${repository.full_name}: ${commits.length} commits`
    );

    // Trigger auto-analysis (implement as needed)
    // You can queue analysis jobs here
  }

  // Handle pull request event
  if (event === "pull_request") {
    const { action, pull_request, repository } = req.body;
    console.log(
      `🔀 PR ${action} in ${repository.full_name}: ${pull_request.title}`
    );

    // Trigger PR analysis (implement as needed)
  }

  res.json({ received: true });
});

/**
 * Get commit history
 */
router.get(
  "/github/repos/:owner/:repo/commits",
  asyncHandler(async (req, res) => {
    const { owner, repo } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.userId;

    const integration = await GitHubIntegration.findOne({ userId });
    if (!integration) {
      return res.status(404).json({ error: "GitHub not connected" });
    }

    const result = await getCommitHistory(
      integration.accessToken,
      owner,
      repo,
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ commits: result.commits });
  })
);

/**
 * Disconnect GitHub
 */
router.delete(
  "/github/disconnect",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    await GitHubIntegration.deleteOne({ userId });

    res.json({ success: true, message: "GitHub disconnected" });
  })
);

export default router;
