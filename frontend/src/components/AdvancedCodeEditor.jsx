import { useState, useEffect } from "react";
import { Play, Save, Download, Upload, Code2, Eye, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";

/**
 * Advanced Code Editor with Syntax Highlighting, Analysis, and GitHub Integration
 */
export default function CodeEditor({
  initialCode = "",
  language = "javascript",
  onCodeChange,
  onAnalyze,
  onSave,
  onGitHubPush,
  readOnly = false,
  showGitHub = false,
}) {
  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleAnalyze = () => {
    if (onAnalyze) {
      onAnalyze(code);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code);
      toast.success("Code saved successfully!");
    }
  };

  const getFileExtension = () => {
    const extensionMap = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rust: "rs",
      php: "php",
      ruby: "rb",
      swift: "swift",
      kotlin: "kt",
      csharp: "cs",
      jsx: "jsx",
      tsx: "tsx",
    };
    return extensionMap[language] || "txt";
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      ".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.swift,.kt,.cs,.html,.css,.json,.xml,.sql,.sh,.bash";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          setCode(content);
          if (onCodeChange) {
            onCodeChange(content);
          }
          toast.success(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleGitHubPush = () => {
    if (onGitHubPush) {
      onGitHubPush(code);
    }
  };

  const getLanguageLabel = () => {
    const labelMap = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      go: "Go",
      rust: "Rust",
      php: "PHP",
      ruby: "Ruby",
      swift: "Swift",
      kotlin: "Kotlin",
      csharp: "C#",
      jsx: "React JSX",
      tsx: "React TSX",
      html: "HTML",
      css: "CSS",
      json: "JSON",
      sql: "SQL",
      bash: "Bash",
    };
    return labelMap[language] || language.toUpperCase();
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="flex flex-col h-full glass rounded-lg border border-light-200/10 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-300 border-b border-light-200/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">Code Editor</span>
          <span className="text-sm text-light-200 ml-2">
            {getLanguageLabel()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="text-sm bg-dark-200 border border-light-200/20 text-white rounded px-2 py-1 focus:outline-none focus:border-primary"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
          </select>

          {/* Line Numbers Toggle */}
          <button
            onClick={() => setLineNumbers(!lineNumbers)}
            className={`px-3 py-1 text-sm rounded transition-all ${
              lineNumbers
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-dark-200 text-light-200 border border-light-200/20"
            }`}
          >
            #
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-all ${
              preview
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-dark-200 text-light-200 border border-light-200/20"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <div className="h-6 w-px bg-light-200/20"></div>

          {/* Upload */}
          <button
            onClick={handleUpload}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-dark-200 text-light-200 border border-light-200/20 rounded hover:bg-dark-100 transition-all"
            title="Upload file"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-dark-200 text-light-200 border border-light-200/20 rounded hover:bg-dark-100 transition-all"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Save */}
          {onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}

          {/* GitHub Push */}
          {showGitHub && onGitHubPush && (
            <button
              onClick={handleGitHubPush}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded hover:opacity-90 transition-all"
            >
              <Github className="w-4 h-4" />
              Push
            </button>
          )}

          {/* Analyze */}
          {onAnalyze && (
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-1 px-4 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-all"
            >
              <Play className="w-4 h-4" />
              Analyze
            </button>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 relative overflow-hidden bg-dark-200">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex"
            >
              {/* Line Numbers */}
              {lineNumbers && (
                <div
                  className="flex-shrink-0 bg-dark-300 border-r border-light-200/10 text-right pr-3 pl-2 pt-4 text-light-200 select-none"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize * 1.5}px`,
                  }}
                >
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
              )}

              {/* Code Textarea */}
              <textarea
                value={code}
                onChange={handleCodeChange}
                readOnly={readOnly}
                className="flex-1 p-4 font-mono outline-none resize-none bg-dark-200 text-white placeholder-light-200"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize * 1.5}px`,
                  tabSize: 2,
                }}
                spellCheck={false}
                placeholder="// Start coding here..."
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-auto p-4 bg-dark-200"
            >
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                showLineNumbers={lineNumbers}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: `${fontSize}px`,
                  backgroundColor: "#1e293b",
                }}
              >
                {code || "// No code to preview"}
              </SyntaxHighlighter>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-300 border-t border-light-200/10 text-sm text-light-200">
        <div className="flex items-center gap-4">
          <span>{lineCount} lines</span>
          <span>{code.length} characters</span>
          <span>
            {code.split(/\s+/).filter((w) => w.length > 0).length} words
          </span>
        </div>
        <div>
          {readOnly && (
            <span className="text-yellow-400 font-medium">Read Only</span>
          )}
        </div>
      </div>
    </div>
  );
}
