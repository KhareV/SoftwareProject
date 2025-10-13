import parser from "@babel/parser";
import { parse as acornParse } from "acorn";

/**
 * Multi-language code parser
 * Extracts AST and code structure for analysis
 */

// Parse JavaScript/TypeScript code
export function parseJavaScript(code, isTypeScript = false) {
  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: isTypeScript
        ? ["typescript", "jsx", "decorators-legacy"]
        : ["jsx", "decorators-legacy", "classProperties", "dynamicImport"],
    });

    return {
      success: true,
      ast,
      language: isTypeScript ? "typescript" : "javascript",
    };
  } catch (error) {
    console.error("Parse error:", error.message);
    return {
      success: false,
      error: error.message,
      line: error.loc?.line,
      column: error.loc?.column,
    };
  }
}

// Parse TypeScript
export function parseTypeScript(code) {
  return parseJavaScript(code, true);
}

// Extract functions from AST
export function extractFunctions(ast) {
  const functions = [];

  function traverse(node, parent = null) {
    if (!node || typeof node !== "object") return;

    // Function declarations
    if (node.type === "FunctionDeclaration") {
      functions.push({
        name: node.id?.name || "anonymous",
        type: "function",
        params: node.params?.length || 0,
        async: node.async || false,
        generator: node.generator || false,
        loc: node.loc,
      });
    }

    // Arrow functions and function expressions
    if (
      node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression"
    ) {
      const name = parent?.id?.name || parent?.key?.name || "anonymous";
      functions.push({
        name,
        type: node.type === "ArrowFunctionExpression" ? "arrow" : "expression",
        params: node.params?.length || 0,
        async: node.async || false,
        loc: node.loc,
      });
    }

    // Class methods
    if (node.type === "MethodDefinition" || node.type === "ClassMethod") {
      functions.push({
        name: node.key?.name || "anonymous",
        type: "method",
        kind: node.kind || "method",
        params: node.value?.params?.length || 0,
        async: node.value?.async || false,
        static: node.static || false,
        loc: node.loc,
      });
    }

    // Recursively traverse children
    for (const key in node) {
      if (key === "loc" || key === "type") continue;
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach((c) => traverse(c, node));
      } else if (child && typeof child === "object") {
        traverse(child, node);
      }
    }
  }

  traverse(ast);
  return functions;
}

