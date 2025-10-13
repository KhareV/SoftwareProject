import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now,
  },
  analysisCount: {
    type: Number,
    default: 0,
  },
});

const vulnerabilitySchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    lineNumber: Number,
    cwe: String,
    owaspCategory: String,
    recommendation: String,
    codeSnippet: String,
    fixSuggestion: String,
  },
  { _id: false }
);

const metricsSchema = new mongoose.Schema(
  {
    complexity: Number,
    maintainability: Number,
    duplication: Number,
    linesOfCode: Number,
    functions: Number,
    classes: Number,
    comments: Number,
    commentRatio: Number,
    technicalDebt: Number,
  },
  { _id: false }
);

const suggestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "refactoring",
        "performance",
        "security",
        "style",
        "documentation",
      ],
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
    },
    originalCode: String,
    suggestedCode: String,
    lineNumber: Number,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  vulnerabilities: [vulnerabilitySchema],
  metrics: metricsSchema,
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  suggestions: [suggestionSchema],
  owaspCompliance: {
    A01_BrokenAccessControl: { type: Boolean, default: true },
    A02_CryptographicFailures: { type: Boolean, default: true },
    A03_Injection: { type: Boolean, default: true },
    A04_InsecureDesign: { type: Boolean, default: true },
    A05_SecurityMisconfiguration: { type: Boolean, default: true },
    A06_VulnerableComponents: { type: Boolean, default: true },
    A07_IdentificationFailures: { type: Boolean, default: true },
    A08_SoftwareDataIntegrity: { type: Boolean, default: true },
    A09_SecurityLoggingFailures: { type: Boolean, default: true },
    A10_SSRF: { type: Boolean, default: true },
  },
  technicalDebtScore: {
    type: Number,
    default: 0,
  },
  analysisTimeMs: Number,
});

// Indexes for better query performance
projectSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, timestamp: -1 });
analysisSchema.index({ projectId: 1, timestamp: -1 });

export const Project = mongoose.model("Project", projectSchema);
export const Analysis = mongoose.model("Analysis", analysisSchema);
