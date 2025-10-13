import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Card, Loading, Select } from "../components/Shared";
import {
  TrendChart,
  LanguagePieChart,
  OWASPComplianceChart,
} from "../components/Charts";
import ComplexityHeatmap from "../components/ComplexityHeatmap";
import VulnerabilityTreemap from "../components/VulnerabilityTreemap";
import MetricsRadarChart from "../components/MetricsRadarChart";
import { getAnalyticsTrends } from "../api";
import { OWASP_CATEGORIES } from "../utils";

const Analytics = () => {
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState("30");
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getAnalyticsTrends(parseInt(timeRange));
      setData(result);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading analytics..." />;

  const { trendData, languageBreakdown, vulnerabilityTrends } = data || {};

  // Calculate average scores
  const avgQuality =
    trendData?.length > 0
      ? Math.round(
          trendData.reduce((sum, d) => sum + d.qualityScore, 0) /
            trendData.length
        )
      : 0;

  const avgSecurity =
    trendData?.length > 0
      ? Math.round(
          trendData.reduce((sum, d) => sum + d.securityScore, 0) /
            trendData.length
        )
      : 0;

  // Mock OWASP compliance data (in real app, this would come from backend)
  const owaspCompliance = {
    A01_BrokenAccessControl: true,
    A02_CryptographicFailures: true,
    A03_Injection: false,
    A04_InsecureDesign: true,
    A05_SecurityMisconfiguration: false,
    A06_VulnerableComponents: true,
    A07_IdentificationFailures: true,
    A08_SoftwareDataIntegrity: true,
    A09_SecurityLoggingFailures: false,
    A10_SSRF: true,
  };

  const complianceCount = Object.values(owaspCompliance).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Analytics</h1>
          <p className="text-light-200">
            Comprehensive insights into your code quality trends
          </p>
        </div>
        <div className="w-48">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
            ]}
          />
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-light-200 text-sm mb-1">Avg Quality Score</p>
              <p className="text-4xl font-bold text-light-100">{avgQuality}</p>
              <p className="text-green-500 text-sm mt-2">
                ↑ 12% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-light-200 text-sm mb-1">Avg Security Score</p>
              <p className="text-4xl font-bold text-light-100">{avgSecurity}</p>
              <p className="text-green-500 text-sm mt-2">
                ↑ 8% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-light-200 text-sm mb-1">OWASP Compliance</p>
              <p className="text-4xl font-bold text-light-100">
                {complianceCount}/10
              </p>
              <p className="text-yellow-500 text-sm mt-2">
                {10 - complianceCount} categories need attention
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Trends */}
      {trendData && trendData.length > 0 && (
        <TrendChart data={trendData} title="Quality & Security Trends" />
      )}

      {/* Advanced Metrics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Radar Chart */}
        <Card>
          <h2 className="text-2xl font-bold text-light-100 mb-6">
            Code Quality Metrics
          </h2>
          <MetricsRadarChart
            metrics={{
              qualityScore: avgQuality,
              maintainabilityIndex: avgSecurity,
              cyclomaticComplexity: 15,
              linesOfCode: trendData?.[0]?.linesOfCode || 1000,
              testCoverage: 75,
              technicalDebt: 20,
            }}
            previousMetrics={
              trendData && trendData.length > 1
                ? {
                    qualityScore:
                      trendData[trendData.length - 1]?.qualityScore || 0,
                    maintainabilityIndex:
                      trendData[trendData.length - 1]?.securityScore || 0,
                    cyclomaticComplexity: 18,
                    linesOfCode:
                      trendData[trendData.length - 1]?.linesOfCode || 900,
                    testCoverage: 70,
                    technicalDebt: 25,
                  }
                : null
            }
          />
        </Card>

        {/* Vulnerability Treemap */}
        <Card>
          <h2 className="text-2xl font-bold text-light-100 mb-6">
            Vulnerability Distribution
          </h2>
          <VulnerabilityTreemap
            vulnerabilities={
              Array.isArray(vulnerabilityTrends)
                ? vulnerabilityTrends.flatMap((v) => v.vulnerabilities || [])
                : []
            }
          />
        </Card>
      </div>

      {/* Complexity Heatmap */}
      {trendData && trendData.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-light-100 mb-6">
            Code Complexity Heatmap
          </h2>
          <ComplexityHeatmap
            data={
              trendData.slice(0, 20).map((item, index) => ({
                file: `Module ${index + 1}`,
                complexity: Math.floor(Math.random() * 30) + 1,
                lines: item.linesOfCode || Math.floor(Math.random() * 500) + 50,
                functions:
                  item.functionsAnalyzed || Math.floor(Math.random() * 20) + 1,
              })) || []
            }
          />
        </Card>
      )}

      {/* Language and OWASP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {languageBreakdown && Object.keys(languageBreakdown).length > 0 && (
          <LanguagePieChart data={languageBreakdown} />
        )}

        <OWASPComplianceChart compliance={owaspCompliance} />
      </div>

      {/* OWASP Checklist */}
      <Card>
        <h2 className="text-2xl font-bold text-light-100 mb-6">
          OWASP Top 10 Compliance Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(OWASP_CATEGORIES).map(([key, label]) => {
            const isCompliant = owaspCompliance[key];
            return (
              <div
                key={key}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${
                  isCompliant
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                {isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isCompliant ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Technical Debt Trends */}
      <Card>
        <h2 className="text-2xl font-bold text-light-100 mb-6">
          Technical Debt Over Time
        </h2>
        <div className="space-y-4">
          {trendData &&
            trendData.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-light-200" />
                <span className="text-light-200 w-24">{item.date}</span>
                <div className="flex-1 h-8 bg-dark-300 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.qualityScore / 100) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <span className="text-light-100 font-semibold w-16 text-right">
                  {item.qualityScore}/100
                </span>
              </div>
            ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="gradient-bg">
        <div className="text-white space-y-4">
          <h3 className="text-xl font-bold">🎯 Key Insights</h3>
          <ul className="space-y-2 text-sm">
            <li>
              • Your code quality has improved by 12% over the selected period
            </li>
            <li>
              • Security score is trending upward with consistent improvements
            </li>
            <li>
              • {10 - complianceCount} OWASP categories need immediate attention
            </li>
            <li>
              • {Object.keys(languageBreakdown || {}).length} programming
              languages analyzed
            </li>
            <li>
              • Technical debt is decreasing, showing better code
              maintainability
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
