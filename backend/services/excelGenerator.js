import ExcelJS from "exceljs";

/**
 * Generate Excel report for code analysis
 */
export async function generateExcelReport(analysis, project) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CodeReview.AI";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: "FF0066CC" } },
  });

  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];

  summarySheet.addRows([
    { metric: "Project Name", value: project.name },
    { metric: "Language", value: project.language },
    {
      metric: "Analysis Date",
      value: new Date(analysis.createdAt).toLocaleDateString(),
    },
    { metric: "", value: "" },
    {
      metric: "Overall Quality Score",
      value: `${analysis.qualityMetrics?.qualityScore || 0}%`,
    },
    { metric: "Security Score", value: `${analysis.securityScore || 0}%` },
    {
      metric: "Performance Score",
      value: `${analysis.performanceMetrics?.performanceScore || 0}%`,
    },
    { metric: "", value: "" },
    {
      metric: "Total Vulnerabilities",
      value: analysis.vulnerabilities?.length || 0,
    },
    {
      metric: "  - Critical",
      value:
        analysis.vulnerabilities?.filter((v) => v.severity === "Critical")
          .length || 0,
    },
    {
      metric: "  - High",
      value:
        analysis.vulnerabilities?.filter((v) => v.severity === "High").length ||
        0,
    },
    {
      metric: "  - Medium",
      value:
        analysis.vulnerabilities?.filter((v) => v.severity === "Medium")
          .length || 0,
    },
    {
      metric: "  - Low",
      value:
        analysis.vulnerabilities?.filter((v) => v.severity === "Low").length ||
        0,
    },
    { metric: "", value: "" },
    {
      metric: "Lines of Code",
      value: analysis.qualityMetrics?.metrics?.linesOfCode || 0,
    },
    {
      metric: "Cyclomatic Complexity",
      value: analysis.qualityMetrics?.metrics?.complexity || 0,
    },
    {
      metric: "Maintainability Index",
      value: analysis.qualityMetrics?.metrics?.maintainability || 0,
    },
    {
      metric: "Code Duplication",
      value: `${analysis.qualityMetrics?.metrics?.duplication || 0}%`,
    },
    {
      metric: "Technical Debt",
      value: `${analysis.qualityMetrics?.metrics?.technicalDebt || 0} hours`,
    },
  ]);

  // Style summary sheet
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0066CC" },
  };
  summarySheet.getRow(1).font = {
    ...summarySheet.getRow(1).font,
    color: { argb: "FFFFFFFF" },
  };

  // Color code scores
  const qualityRow = summarySheet.getRow(5);
  qualityRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: getScoreColor(analysis.qualityMetrics?.qualityScore) },
  };

  // Vulnerabilities Sheet
  if (analysis.vulnerabilities && analysis.vulnerabilities.length > 0) {
    const vulnSheet = workbook.addWorksheet("Vulnerabilities", {
      properties: { tabColor: { argb: "FFFF0000" } },
    });

    vulnSheet.columns = [
      { header: "Severity", key: "severity", width: 12 },
      { header: "Type", key: "title", width: 25 },
      { header: "Line", key: "lineNumber", width: 8 },
      { header: "CWE", key: "cwe", width: 12 },
      { header: "OWASP", key: "owaspCategory", width: 12 },
      { header: "Description", key: "description", width: 50 },
      { header: "Recommendation", key: "recommendation", width: 50 },
    ];

    vulnSheet.getRow(1).font = { bold: true, size: 12 };
    vulnSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    vulnSheet.getRow(1).font = { color: { argb: "FFFFFFFF" } };

    analysis.vulnerabilities.forEach((vuln, index) => {
      const row = vulnSheet.addRow(vuln);

      // Color code severity
      const severityCell = row.getCell(1);
      severityCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: getSeverityColor(vuln.severity) },
      };
      severityCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    });

    vulnSheet.autoFilter = {
      from: "A1",
      to: "G1",
    };
  }

  // Code Smells Sheet
  if (
    analysis.qualityMetrics?.codeSmells &&
    analysis.qualityMetrics.codeSmells.length > 0
  ) {
    const smellSheet = workbook.addWorksheet("Code Smells", {
      properties: { tabColor: { argb: "FFFFA500" } },
    });

    smellSheet.columns = [
      { header: "Severity", key: "severity", width: 12 },
      { header: "Type", key: "type", width: 25 },
      { header: "Line", key: "lineNumber", width: 8 },
      { header: "Description", key: "description", width: 60 },
    ];

    smellSheet.getRow(1).font = { bold: true, size: 12 };
    smellSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFA500" },
    };
    smellSheet.getRow(1).font = { color: { argb: "FFFFFFFF" } };

    analysis.qualityMetrics.codeSmells.forEach((smell) => {
      const row = smellSheet.addRow(smell);
      row.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: getSeverityColor(smell.severity) },
      };
    });
  }

  // Suggestions Sheet
  if (analysis.suggestions && analysis.suggestions.length > 0) {
    const sugSheet = workbook.addWorksheet("Suggestions", {
      properties: { tabColor: { argb: "FF00CC66" } },
    });

    sugSheet.columns = [
      { header: "Priority", key: "priority", width: 12 },
      { header: "Type", key: "type", width: 20 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Line", key: "lineNumber", width: 8 },
    ];

    sugSheet.getRow(1).font = { bold: true, size: 12 };
    sugSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00CC66" },
    };
    sugSheet.getRow(1).font = { color: { argb: "FFFFFFFF" } };

    analysis.suggestions.forEach((suggestion) => {
      sugSheet.addRow(suggestion);
    });
  }

  // Metrics Sheet
  const metricsSheet = workbook.addWorksheet("Detailed Metrics", {
    properties: { tabColor: { argb: "FF9933FF" } },
  });

  metricsSheet.columns = [
    { header: "Category", key: "category", width: 25 },
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];

  metricsSheet.getRow(1).font = { bold: true, size: 12 };
  metricsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF9933FF" },
  };
  metricsSheet.getRow(1).font = { color: { argb: "FFFFFFFF" } };

  const metrics = analysis.qualityMetrics?.metrics || {};

  metricsSheet.addRows([
    {
      category: "Size",
      metric: "Total Lines",
      value: metrics.linesOfCode || 0,
    },
    { category: "Size", metric: "Code Lines", value: metrics.codeLines || 0 },
    {
      category: "Size",
      metric: "Comment Lines",
      value: metrics.commentLines || 0,
    },
    {
      category: "Size",
      metric: "Comment Ratio",
      value: `${metrics.commentRatio || 0}%`,
    },
    { category: "", metric: "", value: "" },
    {
      category: "Complexity",
      metric: "Cyclomatic Complexity",
      value: metrics.complexity || 0,
    },
    {
      category: "Complexity",
      metric: "Maintainability Index",
      value: metrics.maintainability || 0,
    },
    { category: "", metric: "", value: "" },
    {
      category: "Duplication",
      metric: "Duplication %",
      value: `${metrics.duplication || 0}%`,
    },
    { category: "", metric: "", value: "" },
    {
      category: "Technical Debt",
      metric: "Estimated Hours",
      value: metrics.technicalDebt || 0,
    },
  ]);

  return workbook;
}

/**
 * Helper: Get color for score (0-100)
 */
function getScoreColor(score) {
  if (score >= 80) return "FF00CC66"; // Green
  if (score >= 60) return "FF3399FF"; // Blue
  if (score >= 40) return "FFFFFF00"; // Yellow
  if (score >= 20) return "FFFFA500"; // Orange
  return "FFFF0000"; // Red
}

/**
 * Helper: Get color for severity
 */
function getSeverityColor(severity) {
  const colors = {
    Critical: "FFFF0000",
    High: "FFFF6600",
    Medium: "FFFFA500",
    Low: "FFFFFF00",
  };
  return colors[severity] || "FFCCCCCC";
}

/**
 * Save Excel report to buffer
 */
export async function saveExcelToBuffer(analysis, project) {
  const workbook = await generateExcelReport(analysis, project);
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
