import PDFDocument from "pdfkit";

/**
 * Professional PDF Report Generator
 * Creates beautiful, comprehensive code analysis reports
 */

// Color palette
const COLORS = {
  primary: "#6366f1", // Indigo
  secondary: "#8b5cf6", // Purple
  success: "#10b981", // Green
  warning: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  info: "#3b82f6", // Blue
  dark: "#1f2937",
  light: "#f3f4f6",
  text: "#374151",
  textLight: "#6b7280",
  white: "#ffffff",
};

// Severity colors
const SEVERITY_COLORS = {
  Critical: COLORS.danger,
  High: "#ff6b00",
  Medium: COLORS.warning,
  Low: "#fbbf24",
};

/**
 * Generate comprehensive PDF report
 */
export function generatePDFReport(analysis, project) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });

  // Track position for page numbers
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  // ==================== COVER PAGE ====================
  drawCoverPage(doc, analysis, project);

  // ==================== TABLE OF CONTENTS ====================
  doc.addPage();
  drawTableOfContents(doc);

  // ==================== EXECUTIVE SUMMARY ====================
  doc.addPage();
  drawExecutiveSummary(doc, analysis);

  // ==================== SCORE OVERVIEW ====================
  doc.addPage();
  drawScoreOverview(doc, analysis);

  // ==================== SECURITY ANALYSIS ====================
  if (analysis.vulnerabilities && analysis.vulnerabilities.length > 0) {
    doc.addPage();
    drawSecuritySection(doc, analysis);
  }

  // ==================== CODE QUALITY ====================
  doc.addPage();
  drawQualitySection(doc, analysis);

  // ==================== PERFORMANCE ANALYSIS ====================
  doc.addPage();
  drawPerformanceSection(doc, analysis);

  // ==================== IMPROVEMENT SUGGESTIONS ====================
  if (analysis.suggestions && analysis.suggestions.length > 0) {
    doc.addPage();
    drawSuggestionsSection(doc, analysis);
  }

  // ==================== DETAILED METRICS ====================
  doc.addPage();
  drawMetricsSection(doc, analysis);

  // ==================== OWASP COMPLIANCE ====================
  if (analysis.owaspCompliance) {
    doc.addPage();
    drawOWASPCompliance(doc, analysis);
  }

  // Add page numbers
  addPageNumbers(doc);

  doc.end();
  return doc;
}

/**
 * Cover Page
 */
function drawCoverPage(doc, analysis, project) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Gradient background (simulated with rectangles)
  const gradientSteps = 50;
  for (let i = 0; i < gradientSteps; i++) {
    const alpha = 1 - i / gradientSteps;
    doc
      .rect(
        0,
        (pageHeight / gradientSteps) * i,
        pageWidth,
        pageHeight / gradientSteps
      )
      .fillOpacity(0.1 + alpha * 0.05)
      .fill("#6366f1");
  }

  doc.fillOpacity(1);

  // Logo/Title area
  doc
    .fontSize(48)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text("CodeReview.AI", 50, 150, { align: "center" });

  doc
    .fontSize(24)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text("Comprehensive Code Analysis Report", 50, 220, { align: "center" });

  // Decorative line
  doc
    .moveTo(150, 270)
    .lineTo(pageWidth - 150, 270)
    .lineWidth(2)
    .strokeColor(COLORS.primary)
    .stroke();

  // Project information
  const infoY = 320;
  doc.fontSize(14).fillColor(COLORS.textLight).font("Helvetica");

  const projectName = project?.name || "Unnamed Project";
  const language = analysis.language || "Multiple";
  const date = new Date(
    analysis.createdAt || analysis.timestamp
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.text(`Project: `, 200, infoY, { width: 100, continued: false });
  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(projectName, 280, infoY);

  doc
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text("Language: ", 200, infoY + 30, { continued: false });
  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(language, 280, infoY + 30);

  doc
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text("Analysis Date: ", 200, infoY + 60, { continued: false });
  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(date, 310, infoY + 60);

  // Score badges
  const badgeY = 480;
  const scores = [
    {
      label: "Quality",
      value: analysis.qualityScore || 0,
      color: COLORS.primary,
    },
    {
      label: "Security",
      value: analysis.securityScore || 0,
      color: COLORS.success,
    },
    {
      label: "Performance",
      value: analysis.performanceScore || 0,
      color: COLORS.info,
    },
  ];

  const badgeWidth = 140;
  const spacing = 20;
  const totalWidth = scores.length * badgeWidth + (scores.length - 1) * spacing;
  const startX = (pageWidth - totalWidth) / 2;

  scores.forEach((score, idx) => {
    const x = startX + idx * (badgeWidth + spacing);
    drawScoreBadge(doc, x, badgeY, score.label, score.value, score.color);
  });

  // Footer
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text(
      "Generated by CodeReview.AI - AI-Powered Code Analysis Platform",
      50,
      pageHeight - 100,
      {
        align: "center",
      }
    );

  doc.text(`Analysis ID: ${analysis._id}`, 50, pageHeight - 80, {
    align: "center",
  });
}

