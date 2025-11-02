import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Shield,
  AlertTriangle,
  Download,
  Calendar,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { Card, Loading } from "../components/Shared";
import VulnerabilityCard from "../components/VulnerabilityCard";
import { QualityCircle, ComplexityChart } from "../components/Charts";
import VulnerabilityTreemap from "../components/VulnerabilityTreemap";
import MetricsRadarChart from "../components/MetricsRadarChart";
import CodeViewer from "../components/CodeViewer";
import { getAnalysis, generatePDFReport, generateExcelReport } from "../api";
import { formatRelativeTime, countVulnerabilitiesBySeverity } from "../utils";
import toast from "react-hot-toast";

/**
 * Analysis Detail Page
 * Shows detailed results for a specific code analysis
 */
export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (error) {
      console.error("Failed to load analysis:", error);
      toast.error("Failed to load analysis");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await generatePDFReport(id);
      toast.success("PDF report downloaded!");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await generateExcelReport(id);
      toast.success("Excel report downloaded!");
    } catch (error) {
      console.error("Failed to generate Excel report:", error);
      toast.error("Failed to generate Excel report");
    }
  };

  if (loading) {
    return <Loading text="Loading analysis..." />;
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-light-200">Analysis not found</p>
      </div>
    );
  }

  const vulnCounts = countVulnerabilitiesBySeverity(analysis.vulnerabilities);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-light-200 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Analysis Results
            </h1>
            <div className="flex items-center gap-4 text-light-200">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatRelativeTime(analysis.timestamp)}
              </span>
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                {analysis.language}
              </span>
              {analysis.metadata?.source === "practice" && (
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  Practice Challenge
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              PDF Report
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel Report
            </button>
          </div>
        </div>

        {/* Practice Challenge Info */}
        {analysis.metadata?.source === "practice" && (
          <div className="mt-4 glass rounded-lg p-4 border border-light-200/10">
            <h3 className="font-semibold text-white mb-2">Challenge Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-light-200">Title:</span>
                <div className="font-semibold text-white">
                  {analysis.metadata.challengeTitle}
                </div>
              </div>
              <div>
                <span className="text-light-200">Topic:</span>
                <div className="font-semibold text-white">
                  {analysis.metadata.challengeTopic}
                </div>
              </div>
              <div>
                <span className="text-light-200">Difficulty:</span>
                <div
                  className={`font-semibold ${
                    analysis.metadata.challengeDifficulty === "Easy"
                      ? "text-green-400"
                      : analysis.metadata.challengeDifficulty === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {analysis.metadata.challengeDifficulty}
                </div>
              </div>
              <div>
                <span className="text-light-200">Tests:</span>
                <div
                  className={`font-semibold ${
                    analysis.metadata.testsPassed
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {analysis.metadata.testsPassed ? "✓ Passed" : "✗ Failed"}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Vulnerability Overview */}
      {vulnCounts && (
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
      )}

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QualityCircle score={analysis.qualityScore} label="Quality Score" />
        <QualityCircle score={analysis.securityScore} label="Security Score" />
        <QualityCircle
          score={analysis.performanceScore}
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
              qualityScore: analysis.qualityScore || 0,
              maintainabilityIndex: analysis.metrics?.maintainabilityIndex || 0,
              cyclomaticComplexity: analysis.metrics?.cyclomaticComplexity || 0,
              linesOfCode: analysis.metrics?.linesOfCode || 0,
              testCoverage: analysis.metrics?.testCoverage || 0,
              technicalDebt: analysis.metrics?.technicalDebt || 0,
            }}
          />
        </Card>

        {/* Vulnerability Treemap */}
        {analysis.vulnerabilities && analysis.vulnerabilities.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-light-100 mb-4">
              Vulnerability Distribution
            </h3>
            <VulnerabilityTreemap vulnerabilities={analysis.vulnerabilities} />
          </Card>
        )}
      </div>

      {/* Code Metrics */}
      {analysis.metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplexityChart metrics={analysis.metrics} />
          <Card>
            <h3 className="text-lg font-semibold text-light-100 mb-4">
              Code Metrics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-light-200">Lines of Code:</span>
                <span className="text-white font-semibold">
                  {analysis.metrics.linesOfCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-200">Cyclomatic Complexity:</span>
                <span className="text-white font-semibold">
                  {analysis.metrics.cyclomaticComplexity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-200">Maintainability Index:</span>
                <span className="text-white font-semibold">
                  {analysis.metrics.maintainabilityIndex}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-200">Halstead Volume:</span>
                <span className="text-white font-semibold">
                  {analysis.metrics.halsteadVolume?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-200">Halstead Difficulty:</span>
                <span className="text-white font-semibold">
                  {analysis.metrics.halsteadDifficulty?.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Vulnerabilities */}
      {analysis.vulnerabilities && analysis.vulnerabilities.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-light-100 mb-4">
            Vulnerabilities ({analysis.vulnerabilities.length})
          </h2>
          <div className="space-y-4">
            {analysis.vulnerabilities.map((vuln, index) => (
              <VulnerabilityCard
                key={index}
                vulnerability={vuln}
                index={index}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Code Viewer */}
      <Card>
        <h2 className="text-2xl font-bold text-light-100 mb-4">
          Analyzed Code
        </h2>
        <CodeViewer
          code={analysis.code}
          language={analysis.language}
          vulnerabilities={analysis.vulnerabilities}
        />
      </Card>
    </div>
  );
}
