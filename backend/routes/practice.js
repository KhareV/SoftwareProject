import express from "express";
import { asyncHandler } from "../auth.js";
import {
  generateCodingChallenge,
  evaluateSolution,
  getHint,
  generateSimilarChallenges,
  getTopics,
  generateLearningPath,
  explainSolution,
} from "../services/challengeGenerator.js";
import mongoose from "mongoose";

const router = express.Router();

// Challenge Schema
const ChallengeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  challengeData: { type: Object, required: true },
  userCode: String,
  evaluation: Object,
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  score: Number,
  attempts: { type: Number, default: 0 },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const Challenge = mongoose.model("Challenge", ChallengeSchema);

// Learning Path Schema
const LearningPathSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userLevel: String,
  goals: [String],
  path: Object,
  progress: { type: Number, default: 0 },
  currentWeek: { type: Number, default: 1 },
  completedChallenges: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LearningPath = mongoose.model("LearningPath", LearningPathSchema);

/**
 * Generate new coding challenge
 */
router.post(
  "/practice/generate",
  asyncHandler(async (req, res) => {
    const { difficulty, topic, language } = req.body;
    const userId = req.userId;

    if (!difficulty || !topic) {
      return res
        .status(400)
        .json({ error: "Difficulty and topic are required" });
    }

    const challengeData = await generateCodingChallenge(
      difficulty,
      topic,
      language || "JavaScript"
    );

    // Save to database
    const challenge = await Challenge.create({
      userId,
      challengeData,
      status: "not_started",
    });

    res.json({
      challengeId: challenge._id,
      challenge: challengeData,
    });
  })
);

/**
 * Get available topics
 */
router.get(
  "/practice/topics",
  asyncHandler(async (req, res) => {
    const topics = getTopics();
    res.json({ topics });
  })
);

/**
 * Get user's challenges
 */
router.get(
  "/practice/challenges",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { status, limit = 20 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const challenges = await Challenge.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ challenges });
  })
);

/**
 * Get specific challenge
 */
router.get(
  "/practice/challenges/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    // Try to find by MongoDB _id first, then by challengeData.id
    let challenge = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      challenge = await Challenge.findOne({ _id: id, userId });
    }
    if (!challenge) {
      challenge = await Challenge.findOne({ "challengeData.id": id, userId });
    }

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    res.json({ challenge });
  })
);

/**
 * Submit solution for evaluation
 */
router.post(
  "/practice/challenges/:id/submit",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code } = req.body;
    const userId = req.userId;

    // Try to find by MongoDB _id first, then by challengeData.id
    let challenge = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      challenge = await Challenge.findOne({ _id: id, userId });
    }
    if (!challenge) {
      challenge = await Challenge.findOne({ "challengeData.id": id, userId });
    }

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Evaluate solution
    const evaluation = await evaluateSolution(
      challenge.challengeData,
      code,
      challenge.challengeData.language
    );

    // Update challenge
    challenge.userCode = code;
    challenge.evaluation = evaluation;
    challenge.attempts += 1;
    challenge.score = evaluation.score;

    if (evaluation.passed && challenge.status !== "completed") {
      challenge.status = "completed";
      challenge.completedAt = new Date();
    } else if (challenge.status === "not_started") {
      challenge.status = "in_progress";
    }

    await challenge.save();

    res.json({
      evaluation,
      challenge: {
        id: challenge._id,
        status: challenge.status,
        score: challenge.score,
        attempts: challenge.attempts,
      },
    });
  })
);

/**
 * Get hint for challenge
 */
router.post(
  "/practice/challenges/:id/hint",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { hintLevel, currentCode } = req.body;
    const userId = req.userId;

    // Try to find by MongoDB _id first, then by challengeData.id
    let challenge = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      challenge = await Challenge.findOne({ _id: id, userId });
    }
    if (!challenge) {
      challenge = await Challenge.findOne({ "challengeData.id": id, userId });
    }

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const hint = await getHint(
      challenge.challengeData,
      currentCode || challenge.userCode,
      hintLevel || 1
    );

    res.json({ hint });
  })
);

/**
 * Get similar challenges
 */