// Extract classes from AST
export function extractClasses(ast) {
  const classes = [];

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    if (node.type === "ClassDeclaration" || node.type === "ClassExpression") {
      const methods = [];
      const properties = [];

      if (node.body?.body) {
        node.body.body.forEach((member) => {
          if (
            member.type === "MethodDefinition" ||
            member.type === "ClassMethod"
          ) {
            methods.push({
              name: member.key?.name,
              kind: member.kind,
              static: member.static || false,
              async: member.value?.async || false,
            });
          } else if (
            member.type === "ClassProperty" ||
            member.type === "PropertyDefinition"
          ) {
            properties.push({
              name: member.key?.name,
              static: member.static || false,
            });
          }
        });
      }

      classes.push({
        name: node.id?.name || "anonymous",
        superClass: node.superClass?.name || null,
        methods,
        properties,
        loc: node.loc,
      });
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
  return classes;
}

// Extract imports/dependencies
export function extractImports(ast) {
  const imports = [];

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    // ES6 imports
    if (node.type === "ImportDeclaration") {
      imports.push({
        source: node.source?.value,
        type: "import",
        specifiers:
          node.specifiers?.map((s) => ({
            imported: s.imported?.name || s.local?.name,
            local: s.local?.name,
          })) || [],
      });
    }

    // CommonJS require
    if (node.type === "CallExpression" && node.callee?.name === "require") {
      if (node.arguments?.[0]?.value) {
        imports.push({
          source: node.arguments[0].value,
          type: "require",
        });
      }
    }

    // Dynamic imports
    if (node.type === "ImportExpression") {
      if (node.source?.value) {
        imports.push({
          source: node.source.value,
          type: "dynamic",
        });
      }
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
  return imports;
}

// Extract variables
export function extractVariables(ast) {
  const variables = [];

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    if (node.type === "VariableDeclaration") {
      node.declarations?.forEach((decl) => {
        variables.push({
          name: decl.id?.name,
          kind: node.kind,
          initialized: decl.init !== null,
          loc: decl.loc,
        });
      });
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
  return variables;
}

// Calculate basic AST metrics
export function calculateASTMetrics(ast, code) {
  const functions = extractFunctions(ast);
  const classes = extractClasses(ast);
  const imports = extractImports(ast);
  const variables = extractVariables(ast);

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

  return {
    totalLines: lines.length,
    codeLines: codeLines.length,
    commentLines: commentLines.length,
    blankLines: lines.length - codeLines.length - commentLines.length,
    functions: functions.length,
    classes: classes.length,
    imports: imports.length,
    variables: variables.length,
    avgFunctionParams:
      functions.length > 0
        ? functions.reduce((sum, f) => sum + f.params, 0) / functions.length
        : 0,
    asyncFunctions: functions.filter((f) => f.async).length,
  };
}

// Main parser function - routes to correct parser
export function parseCode(code, language) {
  language = language.toLowerCase();

  try {
    let result;

    switch (language) {
      case "javascript":
      case "js":
        result = parseJavaScript(code, false);
        break;

      case "typescript":
      case "ts":
      case "tsx":
        result = parseTypeScript(code);
        break;

      case "jsx":
        result = parseJavaScript(code, false);
        break;

      default:
        return {
          success: false,
          error: `Language ${language} not supported for AST parsing`,
          language,
        };
    }

    if (result.success) {
      const functions = extractFunctions(result.ast);
      const classes = extractClasses(result.ast);
      const imports = extractImports(result.ast);
      const variables = extractVariables(result.ast);
      const metrics = calculateASTMetrics(result.ast, code);

      return {
        success: true,
        ast: result.ast,
        structure: {
          functions,
          classes,
          imports,
          variables,
        },
        metrics,
        language: result.language,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      language,
    };
  }
}

// Detect hardcoded secrets in code
export function detectHardcodedSecrets(code) {
  const secrets = [];
  const lines = code.split("\n");

  const patterns = [
    {
      regex: /(?:api[_-]?key|apikey)\s*[=:]\s*['"]([^'"]+)['"]/gi,
      type: "API Key",
    },
    {
      regex: /(?:secret|password|passwd|pwd)\s*[=:]\s*['"]([^'"]+)['"]/gi,
      type: "Password/Secret",
    },
    {
      regex: /(?:token|auth[_-]?token)\s*[=:]\s*['"]([^'"]+)['"]/gi,
      type: "Auth Token",
    },
    {
      regex:
        /(?:aws[_-]?access[_-]?key[_-]?id)\s*[=:]\s*['"]([A-Z0-9]{20})['"]/gi,
      type: "AWS Access Key",
    },
    {
      regex: /(?:private[_-]?key)\s*[=:]\s*['"]([^'"]+)['"]/gi,
      type: "Private Key",
    },
    {
      regex: /mongodb(?:\+srv)?:\/\/[^:]+:([^@]+)@/gi,
      type: "MongoDB Password",
    },
    {
      regex: /postgres(?:ql)?:\/\/[^:]+:([^@]+)@/gi,
      type: "PostgreSQL Password",
    },
    { regex: /sk-[a-zA-Z0-9]{32,}/g, type: "OpenAI API Key" },
    { regex: /gsk_[a-zA-Z0-9]{32,}/g, type: "Groq API Key" },
    { regex: /ghp_[a-zA-Z0-9]{36}/g, type: "GitHub Personal Access Token" },
  ];

  lines.forEach((line, index) => {
    patterns.forEach(({ regex, type }) => {
      const matches = line.matchAll(regex);
      for (const match of matches) {
        secrets.push({
          type,
          line: index + 1,
          value: match[1] || match[0],
          snippet: line.trim(),
        });
      }
    });
  });

  return secrets;
}
