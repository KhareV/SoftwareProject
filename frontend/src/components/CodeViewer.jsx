import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Tooltip } from "./Shared";
import { copyToClipboard } from "../utils";

// Register languages
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("cpp", cpp);

const CodeViewer = ({
  code,
  language,
  vulnerabilities = [],
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Create vulnerability map by line number
  const vulnMap = React.useMemo(() => {
    const map = {};
    vulnerabilities.forEach((vuln) => {
      if (vuln.lineNumber) {
        if (!map[vuln.lineNumber]) {
          map[vuln.lineNumber] = [];
        }
        map[vuln.lineNumber].push(vuln);
      }
    });
    return map;
  }, [vulnerabilities]);

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#DC2626",
      High: "#F59E0B",
      Medium: "#F97316",
      Low: "#10B981",
    };
    return colors[severity] || "#6B7280";
  };

  // Custom line number renderer with vulnerability markers
  const lineNumberStyle = (lineNumber) => {
    const hasVuln = vulnMap[lineNumber];
    return {
      style: {
        display: "flex",
        alignItems: "center",
        paddingRight: "1em",
        paddingLeft: "0.5em",
        userSelect: "none",
        backgroundColor: hasVuln ? "rgba(220, 38, 38, 0.2)" : "transparent",
        borderLeft: hasVuln
          ? `4px solid ${getSeverityColor(hasVuln[0].severity)}`
          : "none",
        fontWeight: hasVuln ? "bold" : "normal",
      },
    };
  };

  // Custom line props to highlight vulnerable lines
  const lineProps = (lineNumber) => {
    const hasVuln = vulnMap[lineNumber];
    if (hasVuln) {
      return {
        style: {
          backgroundColor: "rgba(220, 38, 38, 0.15)",
          display: "block",
          width: "100%",
        },
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-200/10">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-light-200 font-mono">{language}</span>
        </div>
        <Tooltip content={copied ? "Copied!" : "Copy code"}>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-light-200 hover:text-light-100 hover:bg-dark-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Code */}
      <div className="relative">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={atomOneDark}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={lineNumberStyle}
          lineProps={lineProps}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "#1E293B",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>

        {/* Vulnerability Markers */}
        {Object.keys(vulnMap).length > 0 && (
          <div className="absolute top-6 right-4 space-y-1">
            {Object.entries(vulnMap)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([lineNum, vulns]) => (
                <Tooltip
                  key={lineNum}
                  content={
                    <div className="space-y-1 max-w-xs">
                      <div className="font-semibold text-white">
                        Line {lineNum}
                      </div>
                      {vulns.map((v, i) => (
                        <div key={i} className="text-xs">
                          <span
                            className="font-semibold"
                            style={{ color: getSeverityColor(v.severity) }}
                          >
                            {v.severity}:
                          </span>{" "}
                          {v.title || v.type}
                        </div>
                      ))}
                    </div>
                  }
                  position="left"
                >
                  <div
                    className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: getSeverityColor(vulns[0].severity),
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {lineNum}
                    </span>
                  </div>
                </Tooltip>
              ))}
          </div>
        )}
      </div>

      {/* Vulnerability Legend */}
      {vulnerabilities.length > 0 && (
        <div className="px-4 py-3 border-t border-light-200/10 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-light-200">Severity:</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-severity-critical"></div>
            <span className="text-light-200">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-severity-high"></div>
            <span className="text-light-200">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-severity-medium"></div>
            <span className="text-light-200">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-severity-low"></div>
            <span className="text-light-200">Low</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CodeViewer;
