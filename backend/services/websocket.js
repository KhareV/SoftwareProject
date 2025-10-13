import { Server } from "socket.io";

let io = null;

/**
 * Initialize Socket.io server
 */
export function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join project-specific room
    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Joined project room: ${projectId}`);
    });

    // Join analysis-specific room
    socket.on("join:analysis", (analysisId) => {
      socket.join(`analysis:${analysisId}`);
      console.log(`Joined analysis room: ${analysisId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit analysis started event
 */
export function emitAnalysisStarted(userId, analysisId, data) {
  if (!io) return;

  io.to(`user:${userId}`).emit("analysis:started", {
    analysisId,
    timestamp: new Date().toISOString(),
    ...data,
  });

  console.log(`📡 Emitted analysis:started for ${analysisId}`);
}

/**
 * Emit analysis progress update
 */
export function emitAnalysisProgress(userId, analysisId, progress, message) {
  if (!io) return;

  io.to(`user:${userId}`)
    .to(`analysis:${analysisId}`)
    .emit("analysis:progress", {
      analysisId,
      progress: Math.min(100, Math.max(0, progress)),
      message,
      timestamp: new Date().toISOString(),
    });

  console.log(`📊 Progress ${progress}%: ${message}`);
}

/**
 * Emit analysis completed event
 */
export function emitAnalysisCompleted(userId, analysisId, results) {
  if (!io) return;

  io.to(`user:${userId}`)
    .to(`analysis:${analysisId}`)
    .emit("analysis:completed", {
      analysisId,
      results,
      timestamp: new Date().toISOString(),
    });

  console.log(`✅ Emitted analysis:completed for ${analysisId}`);
}

/**
 * Emit analysis error
 */
export function emitAnalysisError(userId, analysisId, error) {
  if (!io) return;

  io.to(`user:${userId}`)
    .to(`analysis:${analysisId}`)
    .emit("analysis:error", {
      analysisId,
      error: error.message || "Analysis failed",
      timestamp: new Date().toISOString(),
    });

  console.error(`❌ Emitted analysis:error for ${analysisId}:`, error.message);
}

/**
 * Emit critical vulnerability alert
 */
export function emitCriticalVulnerability(userId, projectId, vulnerability) {
  if (!io) return;

  io.to(`user:${userId}`)
    .to(`project:${projectId}`)
    .emit("vulnerability:critical", {
      projectId,
      vulnerability,
      timestamp: new Date().toISOString(),
    });

  console.log(`🚨 Critical vulnerability alert for project ${projectId}`);
}

/**
 * Emit general notification
 */
export function emitNotification(userId, notification) {
  if (!io) return;

  io.to(`user:${userId}`).emit("notification", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get Socket.io instance
 */
export function getIO() {
  return io;
}
