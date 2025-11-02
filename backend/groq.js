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
  const prompt = `You are a cybersecurity expert and penetration tester analyzing ${language} code for vulnerabilities.

Perform a comprehensive security audit on this code based on OWASP Top 10 2021 and security best practices:
${code}

Return a JSON array of vulnerabilities found (return empty array if none). Each vulnerability must have:
{
  "severity": "Critical" | "High" | "Medium" | "Low",
  "title": "Short, specific vulnerability title",
  "description": "Detailed technical description of the vulnerability",
  "lineNumber": line_number_where_found,
  "cwe": "CWE-XXX (Common Weakness Enumeration ID)",
  "owaspCategory": "A01" to "A10",
  "cvss": score_0_to_10,
  "exploitability": "Easy|Medium|Hard",
  "recommendation": "Detailed remediation steps",
  "codeSnippet": "Exact vulnerable code snippet",
  "fixSuggestion": "Suggested secure code replacement",
  "impact": "Detailed impact if exploited",
  "references": ["URL to documentation or CVE details"]
}

OWASP Top 10 2021 Categories:
A01: Broken Access Control - Missing authorization, insecure direct object references, path traversal
A02: Cryptographic Failures - Weak encryption, hardcoded secrets, insecure random, plain text storage
A03: Injection - SQL injection, XSS, command injection, LDAP, XML, template injection
A04: Insecure Design - Missing security controls, threat modeling failures, business logic flaws
A05: Security Misconfiguration - Default configs, verbose errors, unnecessary features enabled
A06: Vulnerable and Outdated Components - Known CVEs in dependencies, outdated libraries
A07: Identification and Authentication Failures - Broken auth, weak passwords, session management
A08: Software and Data Integrity Failures - Unsigned updates, insecure deserialization, CI/CD vulnerabilities
A09: Security Logging and Monitoring Failures - Missing logs, inadequate monitoring, no alerting
A10: Server-Side Request Forgery (SSRF) - Unvalidated URLs, internal resource access

Also check for:
- Input validation and sanitization
- Output encoding
- Authentication and authorization
- Session management
- Cryptography usage
- Error handling and information disclosure
- Secure coding practices
- API security
- File upload/download security
- Race conditions and timing attacks

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
  const prompt = `You are a senior code quality architect analyzing ${language} code with expertise in software engineering best practices.

Perform a comprehensive quality analysis on this code:
${code}

Return a detailed JSON object with these exact fields:
{
  "metrics": {
    "complexity": cyclomatic_complexity_score_0_to_100,
    "cognitiveComplexity": cognitive_complexity_0_to_100,
    "maintainability": maintainability_index_0_to_100,
    "duplication": code_duplication_percentage_0_to_100,
    "linesOfCode": total_lines,
    "codeLines": actual_code_lines_excluding_comments_blanks,
    "commentLines": number_of_comment_lines,
    "blankLines": number_of_blank_lines,
    "functions": number_of_functions,
    "classes": number_of_classes,
    "interfaces": number_of_interfaces,
    "commentRatio": percentage_0_to_100,
    "averageMethodLength": avg_lines_per_method,
    "maxNestingDepth": maximum_nesting_level,
    "technicalDebt": estimated_hours_to_fix,
    "cohesion": class_cohesion_score_0_to_100,
    "coupling": coupling_score_0_to_100_lower_is_better
  },
  "qualityScore": overall_quality_0_to_100,
  "codeSmells": [
    {
      "type": "smell type",
      "category": "Complexity|Duplication|Naming|Structure|Documentation",
      "description": "detailed description",
      "lineNumber": line_number,
      "severity": "High" | "Medium" | "Low",
      "impact": "impact on codebase",
      "effort": "Low|Medium|High"
    }
  ],
  "architectureIssues": [
    {
      "pattern": "detected anti-pattern or issue",
      "description": "explanation",
      "impact": "High|Medium|Low",
      "recommendation": "how to fix"
    }
  ],
  "bestPractices": {
    "solid": {
      "singleResponsibility": score_0_to_100,
      "openClosed": score_0_to_100,
      "liskovSubstitution": score_0_to_100,
      "interfaceSegregation": score_0_to_100,
      "dependencyInversion": score_0_to_100
    },
    "errorHandling": score_0_to_100,
    "naming": score_0_to_100,
    "documentation": score_0_to_100,
    "testability": score_0_to_100
  },
  "designPatterns": [
    {
      "pattern": "pattern name",
      "location": "where found",
      "usage": "Correct|Incorrect|Partial"
    }
  ]
}

Analyze thoroughly:
- Code smells: Long methods, god classes, duplicated code, complex conditionals, magic numbers, poor naming, tight coupling, feature envy
- Architecture: Layering, separation of concerns, modularity, dependency management
- SOLID principles compliance
- Design patterns usage and misuse
- Error handling strategies
- Code organization and structure
- Testability and maintainability

Return ONLY valid JSON object, no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 3072,
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
        cognitiveComplexity: 50,
        maintainability: 50,
        duplication: 20,
        linesOfCode: code.split("\n").length,
        codeLines: code.split("\n").filter((l) => l.trim()).length,
        commentLines: 0,
        blankLines: code.split("\n").filter((l) => !l.trim()).length,
        functions: 0,
        classes: 0,
        interfaces: 0,
        commentRatio: 0,
        averageMethodLength: 0,
        maxNestingDepth: 0,
        technicalDebt: 1,
        cohesion: 50,
        coupling: 50,
      },
      qualityScore: 50,
      codeSmells: [],
      architectureIssues: [],
      bestPractices: {
        solid: {
          singleResponsibility: 50,
          openClosed: 50,
          liskovSubstitution: 50,
          interfaceSegregation: 50,
          dependencyInversion: 50,
        },
        errorHandling: 50,
        naming: 50,
        documentation: 50,
        testability: 50,
      },
      designPatterns: [],
    };
  }
}