/**
 * Draw score badge
 */
function drawScoreBadge(doc, x, y, label, value, color) {
  const width = 140;
  const height = 100;

  // Badge background
  doc
    .roundedRect(x, y, width, height, 8)
    .fillColor(color)
    .fillOpacity(0.1)
    .fill();

  doc.fillOpacity(1);

  // Score value
  const scoreColor =
    value >= 80
      ? COLORS.success
      : value >= 60
      ? COLORS.info
      : value >= 40
      ? COLORS.warning
      : COLORS.danger;

  doc
    .fontSize(36)
    .fillColor(scoreColor)
    .font("Helvetica-Bold")
    .text(value.toString(), x, y + 20, {
      width: width,
      align: "center",
    });

  // Label
  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(label, x, y + 65, { width: width, align: "center" });
}

/**
 * Table of Contents
 */
function drawTableOfContents(doc) {
  drawSectionHeader(doc, "Table of Contents", COLORS.primary);

  const contents = [
    { title: "Executive Summary", page: 3 },
    { title: "Score Overview", page: 4 },
    { title: "Security Analysis", page: 5 },
    { title: "Code Quality Assessment", page: 6 },
    { title: "Performance Analysis", page: 7 },
    { title: "Improvement Suggestions", page: 8 },
    { title: "Detailed Metrics", page: 9 },
    { title: "OWASP Compliance", page: 10 },
  ];

  let y = 150;
  doc.fontSize(12).font("Helvetica");

  contents.forEach((item, idx) => {
    doc
      .fillColor(COLORS.text)
      .text(`${idx + 1}. ${item.title}`, 70, y, { continued: true });
    doc.fillColor(COLORS.textLight).text(`.`.repeat(50), { continued: true });
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").text(` ${item.page}`);
    doc.font("Helvetica");
    y += 25;
  });
}

/**
 * Executive Summary
 */
function drawExecutiveSummary(doc, analysis) {
  drawSectionHeader(doc, "Executive Summary", COLORS.primary);

  const criticalVulns =
    analysis.vulnerabilities?.filter((v) => v.severity === "Critical").length ||
    0;
  const highVulns =
    analysis.vulnerabilities?.filter((v) => v.severity === "High").length || 0;
  const totalVulns = analysis.vulnerabilities?.length || 0;
  const qualityScore = analysis.qualityScore || 0;
  const securityScore = analysis.securityScore || 0;

  let y = 150;

  // Overall assessment
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Overall Assessment", 50, y);

  y += 30;

  const overallScore = Math.round(
    (qualityScore + securityScore + (analysis.performanceScore || 0)) / 3
  );
  let assessment = "";
  if (overallScore >= 80)
    assessment =
      "Excellent - The code demonstrates high quality standards with minimal issues.";
  else if (overallScore >= 60)
    assessment =
      "Good - The code is generally well-written but has areas for improvement.";
  else if (overallScore >= 40)
    assessment =
      "Fair - Significant improvements needed to meet quality standards.";
  else assessment = "Poor - Critical issues require immediate attention.";

  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(assessment, 50, y, { width: 500, align: "justify" });

  y += 60;

  // Key findings
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Key Findings", 50, y);
  y += 30;

  const findings = [
    {
      icon: "🔒",
      title: "Security",
      value: `${totalVulns} vulnerabilities found${
        criticalVulns > 0
          ? ` (${criticalVulns} critical, ${highVulns} high)`
          : ""
      }`,
      color:
        criticalVulns > 0
          ? COLORS.danger
          : highVulns > 0
          ? COLORS.warning
          : COLORS.success,
    },
    {
      icon: "⚡",
      title: "Performance",
      value: `${analysis.performanceScore || 0}/100 score`,
      color:
        (analysis.performanceScore || 0) >= 70
          ? COLORS.success
          : (analysis.performanceScore || 0) >= 50
          ? COLORS.warning
          : COLORS.danger,
    },
    {
      icon: "📊",
      title: "Code Quality",
      value: `${
        analysis.qualityMetrics?.codeSmells?.length || 0
      } code smells detected`,
      color:
        (analysis.qualityMetrics?.codeSmells?.length || 0) > 10
          ? COLORS.danger
          : COLORS.warning,
    },
    {
      icon: "🔧",
      title: "Technical Debt",
      value: `${
        analysis.qualityMetrics?.metrics?.technicalDebt || 0
      } hours estimated`,
      color: COLORS.info,
    },
  ];

  findings.forEach((finding) => {
    drawKeyFinding(doc, 50, y, finding);
    y += 50;
  });

  // Recommendations summary
  y += 20;
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Priority Recommendations", 50, y);
  y += 30;

  const highPrioritySuggestions =
    analysis.suggestions?.filter((s) => s.priority === "High").slice(0, 3) ||
    [];

  if (highPrioritySuggestions.length > 0) {
    highPrioritySuggestions.forEach((suggestion, idx) => {
      doc
        .fontSize(11)
        .fillColor(COLORS.text)
        .font("Helvetica")
        .text(`${idx + 1}. ${suggestion.title}`, 70, y, { width: 480 });
      y += 25;
    });
  } else {
    doc
      .fontSize(11)
      .fillColor(COLORS.success)
      .font("Helvetica")
      .text("No high-priority issues identified.", 70, y);
  }
}

