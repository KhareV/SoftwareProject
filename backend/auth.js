import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const verifyClerkToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No authentication token provided",
      });
    }

    // Verify the session token
    const session = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!session) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authentication token",
      });
    }

    // Attach user ID to request
    req.userId = session.sub;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: err.name || "Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
