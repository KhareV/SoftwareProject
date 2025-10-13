import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Play,
  Download,
  Sparkles,
  FileCode,
  CheckCircle,
} from "lucide-react";
import {
  Button,
  Textarea,
  Select,
  Card,
  Loading,
  EmptyState,
} from "../components/Shared";
import CodeViewer from "../components/CodeViewer";
import VulnerabilityCard from "../components/VulnerabilityCard";
import { QualityCircle, ComplexityChart } from "../components/Charts";
import VulnerabilityTreemap from "../components/VulnerabilityTreemap";
import MetricsRadarChart from "../components/MetricsRadarChart";
import { analyzeCode, generatePDFReport } from "../api";
import {
  LANGUAGE_LIST,
  countVulnerabilitiesBySeverity,
  SUGGESTION_TYPES,
} from "../utils";

const Analyze = () => {
  const [code, setCode] = React.useState("");
  const [language, setLanguage] = React.useState("JavaScript");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Please enter some code to analyze");
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeCode(code, language);
      setResult(analysis);
    } catch (error) {
      alert("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const detectLanguageFromFileName = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const languageMap = {
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
    };
    return languageMap[ext] || language;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      setUploadedFileName(file.name);

      // Auto-detect language from file extension
      const detectedLanguage = detectLanguageFromFileName(file.name);
      setLanguage(detectedLanguage);
    };
    reader.onerror = () => {
      alert("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDownloadReport = async () => {
    if (result?._id) {
      try {
        await generatePDFReport(result._id);
      } catch (error) {
        alert("Failed to generate report");
      }
    }
  };

  const vulnCounts = result
    ? countVulnerabilitiesBySeverity(result.vulnerabilities)
    : null;

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow morphing-blob"></div>
        <div
          className="absolute bottom-10 left-10 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow morphing-blob"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-5xl font-bold gradient-text">Code Analysis</h1>
        </div>
        <p className="text-light-300 text-lg">
          Upload or paste your code for AI-powered security and quality analysis
        </p>
      </motion.div>

      {/* Input Section */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
        >
          <Card className="lg:col-span-2 hover-glow relative z-10">
            <div className="mb-6">
              <label className="flex items-center justify-between text-light-100 text-sm font-semibold mb-3">
                <span className="flex items-center">
                  <FileCode className="w-4 h-4 mr-2 text-primary-400" />
                  Code Input
                </span>
                {uploadedFileName && (
                  <span className="text-xs text-primary-400 font-normal flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    {uploadedFileName}
                  </span>
                )}
              </label>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed transition-all duration-300 pointer-events-auto ${
                  isDragging
                    ? "border-primary-400 bg-primary-500/10 scale-[1.01]"
                    : "border-light-200/20 hover:border-primary-400/50"
                }`}
              >
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary-600/20 backdrop-blur-sm rounded-lg">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-primary-400 mx-auto mb-3 animate-bounce" />
                      <p className="text-primary-300 font-semibold text-lg">
                        Drop your file here
                      </p>
                    </div>
                  </div>
                )}

                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code here for AI-powered analysis...&#10;// Or drag and drop a file&#10;&#10;function example() {&#10;  return 'Hello World';&#10;}"
                  rows={20}
                  className="font-mono text-sm border-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt"
                  onChange={handleFileUpload}
                  ref={(input) => {
                    if (input) {
                      window.fileInputRef = input;
                    }
                  }}
                  className="hidden"
                  id="file-upload-input"
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("file-upload-input")?.click()
                  }
                  className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 px-6 py-3 text-base bg-dark-300 hover:bg-dark-200 text-light-100 border border-primary/20 hover:border-primary/40 shadow-lg cursor-pointer z-50"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </button>
                <span className="text-light-300 text-sm">
                  or drag and drop (max 5MB)
                </span>
              </div>

              {code && (
                <button
                  onClick={() => {
                    setCode("");
                    setUploadedFileName(null);
                  }}
                  className="text-light-300 hover:text-red-400 text-sm transition-colors z-50"
                >
                  Clear
                </button>
              )}
            </div>
          </Card>

          <div className="space-y-6 relative z-20">
            <Card className="hover-glow">
              <Select
                label="Programming Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGE_LIST.map((lang) => ({
                  value: lang,
                  label: lang,
                }))}
              />

              <Button
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={!code.trim()}
                icon={Play}
                className="w-full shadow-glow hover:shadow-glow-lg"
              >
                {analyzing ? "Analyzing..." : "Analyze Code"}
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-primary-600/20 to-secondary-500/20 border-primary/30 hover-lift">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-light-100">
                    AI Analysis Includes:
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-light-200">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-3"></span>
                    OWASP Top 10 Security Scan
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mr-3"></span>
                    Code Quality Metrics
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-3"></span>
                    Performance Analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mr-3"></span>
                    AI Improvement Suggestions
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-3"></span>
                    Compliance Checking
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => {
                setResult(null);
                setCode("");
              }}
            >
              New Analysis
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center hover-lift border-red-500/20">
                <div className="text-4xl font-bold bg-gradient-to-br from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                  {vulnCounts.critical}
                </div>
                <div className="text-sm text-light-300 font-medium">
                  Critical
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center hover-lift border-yellow-500/20">
                <div className="text-4xl font-bold bg-gradient-to-br from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-2">
                  {vulnCounts.high}
                </div>
                <div className="text-sm text-light-300 font-medium">High</div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center hover-lift border-orange-500/20">
                <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                  {vulnCounts.medium}
                </div>
                <div className="text-sm text-light-300 font-medium">Medium</div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="text-center hover-lift border-green-500/20">
                <div className="text-4xl font-bold bg-gradient-to-br from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {vulnCounts.low}
                </div>
                <div className="text-sm text-light-300 font-medium">Low</div>
              </Card>
            </motion.div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QualityCircle score={result.qualityScore} label="Quality Score" />
            <QualityCircle
              score={result.securityScore}
              label="Security Score"
            />
            <QualityCircle
              score={result.performanceScore}
              label="Performance Score"
            />
          </div>

          {/* Advanced Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics Radar */}
            <Card>
              <h3 className="text-lg font-semibold text-light-100 mb-4">
                Metrics Overview
              </h3>
              <MetricsRadarChart
                metrics={{
                  qualityScore: result.qualityScore || 0,
                  maintainabilityIndex:
                    result.metrics?.maintainabilityIndex || 0,
                  cyclomaticComplexity:
                    result.metrics?.cyclomaticComplexity || 0,
                  linesOfCode: result.metrics?.linesOfCode || 0,
                  testCoverage: result.metrics?.testCoverage || 0,
                  technicalDebt: result.metrics?.technicalDebt || 0,
                }}
              />
            </Card>

            {/* Vulnerability Treemap */}
            {result.vulnerabilities && result.vulnerabilities.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-light-100 mb-4">
                  Vulnerability Distribution
                </h3>
                <VulnerabilityTreemap
                  vulnerabilities={result.vulnerabilities}
                />
              </Card>
            )}
          </div>

          {/* Vulnerabilities */}
          {result.vulnerabilities.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-light-100 mb-4">
                Vulnerabilities ({result.vulnerabilities.length})
              </h2>
              <div className="space-y-4">
                {result.vulnerabilities.map((vuln, index) => (
                  <VulnerabilityCard
                    key={index}
                    vulnerability={vuln}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Code Metrics */}
          {result.metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplexityChart metrics={result.metrics} />
              <Card>
                <h3 className="text-lg font-semibold text-light-100 mb-4">
                  Detailed Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-light-200">Lines of Code:</span>
                    <span className="text-light-100 font-semibold ml-2">
                      {result.metrics.linesOfCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-light-200">Functions:</span>
                    <span className="text-light-100 font-semibold ml-2">
                      {result.metrics.functions}
                    </span>
                  </div>
                  <div>
                    <span className="text-light-200">Classes:</span>
                    <span className="text-light-100 font-semibold ml-2">
                      {result.metrics.classes}
                    </span>
                  </div>
                  <div>
                    <span className="text-light-200">Comment Ratio:</span>
                    <span className="text-light-100 font-semibold ml-2">
                      {result.metrics.commentRatio}%
                    </span>
                  </div>
                  <div>
                    <span className="text-light-200">Technical Debt:</span>
                    <span className="text-light-100 font-semibold ml-2">
                      {result.metrics.technicalDebt}h
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* AI Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-light-100 mb-4">
                AI Suggestions ({result.suggestions.length})
              </h2>
              <div className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    hover
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${
                                SUGGESTION_TYPES[suggestion.type]?.color
                              }20`,
                              color: SUGGESTION_TYPES[suggestion.type]?.color,
                            }}
                          >
                            {SUGGESTION_TYPES[suggestion.type]?.label ||
                              suggestion.type}
                          </span>
                          <span
                            className={`badge-${suggestion.priority.toLowerCase()}`}
                          >
                            {suggestion.priority}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-light-100 mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-light-200 text-sm">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Full Code View */}
          <div>
            <h2 className="text-2xl font-bold text-light-100 mb-4">
              Code Review
            </h2>
            <CodeViewer
              code={result.code}
              language={result.language}
              vulnerabilities={result.vulnerabilities}
            />
          </div>
        </motion.div>
      )}

      {analyzing && <Loading text="Analyzing your code with AI..." />}
    </div>
  );
};

export default Analyze;
