import { useState, useEffect } from "react";
import {
  Code2,
  Trophy,
  TrendingUp,
  BookOpen,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Github,
  GitBranch,
  Settings,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import AdvancedCodeEditor from "../components/AdvancedCodeEditor";
import api from "../api";
import toast from "react-hot-toast";

/**
 * LeetCode-style Practice Platform
 */
export default function Practice() {
  const [view, setView] = useState("browse"); // browse, challenge, stats
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [challenge, setChallenge] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState(null);

  // GitHub Integration
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState(null);
  const [showGithubSetup, setShowGithubSetup] = useState(false);
  const [autoPushEnabled, setAutoPushEnabled] = useState(false);

  useEffect(() => {
    loadTopics();
    loadStats();
    loadChallenges();
    checkGitHubConnection();
  }, []);

  const loadTopics = async () => {
    try {
      const { data } = await api.get("/practice/topics");
      setTopics(data.topics);
    } catch (error) {
      console.error("Failed to load topics:", error);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get("/practice/stats");
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadChallenges = async () => {
    try {
      const { data } = await api.get("/practice/challenges?limit=10");
      setChallenges(data.challenges);
    } catch (error) {
      console.error("Failed to load challenges:", error);
    }
  };

  const checkGitHubConnection = async () => {
    try {
      const { data } = await api.get("/github/repos");
      if (data.repos && Array.isArray(data.repos)) {
        setGithubConnected(true);
        setGithubRepos(data.repos);

        // Load saved preference
        const savedRepo = localStorage.getItem("practice_github_repo");
        if (savedRepo) {
          const repo = JSON.parse(savedRepo);
          setSelectedGithubRepo(repo);
          setAutoPushEnabled(true);
        }
      }
    } catch (error) {
      console.log("GitHub not connected:", error);
    }
  };

  const connectGitHub = async () => {
    const token = prompt(
      "Enter your GitHub Personal Access Token:\n\n" +
        "1. Go to GitHub Settings > Developer settings > Personal access tokens\n" +
        "2. Generate new token (classic)\n" +
        "3. Select scopes: repo, workflow\n" +
        "4. Copy and paste the token here"
    );

    if (!token) return;

    setLoading(true);
    try {
      const { data } = await api.post("/github/connect", {
        accessToken: token,
      });

      if (data.success) {
        setGithubConnected(true);
        toast.success("GitHub connected! Loading repositories...");
        setShowGithubSetup(true);

        // Fetch repositories
        const reposResponse = await api.get("/github/repos");
        if (reposResponse.data.repos) {
          setGithubRepos(reposResponse.data.repos);
          toast.success(
            `Found ${reposResponse.data.repos.length} repositories!`
          );
        }
      }
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      toast.error("Failed to connect GitHub. Please check your token.");
    } finally {
      setLoading(false);
    }
  };

  const selectRepository = (repo) => {
    setSelectedGithubRepo(repo);
    localStorage.setItem("practice_github_repo", JSON.stringify(repo));
    toast.success(`Selected: ${repo.name}`);
  };

  const pushCodeToGitHub = async (code, metadata) => {
    if (!selectedGithubRepo || !autoPushEnabled) return null;

    try {
      const fileName = `${metadata.challengeTitle.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${Date.now()}.${
        selectedLanguage === "javascript"
          ? "js"
          : selectedLanguage === "python"
          ? "py"
          : selectedLanguage === "java"
          ? "java"
          : selectedLanguage === "cpp"
          ? "cpp"
          : selectedLanguage === "typescript"
          ? "ts"
          : selectedLanguage === "go"
          ? "go"
          : selectedLanguage === "rust"
          ? "rs"
          : "txt"
      }`;

      const commitMessage = `✅ ${metadata.challengeTitle} - Score: ${
        metadata.score
      }/100

Difficulty: ${metadata.challengeDifficulty}
Topic: ${metadata.challengeTopic}
Language: ${selectedLanguage}
Tests Passed: ${metadata.testsPassed ? "Yes" : "No"}

${metadata.testsPassed ? "🎉 All tests passed!" : "⚠️ Some tests failed"}

Generated by CodeReview.AI Practice Platform
Challenge ID: ${metadata.challengeId}`;

      const fileContent = `/*
 * Challenge: ${metadata.challengeTitle}
 * Difficulty: ${metadata.challengeDifficulty}
 * Topic: ${metadata.challengeTopic}
 * Score: ${metadata.score}/100
 * Tests Passed: ${metadata.testsPassed ? "Yes" : "No"}
 * Date: ${new Date().toISOString()}
 * 
 * Generated by CodeReview.AI
 */

${code}`;

      // Parse owner and repo from fullName (format: "owner/repo")
      const [owner, repo] = selectedGithubRepo.fullName.split("/");

      if (!owner || !repo) {
        toast.error("Invalid repository format");
        return null;
      }

      const { data } = await api.post(`/github/repos/${owner}/${repo}/push`, {
        files: [
          {
            path: `practice/${fileName}`,
            content: fileContent,
          },
        ],
        message: commitMessage,
      });

      if (data.commit) {
        toast.success("Code pushed to GitHub! 🚀");
        return data.commit;
      }
    } catch (error) {
      console.error("Failed to push to GitHub:", error);
      toast.error("Failed to push code to GitHub");
      return null;
    }
  };

  const generateChallenge = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    setLoading(true);
    try {
      const languageMap = {
        javascript: "JavaScript",
        python: "Python",
        java: "Java",
        cpp: "C++",
        go: "Go",
        rust: "Rust",
        typescript: "TypeScript",
      };

      const { data } = await api.post("/practice/generate", {
        difficulty: selectedDifficulty,
        topic: selectedTopic.name,
        language: languageMap[selectedLanguage] || "JavaScript",
      });

      setChallenge(data.challenge);
      setUserCode(data.challenge.starterCode);
      setEvaluation(null);
      setHintLevel(0);
      setShowHint(false);
      setView("challenge");
      toast.success("Challenge generated!");
    } catch (error) {
      console.error("Failed to generate challenge:", error);
      toast.error("Failed to generate challenge");
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    if (!challenge || !userCode) {
      toast.error("Please write some code first");
      return;
    }

    setLoading(true);
    try {
      // First, evaluate the solution
      const { data } = await api.post(
        `/practice/challenges/${challenge.id}/submit`,
        {
          code: userCode,
        }
      );

      setEvaluation(data.evaluation);

      // Then, perform code analysis and save to database
      try {
        const languageMap = {
          javascript: "JavaScript",
          python: "Python",
          java: "Java",
          cpp: "C++",
          go: "Go",
          rust: "Rust",
          typescript: "TypeScript",
        };

        const analysisResponse = await api.post("/analysis", {
          code: userCode,
          language:
            languageMap[selectedLanguage] || challenge.language || "JavaScript",
          metadata: {
            source: "practice",
            challengeTitle: challenge.title,
            challengeTopic: challenge.topic,
            challengeDifficulty: challenge.difficulty,
            challengeId: challenge.id,
            testsPassed: data.evaluation.passed,
            score: data.evaluation.score,
          },
        });

        // Store analysis ID with evaluation
        let githubCommit = null;

        // Push to GitHub if enabled
        if (autoPushEnabled && selectedGithubRepo) {
          githubCommit = await pushCodeToGitHub(userCode, {
            challengeTitle: challenge.title,
            challengeTopic: challenge.topic,
            challengeDifficulty: challenge.difficulty,
            challengeId: challenge.id,
            testsPassed: data.evaluation.passed,
            score: data.evaluation.score,
          });
        }

        setEvaluation({
          ...data.evaluation,
          analysisId: analysisResponse.data._id,
          githubCommit: githubCommit,
        });

        const message = data.evaluation.passed
          ? "🎉 All tests passed! Code analysis complete."
          : "Tests completed. Check analysis results.";

        if (githubCommit) {
          toast.success(`${message} Pushed to GitHub! 🚀`);
        } else {
          toast.success(message);
        }
      } catch (analysisError) {
        console.error("Code analysis failed:", analysisError);
        // Don't fail the submission if analysis fails
        if (data.evaluation.passed) {
          toast.success("🎉 All tests passed!");
        } else {
          toast.error("Some tests failed. Keep trying!");
        }
      }
    } catch (error) {
      console.error("Failed to submit solution:", error);
      toast.error("Failed to evaluate solution");
    } finally {
      setLoading(false);
    }
  };

  const getHintForChallenge = async () => {
    const nextLevel = hintLevel + 1;
    if (nextLevel > 3) {
      toast.error("No more hints available");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/practice/challenges/${challenge.id}/hint`,
        {
          hintLevel: nextLevel,
          currentCode: userCode,
        }
      );

      setHint(data.hint);
      setHintLevel(nextLevel);
      setShowHint(true);
    } catch (error) {
      console.error("Failed to get hint:", error);
      toast.error("Failed to get hint");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "text-green-400 bg-green-500/20 border-green-500/30",
      Medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
      Hard: "text-red-400 bg-red-500/20 border-red-500/30",
    };
    return (
      colors[difficulty] || "text-light-200 bg-dark-300 border-light-200/10"
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Code Practice
          </h1>
          <p className="text-light-200">
            Master coding skills with AI-generated challenges
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("browse")}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === "browse"
                ? "bg-primary text-white"
                : "glass text-light-200 hover:bg-dark-300"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setView("stats")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              view === "stats"
                ? "bg-primary text-white"
                : "glass text-light-200 hover:bg-dark-300"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Stats
          </button>
        </div>
      </motion.div>

      {/* Browse View */}
      {view === "browse" && (
        <div className="space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-lg p-6 border border-light-200/10"
              >
                <div className="text-light-200 text-sm mb-1">Total Solved</div>
                <div className="text-3xl font-bold text-white">
                  {stats.overview.completedChallenges}
                </div>
                <div className="text-xs text-light-200 mt-1">
                  of {stats.overview.totalChallenges}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-lg p-6 border border-light-200/10"
              >
                <div className="text-light-200 text-sm mb-1">Avg Score</div>
                <div className="text-3xl font-bold text-primary">
                  {stats.overview.avgScore}
                </div>
                <div className="text-xs text-light-200 mt-1">out of 100</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-lg p-6 border border-light-200/10"
              >
                <div className="text-light-200 text-sm mb-1">
                  Completion Rate
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {stats.overview.completionRate}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-lg p-6 border border-light-200/10"
              >
                <div className="text-light-200 text-sm mb-1">In Progress</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.overview.inProgress}
                </div>
              </motion.div>
            </div>
          )}

          {/* GitHub Integration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-6 border border-light-200/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Github className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">
                  GitHub Integration
                </h2>
              </div>
              {githubConnected && (
                <button
                  onClick={() => setShowGithubSetup(!showGithubSetup)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-dark-300 hover:bg-dark-200 text-light-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              )}
            </div>

            {!githubConnected ? (
              <div className="text-center py-8">
                <Github className="w-16 h-16 text-light-200 mx-auto mb-4" />
                <p className="text-light-200 mb-4">
                  Connect GitHub to automatically save your solutions
                </p>
                <button
                  onClick={connectGitHub}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  Connect GitHub
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-light-200">Connected to GitHub</span>
                </div>

                {/* Repository Selection */}
                {(showGithubSetup || !selectedGithubRepo) && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-light-200">
                      Select Repository for Code Submissions
                    </label>

                    {githubRepos.length === 0 ? (
                      <p className="text-sm text-light-200">
                        No repositories found. Create one first!
                      </p>
                    ) : (
                      <select
                        value={selectedGithubRepo?.id || ""}
                        onChange={(e) => {
                          const repo = githubRepos.find(
                            (r) => r.id === parseInt(e.target.value)
                          );
                          if (repo) selectRepository(repo);
                        }}
                        className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary hover:border-primary/50 transition-colors cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B5CF6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="" className="bg-dark-300 text-light-200">
                          Choose a repository...
                        </option>
                        {githubRepos.map((repo) => (
                          <option
                            key={repo.id}
                            value={repo.id}
                            className="bg-dark-300 text-white py-2"
                          >
                            {repo.private ? "🔒 " : "🌍 "}
                            {repo.fullName}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Auto-push Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPushEnabled}
                        onChange={(e) => setAutoPushEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-light-200/20 bg-dark-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-light-200">
                        Automatically push solutions after submission
                      </span>
                    </label>
                  </div>
                )}

                {/* Selected Repository Info */}
                {selectedGithubRepo && !showGithubSetup && (
                  <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {selectedGithubRepo.name}
                        </div>
                        <div className="text-light-200 text-xs">
                          {selectedGithubRepo.fullName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {autoPushEnabled && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Auto-push ON
                        </span>
                      )}
                      <a
                        href={selectedGithubRepo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Challenge Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-6 border border-light-200/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Generate New Challenge
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-light-200 mb-2">
                  Select Topic
                </label>
                <select
                  value={selectedTopic?.name || ""}
                  onChange={(e) => {
                    const topic = topics.find((t) => t.name === e.target.value);
                    setSelectedTopic(topic);
                  }}
                  className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Choose a topic...</option>
                  {topics.map((topic) => (
                    <option key={topic.name} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-light-200 mb-2">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-light-200 mb-2">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-all ${
                        selectedDifficulty === diff
                          ? getDifficultyColor(diff)
                          : "bg-dark-300 text-light-200 border-light-200/20 hover:bg-dark-200"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generateChallenge}
              disabled={loading || !selectedTopic}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>Generating...</>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Challenge
                </>
              )}
            </button>
          </motion.div>

          {/* Recent Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-6 border border-light-200/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Challenges
            </h2>

            <div className="space-y-3">
              {challenges.map((ch) => (
                <div
                  key={ch._id}
                  onClick={() => {
                    setChallenge(ch.challengeData);
                    setUserCode(ch.userCode || ch.challengeData.starterCode);
                    setEvaluation(ch.evaluation);
                    setView("challenge");
                  }}
                  className="flex items-center justify-between p-4 bg-dark-300 border border-light-200/20 rounded-lg hover:bg-dark-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    {ch.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : ch.status === "in_progress" ? (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-light-200" />
                    )}

                    <div>
                      <div className="font-medium text-white">
                        {ch.challengeData.title}
                      </div>
                      <div className="text-sm text-light-200">
                        {ch.challengeData.topic} • {ch.attempts} attempts
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                        ch.challengeData.difficulty
                      )}`}
                    >
                      {ch.challengeData.difficulty}
                    </span>
                    {ch.score !== undefined && (
                      <span className="text-sm font-medium text-light-200">
                        Score: {ch.score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Challenge View */}
      {view === "challenge" && challenge && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-lg p-6 border border-light-200/10 overflow-auto max-h-[calc(100vh-200px)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {challenge.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                  challenge.difficulty
                )}`}
              >
                {challenge.difficulty}
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-light-200 mb-4 whitespace-pre-wrap">
                {challenge.description}
              </div>

              {challenge.examples && challenge.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-2">Examples:</h3>
                  {challenge.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-dark-300 rounded p-4 mb-3 border border-light-200/10"
                    >
                      <div className="text-sm">
                        <div className="text-light-200">
                          Input:{" "}
                          <span className="text-white font-mono">
                            {ex.input}
                          </span>
                        </div>
                        <div className="text-light-200">
                          Output:{" "}
                          <span className="text-white font-mono">
                            {ex.output}
                          </span>
                        </div>
                        {ex.explanation && (
                          <div className="text-light-200 mt-2">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {challenge.constraints && challenge.constraints.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-2">
                    Constraints:
                  </h3>
                  <ul className="list-disc list-inside text-light-200 text-sm">
                    {challenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {showHint && hint && (
                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    Hint Level {hintLevel}:
                  </h3>
                  <p className="text-yellow-200">{hint.hint}</p>
                  {hint.approach && (
                    <p className="text-yellow-300 text-sm mt-2">
                      {hint.approach}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={getHintForChallenge}
                  disabled={loading || hintLevel >= 3}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 text-sm transition-all"
                >
                  Get Hint ({hintLevel}/3)
                </button>
              </div>
            </div>
          </motion.div>

          {/* Code Editor + Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex-1">
              <AdvancedCodeEditor
                initialCode={userCode}
                language={challenge.language?.toLowerCase() || selectedLanguage}
                onCodeChange={setUserCode}
              />
            </div>

            <button
              onClick={submitSolution}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "Evaluating..." : "Submit Solution"}
            </button>

            {/* Evaluation Results */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-6 border-2 ${
                  evaluation.passed
                    ? "bg-green-500/10 border-green-500"
                    : "bg-red-500/10 border-red-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {evaluation.passed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <h3 className="text-xl font-bold text-white">
                    {evaluation.passed
                      ? "All Tests Passed!"
                      : "Some Tests Failed"}
                  </h3>
                </div>

                <div className="space-y-2 text-sm text-light-200">
                  <div>
                    Score:{" "}
                    <span className="font-bold text-white">
                      {evaluation.score}/100
                    </span>
                  </div>
                  <div>Time: {evaluation.timeComplexity}</div>
                  <div>Space: {evaluation.spaceComplexity}</div>
                </div>

                {evaluation.feedback && (
                  <div className="mt-4 text-sm text-light-200">
                    {evaluation.feedback}
                  </div>
                )}

                {/* Links to Analysis and GitHub */}
                {(evaluation.analysisId || evaluation.githubCommit) && (
                  <div className="mt-4 pt-4 border-t border-light-200/20 flex flex-wrap gap-3">
                    {evaluation.analysisId && (
                      <a
                        href={`/analyze/${evaluation.analysisId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Code2 className="w-4 h-4" />
                        View Detailed Analysis
                      </a>
                    )}

                    {evaluation.githubCommit && (
                      <a
                        href={evaluation.githubCommit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-dark-300 hover:bg-dark-200 text-white rounded-lg transition-colors text-sm font-medium border border-light-200/20"
                      >
                        <Github className="w-4 h-4" />
                        View on GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Stats View */}
      {view === "stats" && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass rounded-lg p-6 border border-light-200/10">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Your Progress
            </h2>

            {/* By Difficulty */}
            <div className="mb-8">
              <h3 className="font-semibold text-white mb-4">By Difficulty</h3>
              <div className="space-y-3">
                {stats.byDifficulty.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-24 font-medium text-light-200">
                      {item._id}:
                    </div>
                    <div className="flex-1 bg-dark-300 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full flex items-center justify-end pr-2 text-sm font-medium text-white ${
                          item._id === "Easy"
                            ? "bg-green-500"
                            : item._id === "Medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${(item.completed / item.total) * 100}%`,
                        }}
                      >
                        {item.completed}/{item.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Topic */}
            <div>
              <h3 className="font-semibold text-white mb-4">Top Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.byTopic.map((item) => (
                  <div
                    key={item._id}
                    className="bg-dark-300 rounded-lg p-4 border border-light-200/20 hover:bg-dark-200 transition-all"
                  >
                    <div className="font-medium text-white mb-2">
                      {item._id}
                    </div>
                    <div className="text-sm text-light-200">
                      {item.completed}/{item.total} solved
                    </div>
                    {item.avgScore > 0 && (
                      <div className="text-sm text-primary font-medium mt-1">
                        Avg: {Math.round(item.avgScore)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