/**
 * Draw key finding box
 */
function drawKeyFinding(doc, x, y, finding) {
  doc
    .roundedRect(x, y, 500, 35, 5)
    .fillColor(finding.color)
    .fillOpacity(0.1)
    .fill();

  doc.fillOpacity(1);

  // Draw the full text in one call to avoid overlapping
  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      `${finding.icon} ${finding.title}: ${finding.value}`,
      x + 10,
      y + 10,
      {
        width: 480,
        continued: false,
      }
    );
}

/**
 * Score Overview
 */
function drawScoreOverview(doc, analysis) {
  drawSectionHeader(doc, "Score Overview & Metrics", COLORS.primary);

  let y = 150;

  // Main scores
  const scores = [
    { label: "Overall Quality", value: analysis.qualityScore || 0, max: 100 },
    { label: "Security Score", value: analysis.securityScore || 0, max: 100 },
    {
      label: "Performance Score",
      value: analysis.performanceScore || 0,
      max: 100,
    },
    {
      label: "Maintainability",
      value: analysis.qualityMetrics?.metrics?.maintainability || 0,
      max: 100,
    },
  ];

  scores.forEach((score) => {
    drawProgressBar(doc, 50, y, score.label, score.value, score.max);
    y += 50;
  });

  // Metrics grid
  y += 30;
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Code Metrics", 50, y);
  y += 30;

  const metrics = analysis.qualityMetrics?.metrics || {};
  const metricsData = [
    { label: "Lines of Code", value: metrics.linesOfCode || 0 },
    { label: "Functions", value: metrics.functions || 0 },
    { label: "Classes", value: metrics.classes || 0 },
    { label: "Complexity", value: metrics.complexity || 0 },
    { label: "Comment Ratio", value: `${metrics.commentRatio || 0}%` },
    { label: "Duplication", value: `${metrics.duplication || 0}%` },
  ];

  drawMetricsGrid(doc, 50, y, metricsData);
}

/**
 * Draw progress bar
 */
function drawProgressBar(doc, x, y, label, value, max = 100) {
  const barWidth = 400;
  const barHeight = 20;
  const percentage = (value / max) * 100;

  // Label
  doc.fontSize(11).fillColor(COLORS.text).font("Helvetica").text(label, x, y);

  // Background bar
  doc
    .roundedRect(x, y + 20, barWidth, barHeight, 10)
    .fillColor(COLORS.light)
    .fill();

  // Progress bar
  const progressWidth = (barWidth * value) / max;
  const barColor =
    percentage >= 80
      ? COLORS.success
      : percentage >= 60
      ? COLORS.info
      : percentage >= 40
      ? COLORS.warning
      : COLORS.danger;

  doc
    .roundedRect(x, y + 20, progressWidth, barHeight, 10)
    .fillColor(barColor)
    .fill();

  // Value text
  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(`${value}/${max}`, x + barWidth + 20, y + 22);
}

