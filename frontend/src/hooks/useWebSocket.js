import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

/**
 * Custom hook for WebSocket connection
 */
export function useWebSocket(userId) {
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      socket.emit("join", userId);
      reconnectAttemptsRef.current = 0;
      toast.success("Connected to real-time updates");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        toast.error("Failed to connect to real-time updates");
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      socket.emit("join", userId);
      toast.success("Reconnected to real-time updates");
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  // Subscribe to analysis events
  const subscribeToAnalysis = useCallback((analysisId, callbacks) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.emit("join:analysis", analysisId);

    // Analysis started
    if (callbacks.onStarted) {
      socket.on("analysis:started", callbacks.onStarted);
    }

    // Analysis progress
    if (callbacks.onProgress) {
      socket.on("analysis:progress", callbacks.onProgress);
    }

    // Analysis completed
    if (callbacks.onCompleted) {
      socket.on("analysis:completed", callbacks.onCompleted);
    }

    // Analysis error
    if (callbacks.onError) {
      socket.on("analysis:error", (data) => {
        toast.error(data.error || "Analysis failed");
        callbacks.onError(data);
      });
    }

    // Cleanup function
    return () => {
      socket.off("analysis:started");
      socket.off("analysis:progress");
      socket.off("analysis:completed");
      socket.off("analysis:error");
    };
  }, []);

  // Subscribe to critical vulnerability alerts
  const subscribeToCriticalAlerts = useCallback((callback) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on("vulnerability:critical", (data) => {
      toast.error(
        `Critical vulnerability detected: ${data.vulnerability.title}`,
        {
          duration: 5000,
        }
      );
      callback(data);
    });

    return () => {
      socket.off("vulnerability:critical");
    };
  }, []);

  // Subscribe to notifications
  const subscribeToNotifications = useCallback((callback) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on("notification", (data) => {
      if (data.type === "success") {
        toast.success(data.message);
      } else if (data.type === "error") {
        toast.error(data.message);
      } else {
        toast(data.message);
      }
      callback(data);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  // Join project room
  const joinProject = useCallback((projectId) => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("join:project", projectId);
    }
  }, []);

  return {
    socket: socketRef.current,
    subscribeToAnalysis,
    subscribeToCriticalAlerts,
    subscribeToNotifications,
    joinProject,
  };
}

/**
 * Hook for analysis with real-time updates
 */
export function useAnalysisWithWebSocket(userId, analysisId) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const { subscribeToAnalysis } = useWebSocket(userId);

  useEffect(() => {
    if (!analysisId) return;

    const unsubscribe = subscribeToAnalysis(analysisId, {
      onStarted: (data) => {
        setIsAnalyzing(true);
        setProgress(0);
        setMessage("Analysis started...");
      },
      onProgress: (data) => {
        setProgress(data.progress);
        setMessage(data.message);
      },
      onCompleted: (data) => {
        setIsAnalyzing(false);
        setProgress(100);
        setMessage("Analysis completed!");
        setResults(data.results);
        toast.success("Code analysis completed!");
      },
      onError: (data) => {
        setIsAnalyzing(false);
        setError(data.error);
        toast.error(`Analysis failed: ${data.error}`);
      },
    });

    return unsubscribe;
  }, [analysisId, subscribeToAnalysis]);

  return {
    progress,
    message,
    isAnalyzing,
    results,
    error,
  };
}
