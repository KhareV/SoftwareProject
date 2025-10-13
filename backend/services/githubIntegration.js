import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

/**
 * GitHub Integration Service
 * Create repos, push code, analyze commits, manage webhooks
 */

/**
 * Create authenticated Octokit instance
 */
function getOctokit(userToken) {
  return new Octokit({
    auth: userToken || process.env.GITHUB_TOKEN,
  });
}

/**
 * Create a new GitHub repository
 */
export async function createGitHubRepo(userToken, repoData) {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: repoData.name,
      description: repoData.description || "Created by CodeReview.AI",
      private: repoData.private !== false,
      auto_init: true,
      gitignore_template: repoData.language || "Node",
    });

    return {
      success: true,
      repo: {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        url: data.html_url,
        cloneUrl: data.clone_url,
        sshUrl: data.ssh_url,
        defaultBranch: data.default_branch,
      },
    };
  } catch (error) {
    console.error("GitHub repo creation error:", error);

    // Handle specific error cases
    let errorMessage = error.message;

    if (error.status === 422) {
      // Check if it's a duplicate name error
      const errors = error.response?.data?.errors || [];
      const nameError = errors.find(
        (e) => e.field === "name" && e.code === "custom"
      );

      if (nameError && nameError.message.includes("already exists")) {
        errorMessage = `A repository named "${repoData.name}" already exists on your account. Please choose a different name.`;
      } else {
        errorMessage =
          "Repository validation failed. Please check the repository details.";
      }
    } else if (error.status === 401) {
      errorMessage =
        "GitHub authentication failed. Please reconnect your GitHub account.";
    } else if (error.status === 403) {
      errorMessage =
        "You do not have permission to create repositories. Please check your GitHub token permissions.";
    }

    return {
      success: false,
      error: errorMessage,
      status: error.status,
    };
  }
}

/**
 * Push code to GitHub repository
 */
export async function pushCodeToRepo(
  userToken,
  owner,
  repo,
  files,
  commitMessage = "Update code"
) {
  const octokit = getOctokit(userToken);

  try {
    // Get default branch
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    // Get latest commit SHA
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const latestCommitSha = refData.object.sha;

    // Get base tree
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const tree = await Promise.all(
      files.map(async (file) => {
        const { data: blobData } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString("base64"),
          encoding: "base64",
        });

        return {
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        };
      })
    );

    // Create new tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree,
    });

    // Create commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // Update reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
    });

    return {
      success: true,
      commit: {
        sha: newCommit.sha,
        html_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
        url: newCommit.url,
        message: commitMessage,
      },
    };
  } catch (error) {
    console.error("GitHub push error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user's GitHub repositories
 */
export async function getUserRepos(userToken, page = 1, perPage = 30) {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      page,
      per_page: perPage,
      sort: "updated",
      direction: "desc",
    });

    return {
      success: true,
      repos: data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        private: repo.private,
        updatedAt: repo.updated_at,
      })),
    };
  } catch (error) {
    console.error("GitHub repos fetch error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get repository contents
 */
export async function getRepoContents(userToken, owner, repo, path = "") {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    return {
      success: true,
      contents: Array.isArray(data) ? data : [data],
    };
  } catch (error) {
    console.error("GitHub contents fetch error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get file content from repository
 */
export async function getFileContent(userToken, owner, repo, path) {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (data.type !== "file") {
      throw new Error("Path is not a file");
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      success: true,
      file: {
        name: data.name,
        path: data.path,
        content,
        size: data.size,
        sha: data.sha,
        url: data.html_url,
      },
    };
  } catch (error) {
    console.error("GitHub file fetch error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create or update file in repository
 */
export async function createOrUpdateFile(
  userToken,
  owner,
  repo,
  path,
  content,
  message,
  sha = null
) {
  const octokit = getOctokit(userToken);

  try {
    const params = {
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
    };

    if (sha) {
      params.sha = sha; // Update existing file
    }

    const { data } = await octokit.repos.createOrUpdateFileContents(params);

    return {
      success: true,
      commit: {
        sha: data.commit.sha,
        url: data.commit.html_url,
      },
      content: data.content,
    };
  } catch (error) {
    console.error("GitHub file update error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create webhook for repository
 */
export async function createWebhook(userToken, owner, repo, webhookUrl) {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: process.env.GITHUB_WEBHOOK_SECRET,
      },
      events: ["push", "pull_request"],
    });

    return {
      success: true,
      webhook: {
        id: data.id,
        url: data.config.url,
        events: data.events,
        active: data.active,
      },
    };
  } catch (error) {
    console.error("GitHub webhook creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Analyze repository
 */
export async function analyzeRepository(
  userToken,
  owner,
  repo,
  fileExtensions = [".js", ".ts", ".jsx", ".tsx"]
) {
  const octokit = getOctokit(userToken);

  try {
    // Get repository tree
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: repoData.default_branch,
      recursive: true,
    });

    // Filter code files
    const codeFiles = treeData.tree.filter(
      (item) =>
        item.type === "blob" &&
        fileExtensions.some((ext) => item.path.endsWith(ext))
    );

    // Fetch file contents (limit to prevent timeout)
    const maxFiles = 20;
    const filesToAnalyze = codeFiles.slice(0, maxFiles);

    const filesWithContent = await Promise.all(
      filesToAnalyze.map(async (file) => {
        try {
          const result = await getFileContent(
            userToken,
            owner,
            repo,
            file.path
          );
          if (result.success) {
            return result.file;
          }
          return null;
        } catch (error) {
          console.error(`Failed to fetch ${file.path}:`, error);
          return null;
        }
      })
    );

    return {
      success: true,
      repository: {
        name: repoData.name,
        fullName: repoData.full_name,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
      },
      files: filesWithContent.filter((f) => f !== null),
      totalCodeFiles: codeFiles.length,
      analyzedFiles: filesWithContent.filter((f) => f !== null).length,
    };
  } catch (error) {
    console.error("Repository analysis error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get commit history
 */
export async function getCommitHistory(userToken, owner, repo, limit = 10) {
  const octokit = getOctokit(userToken);

  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: limit,
    });

    return {
      success: true,
      commits: data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      })),
    };
  } catch (error) {
    console.error("Commit history fetch error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