/**
 * Draw metrics grid
 */
function drawMetricsGrid(doc, x, y, metrics) {
  const cols = 3;
  const cellWidth = 160;
  const cellHeight = 60;

  metrics.forEach((metric, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellX = x + col * (cellWidth + 10);
    const cellY = y + row * (cellHeight + 10);

    // Cell background
    doc
      .roundedRect(cellX, cellY, cellWidth, cellHeight, 5)
      .fillColor(COLORS.primary)
      .fillOpacity(0.05)
      .fill();

    doc.fillOpacity(1);

    // Label
    doc
      .fontSize(9)
      .fillColor(COLORS.textLight)
      .font("Helvetica")
      .text(metric.label, cellX + 10, cellY + 10, {
        width: cellWidth - 20,
      });

    // Value
    doc
      .fontSize(20)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text(metric.value.toString(), cellX + 10, cellY + 28, {
        width: cellWidth - 20,
      });
  });
}

/**
 * Security Section
 */
function drawSecuritySection(doc, analysis) {
  drawSectionHeader(doc, "Security Analysis", COLORS.danger);

  const vulnerabilities = analysis.vulnerabilities || [];
  const criticalCount = vulnerabilities.filter(
    (v) => v.severity === "Critical"
  ).length;
  const highCount = vulnerabilities.filter((v) => v.severity === "High").length;
  const mediumCount = vulnerabilities.filter(
    (v) => v.severity === "Medium"
  ).length;
  const lowCount = vulnerabilities.filter((v) => v.severity === "Low").length;

  let y = 150;

  // Summary
  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(`Total vulnerabilities found: ${vulnerabilities.length}`, 50, y);
  y += 30;

  // Severity breakdown
  const severities = [
    { label: "Critical", count: criticalCount, color: COLORS.danger },
    { label: "High", count: highCount, color: "#ff6b00" },
    { label: "Medium", count: mediumCount, color: COLORS.warning },
    { label: "Low", count: lowCount, color: "#fbbf24" },
  ];

  severities.forEach((sev) => {
    if (sev.count > 0) {
      doc
        .roundedRect(50, y, 500, 25, 5)
        .fillColor(sev.color)
        .fillOpacity(0.1)
        .fill();
      doc.fillOpacity(1);
      doc
        .fontSize(11)
        .fillColor(COLORS.text)
        .font("Helvetica-Bold")
        .text(`${sev.label}: `, 60, y + 7, { continued: true });
      doc
        .font("Helvetica")
        .text(`${sev.count} issue${sev.count > 1 ? "s" : ""}`);
      y += 35;
    }
  });

  y += 20;

  // Top vulnerabilities
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Critical & High Severity Issues", 50, y);
  y += 25;

  const criticalVulns = vulnerabilities
    .filter((v) => v.severity === "Critical" || v.severity === "High")
    .slice(0, 5);

  criticalVulns.forEach((vuln, idx) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    drawVulnerabilityCard(doc, 50, y, vuln);
    y += 120;
  });
}

/**
 * Draw vulnerability card
 */
function drawVulnerabilityCard(doc, x, y, vuln) {
  const cardHeight = 110;
  const severityColor = SEVERITY_COLORS[vuln.severity] || COLORS.textLight;

  // Card border
  doc
    .roundedRect(x, y, 500, cardHeight, 5)
    .strokeColor(severityColor)
    .lineWidth(2)
    .stroke();

  // Severity badge
  doc
    .roundedRect(x + 10, y + 10, 70, 20, 3)
    .fillColor(severityColor)
    .fill();

  doc
    .fontSize(9)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text(vuln.severity, x + 10, y + 15, {
      width: 70,
      align: "center",
    });

  // Title
  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(vuln.title, x + 90, y + 12, { width: 400 });

  // OWASP & CWE
  doc
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text(`${vuln.owaspCategory || ""} | ${vuln.cwe || ""}`, x + 10, y + 40);

  // Description
  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      vuln.description.substring(0, 200) +
        (vuln.description.length > 200 ? "..." : ""),
      x + 10,
      y + 55,
      {
        width: 480,
        height: 40,
      }
    );
}

