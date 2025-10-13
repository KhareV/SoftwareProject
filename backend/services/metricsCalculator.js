/**
 * Advanced Code Metrics Calculator
 * Calculates Cyclomatic Complexity, Halstead Metrics, Maintainability Index, etc.
 */

// Calculate Cyclomatic Complexity from AST
export function calculateCyclomaticComplexity(ast) {
  let complexity = 1; // Base complexity

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    // Decision points that increase complexity
    const decisionNodes = [
      "IfStatement",
      "ConditionalExpression",
      "SwitchCase",
      "ForStatement",
      "ForInStatement",
      "ForOfStatement",
      "WhileStatement",
      "DoWhileStatement",
      "CatchClause",
      "LogicalExpression", // && and ||
    ];

    if (decisionNodes.includes(node.type)) {
      complexity++;
    }

    // Recursively traverse
    for (const key in node) {
      if (key === "loc" || key === "type") continue;
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && typeof child === "object") {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return complexity;
}

// Calculate Halstead Metrics
export function calculateHalsteadMetrics(code) {
  // Operators and operands extraction (simplified)
  const operators = new Set();
  const operands = new Set();
  let totalOperators = 0;
  let totalOperands = 0;

  // Common operators
  const operatorPatterns = [
    /\+\+|--/g, // Increment/decrement
    /[+\-*/%]/g, // Arithmetic
    /[<>]=?|[!=]==?/g, // Comparison
    /&&|\|\|/g, // Logical
    /[&|^~]/g, // Bitwise
    /[=!]=?/g, // Assignment/equality
    /\?|:/g, // Ternary
    /\./g, // Member access
    /\[|\]/g, // Array access
    /\(|\)/g, // Function call
    /{|}|;|,/g, // Delimiters
  ];

  // Extract operators
  operatorPatterns.forEach((pattern) => {
    const matches = code.match(pattern) || [];
    matches.forEach((op) => {
      operators.add(op);
      totalOperators++;
    });
  });

  // Extract operands (identifiers and literals)
  const identifierPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
  const numberPattern = /\b\d+\.?\d*\b/g;
  const stringPattern = /['"`][^'"`]*['"`]/g;

  [identifierPattern, numberPattern, stringPattern].forEach((pattern) => {
    const matches = code.match(pattern) || [];
    matches.forEach((operand) => {
      // Filter out keywords
      const keywords = [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "return",
        "function",
        "const",
        "let",
        "var",
        "class",
        "import",
        "export",
      ];
      if (!keywords.includes(operand)) {
        operands.add(operand);
        totalOperands++;
      }
    });
  });

  const n1 = operators.size; // Distinct operators
  const n2 = operands.size; // Distinct operands
  const N1 = totalOperators; // Total operators
  const N2 = totalOperands; // Total operands

  const n = n1 + n2; // Program vocabulary
  const N = N1 + N2; // Program length

  const volume = N * Math.log2(n || 1);
  const difficulty = (n1 / 2) * (N2 / (n2 || 1));
  const effort = difficulty * volume;
  const time = effort / 18; // Time to program (seconds)
  const bugs = volume / 3000; // Estimated bugs

  return {
    n1,
    n2,
    N1,
    N2,
    vocabulary: n,
    length: N,
    volume: Math.round(volume),
    difficulty: Math.round(difficulty * 100) / 100,
    effort: Math.round(effort),
    timeToProgram: Math.round(time),
    estimatedBugs: Math.round(bugs * 100) / 100,
  };
}

// Calculate Maintainability Index
export function calculateMaintainabilityIndex(
  cyclomaticComplexity,
  halsteadVolume,
  linesOfCode
) {
  // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
  // Normalized to 0-100 scale

  const HV = halsteadVolume || 1;
  const CC = cyclomaticComplexity || 1;
  const LOC = linesOfCode || 1;

  let MI = 171 - 5.2 * Math.log(HV) - 0.23 * CC - 16.2 * Math.log(LOC);

  // Normalize to 0-100
  MI = Math.max(0, Math.min(100, MI));

  return Math.round(MI);
}

// Detect code duplication
export function detectDuplication(code) {
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const duplicates = [];
  const minLength = 3; // Minimum lines for duplication

  for (let i = 0; i < lines.length - minLength; i++) {
    for (let j = i + minLength; j < lines.length; j++) {
      let matchLength = 0;

      while (
        i + matchLength < lines.length &&
        j + matchLength < lines.length &&
        lines[i + matchLength] === lines[j + matchLength]
      ) {
        matchLength++;
      }

      if (matchLength >= minLength) {
        duplicates.push({
          lines1: [i + 1, i + matchLength],
          lines2: [j + 1, j + matchLength],
          length: matchLength,
        });
      }
    }
  }

  const totalDuplicatedLines = duplicates.reduce((sum, d) => sum + d.length, 0);
  const duplicationPercentage = (totalDuplicatedLines / lines.length) * 100;

  return {
    duplicates,
    totalDuplicatedLines,
    duplicationPercentage: Math.round(duplicationPercentage * 100) / 100,
  };
}

// Calculate Cognitive Complexity (simplified version)
export function calculateCognitiveComplexity(ast) {
  let complexity = 0;
  let nestingLevel = 0;

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    // Nesting increment nodes
    const nestingNodes = [
      "IfStatement",
      "ForStatement",
      "ForInStatement",
      "ForOfStatement",
      "WhileStatement",
      "DoWhileStatement",
      "SwitchStatement",
      "CatchClause",
    ];

    const wasNesting = nestingNodes.includes(node.type);

    if (wasNesting) {
      nestingLevel++;
      complexity += nestingLevel; // Add nesting level to complexity
    }

    // Additional complexity for logical operators
    if (node.type === "LogicalExpression") {
      complexity++;
    }

    // Recursively traverse
    for (const key in node) {
      if (key === "loc" || key === "type") continue;
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && typeof child === "object") {
        traverse(child);
      }
    }

    if (wasNesting) {
      nestingLevel--;
    }
  }

  traverse(ast);
  return complexity;
}

// Calculate Technical Debt (estimated hours to fix)
export function calculateTechnicalDebt(metrics, vulnerabilities, codeSmells) {
  let debtHours = 0;

  // Complexity debt
  if (metrics.cyclomaticComplexity > 20) {
    debtHours += (metrics.cyclomaticComplexity - 20) * 0.5;
  }

  // Duplication debt
  if (metrics.duplicationPercentage > 10) {
    debtHours += (metrics.duplicationPercentage - 10) * 0.3;
  }

  // Maintainability debt
  if (metrics.maintainabilityIndex < 50) {
    debtHours += (50 - metrics.maintainabilityIndex) * 0.2;
  }

  // Security debt
  const vulnerabilityWeights = {
    Critical: 4,
    High: 2,
    Medium: 1,
    Low: 0.5,
  };

  vulnerabilities.forEach((vuln) => {
    debtHours += vulnerabilityWeights[vuln.severity] || 1;
  });

  // Code smell debt
  const smellWeights = {
    High: 1,
    Medium: 0.5,
    Low: 0.25,
  };

  codeSmells.forEach((smell) => {
    debtHours += smellWeights[smell.severity] || 0.5;
  });

  return Math.round(debtHours * 100) / 100;
}

// Main function to calculate all metrics
export async function calculateAllMetrics(
  code,
  ast,
  language,
  vulnerabilities = [],
  codeSmells = []
) {
  try {
    const lines = code.split("\n");
    const codeLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*")
      );
    });
    const commentLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*")
      );
    });

    const cyclomaticComplexity = ast ? calculateCyclomaticComplexity(ast) : 1;
    const halstead = calculateHalsteadMetrics(code);
    const cognitiveComplexity = ast ? calculateCognitiveComplexity(ast) : 0;
    const duplication = detectDuplication(code);
    const maintainabilityIndex = calculateMaintainabilityIndex(
      cyclomaticComplexity,
      halstead.volume,
      codeLines.length
    );

    const metrics = {
      linesOfCode: lines.length,
      codeLines: codeLines.length,
      commentLines: commentLines.length,
      blankLines: lines.length - codeLines.length - commentLines.length,
      commentRatio:
        Math.round((commentLines.length / (codeLines.length || 1)) * 10000) /
        100,

      cyclomaticComplexity,
      cognitiveComplexity,
      maintainabilityIndex,

      halstead,

      duplication: {
        percentage: duplication.duplicationPercentage,
        instances: duplication.duplicates.length,
        totalLines: duplication.totalDuplicatedLines,
      },
    };

    metrics.technicalDebt = calculateTechnicalDebt(
      metrics,
      vulnerabilities,
      codeSmells
    );

    // Calculate overall quality score (0-100)
    const qualityScore = Math.round(
      maintainabilityIndex * 0.4 +
        Math.max(0, 100 - cyclomaticComplexity * 2) * 0.2 +
        Math.max(0, 100 - duplication.duplicationPercentage * 2) * 0.2 +
        metrics.commentRatio * 0.2
    );

    metrics.qualityScore = Math.max(0, Math.min(100, qualityScore));

    return metrics;
  } catch (error) {
    console.error("Metrics calculation error:", error);
    return {
      linesOfCode: code.split("\n").length,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      commentRatio: 0,
      cyclomaticComplexity: 1,
      cognitiveComplexity: 0,
      maintainabilityIndex: 50,
      halstead: {},
      duplication: { percentage: 0, instances: 0, totalLines: 0 },
      technicalDebt: 0,
      qualityScore: 50,
    };
  }
}

// Get complexity rating
export function getComplexityRating(complexity) {
  if (complexity <= 5) return { level: "Low", color: "green", score: 90 };
  if (complexity <= 10)
    return { level: "Moderate", color: "yellow", score: 70 };
  if (complexity <= 20) return { level: "High", color: "orange", score: 50 };
  return { level: "Very High", color: "red", score: 20 };
}

// Get maintainability rating
export function getMaintainabilityRating(index) {
  if (index >= 80) return { level: "Excellent", color: "green" };
  if (index >= 60) return { level: "Good", color: "blue" };
  if (index >= 40) return { level: "Fair", color: "yellow" };
  if (index >= 20) return { level: "Poor", color: "orange" };
  return { level: "Critical", color: "red" };
}
