import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Metrics Radar Chart
 * Multi-axis view of code quality metrics
 */
export default function MetricsRadarChart({ metrics, previousMetrics }) {
  if (!metrics) {
    return (
      <div className="text-center text-gray-500 py-8">
        No metrics data available
      </div>
    );
  }

  // Normalize metrics to 0-100 scale
  const normalizeScore = (value, max = 100) => {
    return Math.min(100, Math.max(0, (value / max) * 100));
  };

  const data = [
    {
      metric: "Quality",
      current: metrics.qualityScore || 0,
      previous: previousMetrics?.qualityScore || 0,
      fullMark: 100,
    },
    {
      metric: "Maintainability",
      current: metrics.maintainabilityIndex || 0,
      previous: previousMetrics?.maintainabilityIndex || 0,
      fullMark: 100,
    },
    {
      metric: "Complexity",
      current: Math.max(0, 100 - (metrics.cyclomaticComplexity || 0) * 2),
      previous: Math.max(
        0,
        100 - (previousMetrics?.cyclomaticComplexity || 0) * 2
      ),
      fullMark: 100,
    },
    {
      metric: "Documentation",
      current: metrics.commentRatio || 0,
      previous: previousMetrics?.commentRatio || 0,
      fullMark: 100,
    },
    {
      metric: "Duplication",
      current: Math.max(0, 100 - (metrics.duplication?.percentage || 0)),
      previous: Math.max(
        0,
        100 - (previousMetrics?.duplication?.percentage || 0)
      ),
      fullMark: 100,
    },
    {
      metric: "Code Size",
      current: normalizeScore(10000 - (metrics.linesOfCode || 0), 10000),
      previous: normalizeScore(
        10000 - (previousMetrics?.linesOfCode || 0),
        10000
      ),
      fullMark: 100,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
          <p className="font-semibold text-gray-900 mb-1">{data.metric}</p>
          <p className="text-sm text-blue-600">
            Current: {Math.round(data.current)}
          </p>
          {previousMetrics && (
            <p className="text-sm text-gray-500">
              Previous: {Math.round(data.previous)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Code Metrics Overview
        </h3>
        {previousMetrics && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Previous</span>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          {previousMetrics && (
            <Radar
              name="Previous"
              dataKey="previous"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.3}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        {data.map((item, index) => {
          const current = Math.round(item.current);
          const previous = Math.round(item.previous);
          const change = current - previous;
          const isPositive = change > 0;

          return (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {current}
                </div>
                {previousMetrics && change !== 0 && (
                  <div
                    className={`text-sm font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "↑" : "↓"} {Math.abs(change)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