/**
 * Code Quality Section
 */
function drawQualitySection(doc, analysis) {
  drawSectionHeader(doc, "Code Quality Assessment", COLORS.info);

  let y = 150;

  const qualityMetrics = analysis.qualityMetrics || {};
  const codeSmells = qualityMetrics.codeSmells || [];

  // Quality score
  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(`Overall Quality Score: ${analysis.qualityScore || 0}/100`, 50, y);
  y += 30;

  // Code smells summary
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(`Code Smells (${codeSmells.length})`, 50, y);
  y += 25;

  const smellsByCategory = {};
  codeSmells.forEach((smell) => {
    const category = smell.category || smell.type || "Other";
    if (!smellsByCategory[category]) smellsByCategory[category] = 0;
    smellsByCategory[category]++;
  });

  Object.entries(smellsByCategory).forEach(([category, count]) => {
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .font("Helvetica")
      .text(`• ${category}: ${count} issue${count > 1 ? "s" : ""}`, 70, y);
    y += 20;
  });

  y += 20;

  // Top code smells
  const topSmells = codeSmells.filter((s) => s.severity === "High").slice(0, 5);

  if (topSmells.length > 0) {
    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text("High Severity Code Smells", 50, y);
    y += 25;

    topSmells.forEach((smell) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      drawCodeSmellCard(doc, 50, y, smell);
      y += 70;
    });
  }

  // Best practices scores
  if (qualityMetrics.bestPractices) {
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    y += 20;
    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text("Best Practices Compliance", 50, y);
    y += 25;

    const practices = qualityMetrics.bestPractices;
    if (practices.solid) {
      const solidPrinciples = [
        {
          name: "Single Responsibility",
          value: practices.solid.singleResponsibility,
        },
        { name: "Open/Closed", value: practices.solid.openClosed },
        {
          name: "Liskov Substitution",
          value: practices.solid.liskovSubstitution,
        },
        {
          name: "Interface Segregation",
          value: practices.solid.interfaceSegregation,
        },
        {
          name: "Dependency Inversion",
          value: practices.solid.dependencyInversion,
        },
      ];

      solidPrinciples.forEach((principle) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
        drawProgressBar(doc, 50, y, principle.name, principle.value || 0, 100);
        y += 50;
      });
    }
  }
}

/**
 * Draw code smell card
 */
function drawCodeSmellCard(doc, x, y, smell) {
  doc
    .roundedRect(x, y, 500, 60, 5)
    .fillColor(COLORS.warning)
    .fillOpacity(0.1)
    .fill();
  doc.fillOpacity(1);

  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(smell.type, x + 10, y + 10, { width: 480 });

  doc
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text(`Line ${smell.lineNumber || "N/A"}`, x + 10, y + 25);

  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      smell.description.substring(0, 150) +
        (smell.description.length > 150 ? "..." : ""),
      x + 10,
      y + 40,
      {
        width: 480,
      }
    );
}

/**
 * Performance Section
 */
function drawPerformanceSection(doc, analysis) {
  drawSectionHeader(doc, "Performance Analysis", COLORS.success);

  let y = 150;

  const performanceMetrics = analysis.performanceMetrics || {};
  const performanceScore = analysis.performanceScore || 0;

  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(`Performance Score: ${performanceScore}/100`, 50, y);
  y += 40;

  // Performance issues
  const issues = performanceMetrics.issues || [];
  if (issues.length > 0) {
    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text(`Performance Issues (${issues.length})`, 50, y);
    y += 25;

    const highImpact = issues.filter((i) => i.impact === "High").slice(0, 5);

    highImpact.forEach((issue) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      drawPerformanceIssueCard(doc, 50, y, issue);
      y += 90;
    });
  }

  // Resource usage
  if (performanceMetrics.resourceUsage) {
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    y += 20;
    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text("Resource Usage Analysis", 50, y);
    y += 25;

    const resources = performanceMetrics.resourceUsage;
    Object.entries(resources).forEach(([key, value]) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      drawProgressBar(doc, 50, y, label, value || 0, 100);
      y += 50;
    });
  }
}

/**
 * Draw performance issue card
 */