router.get(
  "/practice/challenges/:id/similar",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { count = 3 } = req.query;

    // Try to find by MongoDB _id first, then by challengeData.id
    let challenge = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      challenge = await Challenge.findOne({ _id: id, userId });
    }
    if (!challenge) {
      challenge = await Challenge.findOne({ "challengeData.id": id, userId });
    }

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const similarChallenges = await generateSimilarChallenges(
      challenge.challengeData,
      parseInt(count)
    );

    res.json({ similarChallenges });
  })
);

/**
 * Get solution explanation
 */
router.get(
  "/practice/challenges/:id/solution",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    // Try to find by MongoDB _id first, then by challengeData.id
    let challenge = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      challenge = await Challenge.findOne({ _id: id, userId });
    }
    if (!challenge) {
      challenge = await Challenge.findOne({ "challengeData.id": id, userId });
    }

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const explanation = await explainSolution(challenge.challengeData);

    res.json({
      solution: challenge.challengeData.solution,
      explanation,
    });
  })
);

/**
 * Create learning path
 */
router.post(
  "/practice/learning-path",
  asyncHandler(async (req, res) => {
    const { userLevel, goals } = req.body;
    const userId = req.userId;

    if (!userLevel) {
      return res.status(400).json({ error: "User level is required" });
    }

    const pathData = await generateLearningPath(userLevel, goals || []);

    // Save learning path
    const learningPath = await LearningPath.create({
      userId,
      userLevel,
      goals: goals || [],
      path: pathData,
    });

    res.json({
      learningPathId: learningPath._id,
      path: pathData,
    });
  })
);

/**
 * Get user's learning path
 */
router.get(
  "/practice/learning-path",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const learningPath = await LearningPath.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!learningPath) {
      return res.status(404).json({ error: "No learning path found" });
    }

    res.json({ learningPath });
  })
);

/**
 * Update learning path progress
 */
router.patch(
  "/practice/learning-path/:id/progress",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { currentWeek, completedChallenges } = req.body;
    const userId = req.userId;

    const learningPath = await LearningPath.findOne({ _id: id, userId });
    if (!learningPath) {
      return res.status(404).json({ error: "Learning path not found" });
    }

    if (currentWeek) learningPath.currentWeek = currentWeek;
    if (completedChallenges !== undefined)
      learningPath.completedChallenges = completedChallenges;

    // Calculate progress
    const totalChallenges = learningPath.path.totalChallenges || 100;
    learningPath.progress =
      (learningPath.completedChallenges / totalChallenges) * 100;
    learningPath.updatedAt = new Date();

    await learningPath.save();

    res.json({ learningPath });
  })
);

/**
 * Get practice statistics
 */
router.get(
  "/practice/stats",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const totalChallenges = await Challenge.countDocuments({ userId });
    const completedChallenges = await Challenge.countDocuments({
      userId,
      status: "completed",
    });
    const inProgress = await Challenge.countDocuments({
      userId,
      status: "in_progress",
    });

    const challenges = await Challenge.find({
      userId,
      score: { $exists: true },
    });
    const avgScore =
      challenges.length > 0
        ? challenges.reduce((sum, c) => sum + (c.score || 0), 0) /
          challenges.length
        : 0;

    // Group by difficulty
    const byDifficulty = await Challenge.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$challengeData.difficulty",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Group by topic
    const byTopic = await Challenge.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$challengeData.topic",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      overview: {
        totalChallenges,
        completedChallenges,
        inProgress,
        avgScore: Math.round(avgScore),
        completionRate:
          totalChallenges > 0
            ? Math.round((completedChallenges / totalChallenges) * 100)
            : 0,
      },
      byDifficulty,
      byTopic,
    });
  })
);

/**
 * Get AI code review for any code
 */
router.post(
  "/practice/code-review",
  asyncHandler(async (req, res) => {
    const { code, language, focusArea } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const { getPersonalizedCodeReview } = await import(
      "../services/challengeGenerator.js"
    );
    const review = await getPersonalizedCodeReview(code, language, focusArea);

    res.json({ review });
  })
);

export default router;