// Analyze performance issues
export async function analyzePerformance(code, language) {
  const prompt = `You are a performance optimization expert and profiling specialist analyzing ${language} code.

Conduct a deep performance analysis on this code:
${code}

Return a comprehensive JSON object:
{
  "performanceScore": overall_score_0_to_100,
  "issues": [
    {
      "type": "issue type",
      "category": "Algorithm|Memory|I/O|Database|Network|Concurrency",
      "description": "detailed description",
      "lineNumber": line_number,
      "impact": "High" | "Medium" | "Low",
      "currentComplexity": "time complexity of current code",
      "optimalComplexity": "achievable time complexity",
      "suggestion": "optimization suggestion with code example",
      "estimatedGain": "percentage improvement or description"
    }
  ],
  "memoryAnalysis": {
    "score": score_0_to_100,
    "issues": ["memory leak risks", "unnecessary allocations"],
    "recommendations": ["memory optimization tips"]
  },
  "algorithmicEfficiency": {
    "score": score_0_to_100,
    "bottlenecks": [
      {
        "location": "line number or function",
        "issue": "description",
        "improvement": "suggestion"
      }
    ]
  },
  "databaseOptimization": {
    "nPlusOneQueries": number_found,
    "missingIndexes": ["suggested indexes"],
    "inefficientQueries": ["query descriptions"]
  },
  "concurrencyIssues": [
    {
      "type": "race condition|deadlock|thread safety",
      "description": "issue details",
      "risk": "High|Medium|Low"
    }
  ],
  "resourceUsage": {
    "fileHandling": score_0_to_100,
    "networkCalls": score_0_to_100,
    "caching": score_0_to_100
  }
}

Analyze comprehensively:
- Algorithm complexity: Inefficient loops, nested iterations, recursive calls, search algorithms
- Memory management: Leaks, unnecessary allocations, object pooling opportunities, garbage collection pressure
- I/O operations: File handling, network calls, database queries, blocking vs async
- Database: N+1 queries, missing indexes, inefficient joins, large result sets
- Caching: Missing cache opportunities, cache invalidation, memoization
- Concurrency: Thread safety, race conditions, deadlocks, synchronization overhead
- Resource management: Connection pooling, file handles, memory buffers

Return ONLY valid JSON object, no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 3072,
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
      memoryAnalysis: {
        score: 70,
        issues: [],
        recommendations: [],
      },
      algorithmicEfficiency: {
        score: 70,
        bottlenecks: [],
      },
      databaseOptimization: {
        nPlusOneQueries: 0,
        missingIndexes: [],
        inefficientQueries: [],
      },
      concurrencyIssues: [],
      resourceUsage: {
        fileHandling: 70,
        networkCalls: 70,
        caching: 70,
      },
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
  const prompt = `You are a senior software architect and code reviewer providing comprehensive improvement suggestions for ${language} code.

Code to review:
${code}

Known issues identified:
- ${vulnerabilities.length} security vulnerabilities (${
    vulnerabilities.filter(
      (v) => v.severity === "Critical" || v.severity === "High"
    ).length
  } critical/high)
- ${codeSmells.length} code smells detected

Generate prioritized, actionable improvement suggestions covering all aspects of code quality. Return JSON array:
[
  {
    "type": "refactoring" | "performance" | "security" | "style" | "documentation" | "testing" | "architecture",
    "title": "Clear, specific title",
    "description": "Comprehensive explanation with rationale and benefits",
    "priority": "High" | "Medium" | "Low",
    "effort": "Low (< 1hr)" | "Medium (1-4hrs)" | "High (> 4hrs)",
    "impact": "High" | "Medium" | "Low",
    "category": "Code Quality|Performance|Security|Maintainability|Scalability",
    "originalCode": "specific code snippet to change",
    "suggestedCode": "improved code with comments explaining changes",
    "lineNumber": line_number,
    "benefits": ["benefit 1", "benefit 2"],
    "tradeoffs": ["any tradeoffs or considerations"],
    "relatedPatterns": ["design pattern or best practice name"]
  }
]

Focus on:
1. **Security fixes** - Address all vulnerabilities with secure alternatives
2. **Refactoring opportunities** - Extract methods, reduce complexity, improve cohesion
3. **Performance optimizations** - Algorithm improvements, caching, async operations
4. **Design patterns** - Apply appropriate patterns (Strategy, Factory, Observer, etc.)
5. **Modern language features** - Use latest language capabilities
6. **Error handling** - Robust exception handling and validation
7. **Code organization** - Better structure, naming, modularity
8. **Documentation** - Add meaningful comments, JSDoc/docstrings
9. **Testing** - Improve testability, suggest test cases
10. **Scalability** - Make code more maintainable and extensible

Provide specific, implementable suggestions with actual code examples.
Return ONLY valid JSON array (max 12 suggestions), no markdown or explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 4096,
    });

    const response = completion.choices[0]?.message?.content || "[]";

    let jsonText = response.trim();
    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    // Remove control characters that would break JSON parsing
    jsonText = jsonText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    const suggestions = JSON.parse(jsonText);
    return Array.isArray(suggestions) ? suggestions.slice(0, 12) : [];
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