function drawPerformanceIssueCard(doc, x, y, issue) {
  doc
    .roundedRect(x, y, 500, 80, 5)
    .fillColor(COLORS.info)
    .fillOpacity(0.1)
    .fill();
  doc.fillOpacity(1);

  // Impact badge
  const impactColor =
    issue.impact === "High"
      ? COLORS.danger
      : issue.impact === "Medium"
      ? COLORS.warning
      : COLORS.info;
  doc
    .roundedRect(x + 10, y + 10, 50, 18, 3)
    .fillColor(impactColor)
    .fill();
  doc
    .fontSize(8)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text(issue.impact, x + 10, y + 14, {
      width: 50,
      align: "center",
    });

  // Type
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(issue.type, x + 70, y + 12, { width: 420 });

  // Category
  if (issue.category) {
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .font("Helvetica")
      .text(issue.category, x + 10, y + 35);
  }

  // Description
  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      issue.description.substring(0, 150) +
        (issue.description.length > 150 ? "..." : ""),
      x + 10,
      y + 50,
      {
        width: 480,
      }
    );
}

/**
 * Suggestions Section
 */
function drawSuggestionsSection(doc, analysis) {
  drawSectionHeader(doc, "Improvement Suggestions", COLORS.secondary);

  let y = 150;

  const suggestions = analysis.suggestions || [];
  const highPriority = suggestions.filter((s) => s.priority === "High");
  const mediumPriority = suggestions.filter((s) => s.priority === "Medium");

  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      `${highPriority.length} high priority, ${mediumPriority.length} medium priority suggestions`,
      50,
      y
    );
  y += 40;

  // High priority suggestions
  if (highPriority.length > 0) {
    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .text("High Priority", 50, y);
    y += 25;

    highPriority.slice(0, 6).forEach((suggestion) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      drawSuggestionCard(doc, 50, y, suggestion);
      y += 100;
    });
  }
}

/**
 * Draw suggestion card
 */
function drawSuggestionCard(doc, x, y, suggestion) {
  const priorityColor =
    suggestion.priority === "High"
      ? COLORS.danger
      : suggestion.priority === "Medium"
      ? COLORS.warning
      : COLORS.info;

  doc
    .roundedRect(x, y, 500, 90, 5)
    .strokeColor(priorityColor)
    .lineWidth(1.5)
    .stroke();

  // Priority & Type badges
  doc
    .roundedRect(x + 10, y + 10, 60, 18, 3)
    .fillColor(priorityColor)
    .fill();
  doc
    .fontSize(8)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text(suggestion.priority, x + 10, y + 14, {
      width: 60,
      align: "center",
    });

  doc
    .roundedRect(x + 80, y + 10, 80, 18, 3)
    .fillColor(COLORS.primary)
    .fillOpacity(0.2)
    .fill();
  doc.fillOpacity(1);
  doc
    .fontSize(8)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text(suggestion.type, x + 80, y + 14, {
      width: 80,
      align: "center",
    });

  // Title
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(suggestion.title, x + 10, y + 35, { width: 480 });

  // Description
  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(
      suggestion.description.substring(0, 180) +
        (suggestion.description.length > 180 ? "..." : ""),
      x + 10,
      y + 52,
      {
        width: 480,
      }
    );

  // Benefits
  if (suggestion.benefits && suggestion.benefits.length > 0) {
    doc
      .fontSize(8)
      .fillColor(COLORS.success)
      .font("Helvetica-Oblique")
      .text(`✓ ${suggestion.benefits[0]}`, x + 10, y + 75, { width: 480 });
  }
}

/**
 * Metrics Section
 */
