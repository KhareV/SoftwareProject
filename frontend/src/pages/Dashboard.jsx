import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileCode,
  Calendar,
} from "lucide-react";
import { StatsCard, Card, Loading } from "../components/Shared";
import { TrendChart, VulnerabilityBars } from "../components/Charts";
import { getAnalyticsOverview } from "../api";
import { formatRelativeTime, formatNumber } from "../utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await getAnalyticsOverview();
      setData(result);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading dashboard..." />;

  const { stats, recentAnalyses } = data || { stats: {}, recentAnalyses: [] };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-light-200">
          Overview of your code analysis activity
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Code2}
          label="Total Analyses"
          value={formatNumber(stats.totalAnalyses || 0)}
          color="primary"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Vulnerabilities Found"
          value={formatNumber(stats.totalVulnerabilities || 0)}
          color="danger"
        />
        <StatsCard
          icon={Shield}
          label="Avg Quality Score"
          value={`${stats.averageQualityScore || 0}/100`}
          color="success"
        />
        <StatsCard
          icon={FileCode}
          label="Languages"
          value={stats.languagesUsed?.length || 0}
          color="secondary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentAnalyses.length > 0 && (
          <>
            <TrendChart
              data={recentAnalyses
                .slice(0, 10)
                .reverse()
                .map((a) => ({
                  date: new Date(a.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  qualityScore: a.qualityScore,
                  securityScore: a.securityScore,
                }))}
              title="Recent Quality Trends"
            />
            <VulnerabilityBars
              vulnerabilities={recentAnalyses.flatMap((a) => a.vulnerabilities)}
            />
          </>
        )}
      </div>

      {/* Recent Analyses */}
      <Card>
        <h2 className="text-2xl font-bold text-light-100 mb-6">
          Recent Analyses
        </h2>

        {recentAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="w-16 h-16 text-light-200 mx-auto mb-4" />
            <p className="text-light-200">
              No analyses yet. Start by analyzing some code!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-lg p-4 hover:bg-dark-300/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/analyze/${analysis._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                        {analysis.language}
                      </span>
                      <span className="text-light-200 text-sm">
                        {formatRelativeTime(analysis.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-secondary" />
                        <span className="text-light-200">
                          Quality: {analysis.qualityScore}/100
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-light-200">
                          {analysis.vulnerabilities.length} issues
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {["Critical", "High", "Medium", "Low"].map((severity) => {
                      const count = analysis.vulnerabilities.filter(
                        (v) => v.severity === severity
                      ).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={severity}
                          className={`px-2 py-1 rounded text-xs font-semibold badge-${severity.toLowerCase()}`}
                        >
                          {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
