// ==========================================
// MarketMind AI - Centralized Error Handler Middleware
// Module: Security & API Gateway (Milestone Day 8)
// ==========================================

/**
 * Global Error Handling Middleware
 * Ensures consistent JSON error response schema across all API endpoints.
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Global Error Handler Caught Exception:", err);

  // Handle SyntaxError (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
      error: "Malformed JSON payload"
    });
  }

  // Handle Payload Too Large
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Request payload size exceeds maximum limit of 10KB",
      error: "Payload too large"
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

/**
 * 404 Not Found Handler for Unmatched API Routes
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    error: "Resource not found"
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