function drawMetricsSection(doc, analysis) {
  drawSectionHeader(doc, "Detailed Metrics", COLORS.primary);

  let y = 150;

  const metrics = analysis.qualityMetrics?.metrics || {};

  // Complexity metrics
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Complexity Metrics", 50, y);
  y += 25;

  const complexityMetrics = [
    { label: "Cyclomatic Complexity", value: metrics.complexity || 0 },
    { label: "Cognitive Complexity", value: metrics.cognitiveComplexity || 0 },
    { label: "Max Nesting Depth", value: metrics.maxNestingDepth || 0 },
    { label: "Average Method Length", value: metrics.averageMethodLength || 0 },
  ];

  drawMetricsGrid(doc, 50, y, complexityMetrics);

  y += 150;

  // Size metrics
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Size Metrics", 50, y);
  y += 25;

  const sizeMetrics = [
    { label: "Total Lines", value: metrics.linesOfCode || 0 },
    { label: "Code Lines", value: metrics.codeLines || 0 },
    { label: "Comment Lines", value: metrics.commentLines || 0 },
    { label: "Blank Lines", value: metrics.blankLines || 0 },
    { label: "Functions", value: metrics.functions || 0 },
    { label: "Classes", value: metrics.classes || 0 },
  ];

  drawMetricsGrid(doc, 50, y, sizeMetrics);

  y += 150;

  // Quality metrics
  doc
    .fontSize(14)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text("Quality Metrics", 50, y);
  y += 25;

  const qualityMetricsData = [
    { label: "Maintainability", value: `${metrics.maintainability || 0}/100` },
    { label: "Duplication", value: `${metrics.duplication || 0}%` },
    { label: "Comment Ratio", value: `${metrics.commentRatio || 0}%` },
    { label: "Technical Debt", value: `${metrics.technicalDebt || 0} hrs` },
    { label: "Cohesion", value: `${metrics.cohesion || 0}/100` },
    { label: "Coupling", value: `${metrics.coupling || 0}/100` },
  ];

  drawMetricsGrid(doc, 50, y, qualityMetricsData);
}

/**
 * OWASP Compliance Section
 */
function drawOWASPCompliance(doc, analysis) {
  drawSectionHeader(doc, "OWASP Top 10 Compliance", COLORS.danger);

  let y = 150;

  const owaspCategories = [
    {
      id: "A01",
      name: "Broken Access Control",
      key: "A01_BrokenAccessControl",
    },
    {
      id: "A02",
      name: "Cryptographic Failures",
      key: "A02_CryptographicFailures",
    },
    { id: "A03", name: "Injection", key: "A03_Injection" },
    { id: "A04", name: "Insecure Design", key: "A04_InsecureDesign" },
    {
      id: "A05",
      name: "Security Misconfiguration",
      key: "A05_SecurityMisconfiguration",
    },
    {
      id: "A06",
      name: "Vulnerable Components",
      key: "A06_VulnerableComponents",
    },
    {
      id: "A07",
      name: "Authentication Failures",
      key: "A07_IdentificationFailures",
    },
    {
      id: "A08",
      name: "Software/Data Integrity",
      key: "A08_SoftwareDataIntegrity",
    },
    {
      id: "A09",
      name: "Logging/Monitoring Failures",
      key: "A09_SecurityLoggingFailures",
    },
    { id: "A10", name: "Server-Side Request Forgery", key: "A10_SSRF" },
  ];

  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text("Compliance status for OWASP Top 10 2021:", 50, y);
  y += 30;

  owaspCategories.forEach((category) => {
    const isCompliant = analysis.owaspCompliance?.[category.key] !== false;
    const statusColor = isCompliant ? COLORS.success : COLORS.danger;
    const statusIcon = isCompliant ? "✓" : "✗";

    doc
      .roundedRect(50, y, 500, 30, 5)
      .fillColor(statusColor)
      .fillOpacity(0.1)
      .fill();
    doc.fillOpacity(1);

    doc
      .fontSize(10)
      .fillColor(statusColor)
      .font("Helvetica-Bold")
      .text(statusIcon, 60, y + 10);

    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .font("Helvetica")
      .text(`${category.id}: ${category.name}`, 85, y + 10);

    y += 40;

    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  });
}

/**
 * Draw section header
 */
function drawSectionHeader(doc, title, color) {
  doc.rect(0, 50, doc.page.width, 60).fillColor(color).fillOpacity(0.1).fill();

  doc.fillOpacity(1);

  doc.fontSize(20).fillColor(color).font("Helvetica-Bold").text(title, 50, 70);

  doc
    .moveTo(50, 115)
    .lineTo(doc.page.width - 50, 115)
    .lineWidth(2)
    .strokeColor(color)
    .stroke();
}

/**
 * Add page numbers
 */
function addPageNumbers(doc) {
  const pageCount = doc.bufferedPageRange().count;

  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    // Skip page numbers on cover page
    if (i === 0) continue;

    doc
      .fontSize(9)
      .fillColor(COLORS.textLight)
      .font("Helvetica")
      .text(`Page ${i} of ${pageCount - 1}`, 50, doc.page.height - 50, {
        align: "center",
        width: doc.page.width - 100,
      });
  }
}

export default generatePDFReport;
