import React from "react";
import { motion } from "framer-motion";
import { Upload, Play, Download, Sparkles, FileCode } from "lucide-react";
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
      };
      reader.readAsText(file);
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Code Analysis</h1>
        <p className="text-light-200">
          Upload or paste your code for AI-powered security and quality analysis
        </p>
      </motion.div>

      {/* Input Section */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="mb-4">
              <label className="block text-light-100 text-sm font-semibold mb-2">
                Code Input
              </label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={20}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.php,.rb,.go"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="secondary" icon={Upload} as="span">
                  Upload File
                </Button>
              </label>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
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
                className="w-full"
              >
                {analyzing ? "Analyzing..." : "Analyze Code"}
              </Button>
            </Card>

            <Card className="gradient-bg">
              <div className="text-white space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">AI Analysis Includes:</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✓ OWASP Top 10 Security Scan</li>
                  <li>✓ Code Quality Metrics</li>
                  <li>✓ Performance Analysis</li>
                  <li>✓ AI Improvement Suggestions</li>
                  <li>✓ Compliance Checking</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
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
            <Card className="text-center">
              <div className="text-3xl font-bold text-severity-critical mb-1">
                {vulnCounts.critical}
              </div>
              <div className="text-sm text-light-200">Critical</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-severity-high mb-1">
                {vulnCounts.high}
              </div>
              <div className="text-sm text-light-200">High</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-severity-medium mb-1">
                {vulnCounts.medium}
              </div>
              <div className="text-sm text-light-200">Medium</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-severity-low mb-1">
                {vulnCounts.low}
              </div>
              <div className="text-sm text-light-200">Low</div>
            </Card>
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
