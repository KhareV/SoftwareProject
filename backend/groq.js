import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Use Llama 3.3 70B model (fast and powerful)
const MODEL = "llama-3.3-70b-versatile";

// Analyze security vulnerabilities based on OWASP Top 10
export async function analyzeSecurity(code, language) {
  const prompt = `You are a security expert analyzing ${language} code for vulnerabilities.

Analyze this code for OWASP Top 10 2021 security vulnerabilities:
${code}

Return a JSON array of vulnerabilities found (return empty array if none). Each vulnerability must have:
{
  "severity": "Critical" | "High" | "Medium" | "Low",
  "title": "Short vulnerability title",
  "description": "Detailed description",
  "lineNumber": line_number_where_found,
  "cwe": "CWE-XXX",
  "owaspCategory": "A01" to "A10",
  "recommendation": "How to fix",
  "codeSnippet": "Vulnerable code snippet",
  "fixSuggestion": "Suggested secure code"
}

OWASP Categories:
A01: Broken Access Control
A02: Cryptographic Failures
A03: Injection (SQL, XSS, Command)
A04: Insecure Design
A05: Security Misconfiguration
A06: Vulnerable and Outdated Components
A07: Identification and Authentication Failures
A08: Software and Data Integrity Failures
A09: Security Logging and Monitoring Failures
A10: Server-Side Request Forgery (SSRF)

Return ONLY valid JSON array, no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const response = completion.choices[0]?.message?.content || "[]";

    // Clean up response
    let jsonText = response.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const vulnerabilities = JSON.parse(jsonText);
    return Array.isArray(vulnerabilities) ? vulnerabilities : [];
  } catch (error) {
    console.error("Security analysis error:", error);
    return [];
  }
}

// Analyze code quality and metrics
export async function analyzeQuality(code, language) {
  const prompt = `You are a code quality expert analyzing ${language} code.

Analyze this code for quality metrics and code smells:
${code}

Return a JSON object with these exact fields:
{
  "metrics": {
    "complexity": cyclomatic_complexity_score_0_to_100,
    "maintainability": maintainability_index_0_to_100,
    "duplication": code_duplication_percentage_0_to_100,
    "linesOfCode": total_lines,
    "functions": number_of_functions,
    "classes": number_of_classes,
    "comments": number_of_comment_lines,
    "commentRatio": percentage_0_to_100,
    "technicalDebt": estimated_hours_to_fix
  },
  "qualityScore": overall_quality_0_to_100,
  "codeSmells": [
    {
      "type": "smell type",
      "description": "description",
      "lineNumber": line_number,
      "severity": "High" | "Medium" | "Low"
    }
  ]
}

Consider: Long methods, large classes, duplicated code, complex conditionals, magic numbers, poor naming, lack of comments, tight coupling.

Return ONLY valid JSON object, no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "{}";

    let jsonText = response.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const analysis = JSON.parse(jsonText);
    return analysis;
  } catch (error) {
    console.error("Quality analysis error:", error);
    return {
      metrics: {
        complexity: 50,
        maintainability: 50,
        duplication: 20,
        linesOfCode: code.split("\n").length,
        functions: 0,
        classes: 0,
        comments: 0,
        commentRatio: 0,
        technicalDebt: 1,
      },
      qualityScore: 50,
      codeSmells: [],
    };
  }
}

// Analyze performance issues
export async function analyzePerformance(code, language) {
  const prompt = `You are a performance optimization expert analyzing ${language} code.

Analyze this code for performance issues:
${code}

Return a JSON object:
{
  "performanceScore": score_0_to_100,
  "issues": [
    {
      "type": "issue type",
      "description": "description",
      "lineNumber": line_number,
      "impact": "High" | "Medium" | "Low",
      "suggestion": "optimization suggestion"
    }
  ]
}

Look for: Inefficient loops, memory leaks, unnecessary computations, blocking operations, N+1 queries, missing indexes, large payloads.

Return ONLY valid JSON object, no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "{}";

    let jsonText = response.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const analysis = JSON.parse(jsonText);
    return analysis;
  } catch (error) {
    console.error("Performance analysis error:", error);
    return {
      performanceScore: 70,
      issues: [],
    };
  }
}

// Generate improvement suggestions
export async function generateSuggestions(
  code,
  language,
  vulnerabilities,
  codeSmells
) {
  const prompt = `You are a senior software engineer providing code improvement suggestions for ${language} code.

Code:
${code}

Known issues:
- ${vulnerabilities.length} security vulnerabilities
- ${codeSmells.length} code smells

Generate actionable improvement suggestions. Return JSON array:
[
  {
    "type": "refactoring" | "performance" | "security" | "style" | "documentation",
    "title": "Short title",
    "description": "Detailed explanation",
    "priority": "High" | "Medium" | "Low",
    "originalCode": "code snippet to change",
    "suggestedCode": "improved code",
    "lineNumber": line_number
  }
]

Focus on: Security fixes, refactoring opportunities, performance improvements, better naming, documentation, modern patterns.

Return ONLY valid JSON array (max 8 suggestions), no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 3096,
    });

    const response = completion.choices[0]?.message?.content || "[]";

    let jsonText = response.trim();
    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    // Remove control characters that would break JSON parsing
    jsonText = jsonText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    const suggestions = JSON.parse(jsonText);
    return Array.isArray(suggestions) ? suggestions.slice(0, 8) : [];
  } catch (error) {
    console.error("Suggestions generation error:", error);
    console.error("Response text:", completion.choices[0]?.message?.content);
    return [];
  }
}

// Check OWASP compliance based on vulnerabilities
export function checkOWASPCompliance(vulnerabilities) {
  const compliance = {
    A01_BrokenAccessControl: true,
    A02_CryptographicFailures: true,
    A03_Injection: true,
    A04_InsecureDesign: true,
    A05_SecurityMisconfiguration: true,
    A06_VulnerableComponents: true,
    A07_IdentificationFailures: true,
    A08_SoftwareDataIntegrity: true,
    A09_SecurityLoggingFailures: true,
    A10_SSRF: true,
  };

  vulnerabilities.forEach((vuln) => {
    if (vuln.owaspCategory) {
      const key = vuln.owaspCategory.replace(":", "_").replace(/\s+/g, "");
      if (compliance.hasOwnProperty(key)) {
        compliance[key] = false;
      }
    }
  });

  return compliance;
}

// Calculate security score
export function calculateSecurityScore(vulnerabilities) {
  if (vulnerabilities.length === 0) return 100;

  const weights = {
    Critical: 25,
    High: 15,
    Medium: 8,
    Low: 3,
  };

  let totalDeduction = 0;
  vulnerabilities.forEach((vuln) => {
    totalDeduction += weights[vuln.severity] || 0;
  });

  const score = Math.max(0, 100 - totalDeduction);
  return Math.round(score);
}
