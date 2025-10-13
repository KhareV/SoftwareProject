import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card } from "./Shared";
import { SEVERITY_COLORS } from "../utils";

// ========== QUALITY CIRCLE ==========

export const QualityCircle = ({
  score,
  label = "Quality Score",
  size = 200,
}) => {
  const getColor = () => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#F97316";
    return "#DC2626";
  };

  const circumference = 2 * Math.PI * 70;
  const progress = (score / 100) * circumference;

  return (
    <Card className="flex flex-col items-center justify-center p-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="70"
            stroke="#334155"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r="70"
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold"
            style={{ color: getColor() }}
          >
            {score}
          </motion.span>
          <span className="text-light-200 text-sm">/ 100</span>
        </div>
      </div>
      <p className="text-light-100 font-semibold mt-4">{label}</p>
    </Card>
  );
};

// ========== TREND CHART ==========

export const TrendChart = ({ data, title = "Quality Trends" }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-light-100 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#CBD5E1" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#CBD5E1"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
            }}
          />
          <Legend wrapperStyle={{ color: "#CBD5E1" }} />
          <Line
            type="monotone"
            dataKey="qualityScore"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: "#8B5CF6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Quality Score"
          />
          <Line
            type="monotone"
            dataKey="securityScore"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={{ fill: "#06B6D4", r: 4 }}
            activeDot={{ r: 6 }}
            name="Security Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ========== VULNERABILITY BARS ==========

export const VulnerabilityBars = ({ vulnerabilities }) => {
  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  vulnerabilities.forEach((v) => {
    if (counts.hasOwnProperty(v.severity)) {
      counts[v.severity]++;
    }
  });

  const data = [
    {
      severity: "Critical",
      count: counts.Critical,
      color: SEVERITY_COLORS.Critical,
    },
    { severity: "High", count: counts.High, color: SEVERITY_COLORS.High },
    { severity: "Medium", count: counts.Medium, color: SEVERITY_COLORS.Medium },
    { severity: "Low", count: counts.Low, color: SEVERITY_COLORS.Low },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-light-100 mb-4">
        Vulnerability Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#CBD5E1" style={{ fontSize: "12px" }} />
          <YAxis
            dataKey="severity"
            type="category"
            stroke="#CBD5E1"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ========== COMPLEXITY CHART ==========

export const ComplexityChart = ({ metrics }) => {
  const data = [
    { metric: "Complexity", value: metrics.complexity || 0 },
    { metric: "Maintainability", value: metrics.maintainability || 0 },
    { metric: "Duplication", value: 100 - (metrics.duplication || 0) },
    { metric: "Comments", value: metrics.commentRatio || 0 },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-light-100 mb-4">
        Code Metrics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="metric"
            stroke="#CBD5E1"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#CBD5E1"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
            }}
          />
          <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ========== LANGUAGE PIE CHART ==========

export const LanguagePieChart = ({ data }) => {
  const COLORS = [
    "#8B5CF6",
    "#06B6D4",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#F97316",
  ];

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-light-100 mb-4">
        Language Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ========== OWASP COMPLIANCE CHART ==========

export const OWASPComplianceChart = ({ compliance }) => {
  const data = Object.entries(compliance).map(([key, value]) => ({
    category: key.replace("A0", "A").replace(/_/g, " "),
    compliant: value ? 1 : 0,
    nonCompliant: value ? 0 : 1,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-light-100 mb-4">
        OWASP Top 10 Compliance
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#CBD5E1" style={{ fontSize: "12px" }} />
          <YAxis
            dataKey="category"
            type="category"
            stroke="#CBD5E1"
            style={{ fontSize: "10px" }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
            }}
          />
          <Legend />
          <Bar
            dataKey="compliant"
            stackId="a"
            fill="#10B981"
            name="Compliant"
          />
          <Bar
            dataKey="nonCompliant"
            stackId="a"
            fill="#DC2626"
            name="Non-Compliant"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
