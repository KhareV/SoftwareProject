// ========== DATE & TIME ==========

export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return "N/A";

  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

// ========== NUMBER FORMATTING ==========

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("en-US");
};

export const formatPercentage = (num) => {
  if (num === null || num === undefined) return "0%";
  return `${Math.round(num)}%`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

// ========== CONSTANTS ==========

export const SEVERITY_COLORS = {
  Critical: "#DC2626",
  High: "#F59E0B",
  Medium: "#F97316",
  Low: "#10B981",
};

export const SEVERITY_BG_COLORS = {
  Critical: "rgba(220, 38, 38, 0.1)",
  High: "rgba(245, 158, 11, 0.1)",
  Medium: "rgba(249, 115, 22, 0.1)",
  Low: "rgba(16, 185, 129, 0.1)",
};

export const LANGUAGE_LIST = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Scala",
  "R",
  "SQL",
  "HTML",
  "CSS",
  "Shell",
  "Dart",
  "Objective-C",
];

export const OWASP_CATEGORIES = {
  A01_BrokenAccessControl: "A01: Broken Access Control",
  A02_CryptographicFailures: "A02: Cryptographic Failures",
  A03_Injection: "A03: Injection",
  A04_InsecureDesign: "A04: Insecure Design",
  A05_SecurityMisconfiguration: "A05: Security Misconfiguration",
  A06_VulnerableComponents: "A06: Vulnerable Components",
  A07_IdentificationFailures: "A07: Identification Failures",
  A08_SoftwareDataIntegrity: "A08: Software & Data Integrity",
  A09_SecurityLoggingFailures: "A09: Security Logging Failures",
  A10_SSRF: "A10: Server-Side Request Forgery",
};

export const SUGGESTION_TYPES = {
  refactoring: { label: "Refactoring", color: "#3B82F6" },
  performance: { label: "Performance", color: "#06B6D4" },
  security: { label: "Security", color: "#DC2626" },
  style: { label: "Style", color: "#8B5CF6" },
  documentation: { label: "Documentation", color: "#10B981" },
};

// ========== SCORE HELPERS ==========

export const getScoreColor = (score) => {
  if (score >= 80) return "#10B981"; // Green
  if (score >= 60) return "#F59E0B"; // Yellow
  if (score >= 40) return "#F97316"; // Orange
  return "#DC2626"; // Red
};

export const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
};

export const getSeverityBadgeColor = (severity) => {
  const colors = {
    Critical: "bg-red-500/20 text-red-300 border-red-500/30",
    High: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    Medium: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Low: "bg-green-500/20 text-green-300 border-green-500/30",
  };
  return colors[severity] || colors.Low;
};

// ========== SCORE CALCULATION ==========

export const calculateOverallScore = (
  qualityScore,
  securityScore,
  performanceScore = 70
) => {
  const weights = {
    quality: 0.4,
    security: 0.4,
    performance: 0.2,
  };

  const overall =
    qualityScore * weights.quality +
    securityScore * weights.security +
    performanceScore * weights.performance;

  return Math.round(overall);
};

// ========== VULNERABILITY HELPERS ==========

export const countVulnerabilitiesBySeverity = (vulnerabilities) => {
  return vulnerabilities.reduce(
    (acc, vuln) => {
      acc[vuln.severity.toLowerCase()] =
        (acc[vuln.severity.toLowerCase()] || 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
};

export const getVulnerabilityStats = (vulnerabilities) => {
  const counts = countVulnerabilitiesBySeverity(vulnerabilities);
  return [
    {
      severity: "Critical",
      count: counts.critical,
      color: SEVERITY_COLORS.Critical,
    },
    { severity: "High", count: counts.high, color: SEVERITY_COLORS.High },
    { severity: "Medium", count: counts.medium, color: SEVERITY_COLORS.Medium },
    { severity: "Low", count: counts.low, color: SEVERITY_COLORS.Low },
  ];
};

// ========== CODE HELPERS ==========

export const getLanguageFromFileName = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    cs: "C#",
    php: "PHP",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    swift: "Swift",
    kt: "Kotlin",
    scala: "Scala",
  };
  return map[ext] || "JavaScript";
};

export const truncateCode = (code, maxLines = 20) => {
  const lines = code.split("\n");
  if (lines.length <= maxLines) return code;
  return lines.slice(0, maxLines).join("\n") + "\n... (truncated)";
};

// ========== LOCAL STORAGE ==========

export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

// ========== DEBOUNCE ==========

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ========== COPY TO CLIPBOARD ==========

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};
