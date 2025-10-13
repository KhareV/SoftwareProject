import { useState, useEffect } from "react";
import {
  Github,
  GitBranch,
  GitCommit,
  Upload,
  Download,
  Settings,
  Trash2,
  RefreshCw,
  Code,
  BarChart,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";
import toast from "react-hot-toast";

/**
 * GitHub Integration Page - Connect GitHub, manage repos, push code, analyze
 */
export default function GitHubIntegration() {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoContents, setRepoContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [pushData, setPushData] = useState({
    path: "",
    content: "",
    message: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [commits, setCommits] = useState([]);
  const [showWebhookSetup, setShowWebhookSetup] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadRepoContents(selectedRepo);
      loadCommits(selectedRepo);
    }
  }, [selectedRepo]);

  const checkConnection = async () => {
    try {
      const { data } = await api.get("/github/repos");
      if (data.success && data.integration) {
        setConnected(true);
        setUsername(data.integration.username);
        setRepositories(data.repositories);
      }
    } catch (error) {
      console.error("Not connected:", error);
    }
  };

  const connectGitHub = async () => {
    const token = prompt("Enter your GitHub Personal Access Token:");
    if (!token) return;

    setLoading(true);
    try {
      const { data } = await api.post("/github/connect", {
        accessToken: token,
      });

      if (data.success) {
        setConnected(true);
        setUsername(data.integration.username);
        toast.success("GitHub connected successfully!");
        loadRepositories();
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Failed to connect GitHub");
    } finally {
      setLoading(false);
    }
  };

  const disconnectGitHub = async () => {
    if (!confirm("Are you sure you want to disconnect GitHub?")) return;

    setLoading(true);
    try {
      await api.delete("/github/disconnect");
      setConnected(false);
      setUsername("");
      setRepositories([]);
      setSelectedRepo(null);
      toast.success("GitHub disconnected");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/github/repos");
      if (data.success) {
        setRepositories(data.repositories);
      }
    } catch (error) {
      console.error("Failed to load repos:", error);
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  const createRepository = async () => {
    if (!newRepoName) {
      toast.error("Repository name is required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/github/repos/create", {
        name: newRepoName,
        description: newRepoDescription,
        private: newRepoPrivate,
      });

      toast.success("Repository created successfully!");
      setShowCreateRepo(false);
      setNewRepoName("");
      setNewRepoDescription("");
      setNewRepoPrivate(false);
      loadRepositories();
    } catch (error) {
      console.error("Failed to create repo:", error);

      // Enhanced error handling
      const errorMessage =
        error.response?.data?.error || "Failed to create repository";

      if (errorMessage.includes("already exists")) {
        // Show error with suggestions
        toast.error(
          <div>
            <div className="font-semibold mb-2">{errorMessage}</div>
            <div className="text-sm">Try adding a suffix like:</div>
            <div className="text-xs mt-1">• {newRepoName}-v2</div>
            <div className="text-xs">• {newRepoName}-new</div>
            <div className="text-xs">
              • {newRepoName}-{Date.now().toString().slice(-4)}
            </div>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRepoContents = async (repo) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/github/repos/${repo.owner.login}/${repo.name}/contents`
      );
      if (data.success) {
        setRepoContents(data.contents);
      }
    } catch (error) {
      console.error("Failed to load contents:", error);
      toast.error("Failed to load repository contents");
    } finally {
      setLoading(false);
    }
  };

  const pushCode = async () => {
    if (!pushData.path || !pushData.content || !pushData.message) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/github/repos/${selectedRepo.owner.login}/${selectedRepo.name}/push`,
        {
          path: pushData.path,
          content: pushData.content,
          message: pushData.message,
          branch: "main",
        }
      );

      if (data.success) {
        toast.success("Code pushed successfully!");
        setShowPushDialog(false);
        setPushData({ path: "", content: "", message: "" });
        loadRepoContents(selectedRepo);
      }
    } catch (error) {
      console.error("Failed to push code:", error);
      toast.error("Failed to push code");
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepository = async (repo) => {
    setLoading(true);
    const toastId = toast.loading("Analyzing repository...");

    try {
      const { data } = await api.post(
        `/github/repos/${repo.owner.login}/${repo.name}/analyze`
      );

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Analysis complete!", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to analyze:", error);
      toast.error("Failed to analyze repository", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const loadCommits = async (repo) => {
    try {
      const { data } = await api.get(
        `/github/repos/${repo.owner.login}/${repo.name}/commits`
      );
      if (data.success) {
        setCommits(data.commits);
      }
    } catch (error) {
      console.error("Failed to load commits:", error);
    }
  };

  const setupWebhook = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(
        `/github/repos/${selectedRepo.owner.login}/${selectedRepo.name}/webhook`,
        {
          events: ["push", "pull_request"],
        }
      );

      if (data.success) {
        toast.success("Webhook configured!");
        setShowWebhookSetup(false);
      }
    } catch (error) {
      console.error("Failed to setup webhook:", error);
      toast.error("Failed to configure webhook");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-12 border border-light-200/10 text-center"
          >
            <Github className="w-20 h-20 text-white mx-auto mb-6" />
            <h1 className="text-3xl font-bold gradient-text mb-4">
              Connect GitHub
            </h1>
            <p className="text-light-200 mb-8">
              Connect your GitHub account to push code, manage repositories, and
              analyze your projects.
            </p>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-white mb-3">
                How to create a Personal Access Token:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-light-200">
                <li>
                  Go to GitHub Settings → Developer settings → Personal access
                  tokens
                </li>
                <li>Click "Generate new token (classic)"</li>
                <li>
                  Select scopes:{" "}
                  <code className="bg-dark-300 px-2 py-1 rounded text-primary">
                    repo
                  </code>
                  ,{" "}
                  <code className="bg-dark-300 px-2 py-1 rounded text-primary">
                    admin:repo_hook
                  </code>
                </li>
                <li>Generate token and copy it</li>
              </ol>
            </div>

            <button
              onClick={connectGitHub}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 mx-auto transition-all"
            >
              <Github className="w-5 h-5" />
              {loading ? "Connecting..." : "Connect GitHub"}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <Github className="w-10 h-10 text-primary" />
            GitHub Integration
          </h1>
          <p className="text-light-200">
            Connected as{" "}
            <span className="font-medium text-white">{username}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadRepositories}
            disabled={loading}
            className="px-4 py-2 glass text-light-200 hover:bg-dark-300 rounded-lg flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateRepo(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 transition-all"
          >
            <Github className="w-4 h-4" />
            New Repo
          </button>
          <button
            onClick={disconnectGitHub}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </motion.div>

      {/* Create Repository Dialog */}
      {showCreateRepo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6 border border-light-200/10 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Create New Repository
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-200 mb-2">
                Repository Name *
              </label>
              <input
                type="text"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="my-awesome-project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-200 mb-2">
                Description
              </label>
              <textarea
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
                className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                rows="3"
                placeholder="A brief description of your project"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newRepoPrivate}
                onChange={(e) => setNewRepoPrivate(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-light-200">
                Make this repository private
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createRepository}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-all"
              >
                Create Repository
              </button>
              <button
                onClick={() => {
                  setShowCreateRepo(false);
                  setNewRepoName("");
                  setNewRepoDescription("");
                  setNewRepoPrivate(false);
                }}
                className="px-4 py-2 bg-dark-300 text-light-200 rounded-lg hover:bg-dark-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Push Code Dialog */}
      {showPushDialog && selectedRepo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6 border border-light-200/10 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Push Code to {selectedRepo.name}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-200 mb-2">
                File Path *
              </label>
              <input
                type="text"
                value={pushData.path}
                onChange={(e) =>
                  setPushData({ ...pushData, path: e.target.value })
                }
                className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="src/index.js"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-200 mb-2">
                Code Content *
              </label>
              <textarea
                value={pushData.content}
                onChange={(e) =>
                  setPushData({ ...pushData, content: e.target.value })
                }
                className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary"
                rows="10"
                placeholder="// Your code here"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-200 mb-2">
                Commit Message *
              </label>
              <input
                type="text"
                value={pushData.message}
                onChange={(e) =>
                  setPushData({ ...pushData, message: e.target.value })
                }
                className="w-full bg-dark-300 border border-light-200/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Add new feature"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={pushCode}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Push Code
              </button>
              <button
                onClick={() => {
                  setShowPushDialog(false);
                  setPushData({ path: "", content: "", message: "" });
                }}
                className="px-4 py-2 bg-dark-300 text-light-200 rounded-lg hover:bg-dark-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories List */}
        <div className="lg:col-span-1 glass rounded-lg p-6 border border-light-200/10 h-fit">
          <h2 className="text-xl font-semibold text-white mb-4">
            Repositories ({repositories.length})
          </h2>

          <div className="space-y-2">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedRepo?.id === repo.id
                    ? "border-primary bg-primary/10"
                    : "border-light-200/20 bg-dark-300 hover:bg-dark-200"
                }`}
              >
                <div className="font-medium text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  {repo.name}
                </div>
                <div className="text-sm text-light-200 mt-1">
                  {repo.description || "No description"}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-light-200">
                  <span>{repo.stargazers_count} ⭐</span>
                  <span>{repo.language || "N/A"}</span>
                  {repo.private && (
                    <span className="text-yellow-400">Private</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repository Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRepo ? (
            <>
              {/* Actions */}
              <div className="glass rounded-lg p-6 border border-light-200/10">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Actions
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowPushDialog(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Push Code
                  </button>
                  <button
                    onClick={() => analyzeRepository(selectedRepo)}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    <BarChart className="w-4 h-4" />
                    Analyze
                  </button>
                  <button
                    onClick={() => setShowWebhookSetup(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Setup Webhook
                  </button>
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-dark-300 text-light-200 rounded-lg hover:bg-dark-200 flex items-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </a>
                </div>
              </div>

              {/* Analysis Results */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-lg p-6 border border-light-200/10"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Analysis Results
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-dark-300 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {analysis.overallScore}
                      </div>
                      <div className="text-sm text-light-200 mt-1">
                        Overall Score
                      </div>
                    </div>
                    <div className="text-center p-4 bg-dark-300 rounded-lg">
                      <div className="text-3xl font-bold text-white">
                        {analysis.filesAnalyzed}
                      </div>
                      <div className="text-sm text-light-200 mt-1">
                        Files Analyzed
                      </div>
                    </div>
                    <div className="text-center p-4 bg-dark-300 rounded-lg">
                      <div className="text-3xl font-bold text-red-400">
                        {analysis.criticalIssues}
                      </div>
                      <div className="text-sm text-light-200 mt-1">
                        Critical Issues
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Top Issues:
                      </h3>
                      <div className="space-y-2">
                        {analysis.topIssues?.map((issue, i) => (
                          <div
                            key={i}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                          >
                            <div className="font-medium text-red-400">
                              {issue.title}
                            </div>
                            <div className="text-sm text-red-300">
                              {issue.file}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recent Commits */}
              {commits.length > 0 && (
                <div className="glass rounded-lg p-6 border border-light-200/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <GitCommit className="w-5 h-5" />
                    Recent Commits
                  </h2>
                  <div className="space-y-3">
                    {commits.slice(0, 5).map((commit) => (
                      <div
                        key={commit.sha}
                        className="p-3 bg-dark-300 border border-light-200/20 rounded-lg hover:bg-dark-200 transition-all"
                      >
                        <div className="font-medium text-white">
                          {commit.commit.message}
                        </div>
                        <div className="text-sm text-light-200 mt-1">
                          by {commit.commit.author.name} •{" "}
                          {new Date(
                            commit.commit.author.date
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-light-200 mt-1 font-mono">
                          {commit.sha.slice(0, 7)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass rounded-lg p-12 border border-light-200/10 text-center">
              <Github className="w-16 h-16 text-light-200 mx-auto mb-4" />
              <p className="text-light-200">
                Select a repository to view details and perform actions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
