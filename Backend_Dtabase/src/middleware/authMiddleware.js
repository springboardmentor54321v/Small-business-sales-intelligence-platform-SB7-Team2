const jwt = require("jsonwebtoken");
const { logSecurityEvent } = require("./activityLogger");

/**
 * JWT Authentication & Verification Protection Middleware
 * Hardened with explicit algorithm verification (HS256) and security event auditing.
 */
const protect = (req, res, next) => {
  const clientIp = (req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "").split(",")[0].trim();
  const endpoint = req.originalUrl || req.url;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logSecurityEvent({
        endpoint,
        httpMethod: req.method,
        responseStatus: 401,
        clientIp,
        eventType: "AUTH_FAILURE",
        details: "Access denied. Missing or malformed authorization header."
      }).catch(err => console.error("Error logging AUTH_FAILURE:", err.message));

      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        error: "Missing authorization header"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Bearer token is empty.",
        error: "Invalid token"
      });
    }

    // Hardened Verification: Enforce algorithm restriction to HS256 to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123", {
      algorithms: ["HS256"]
    });

    req.user = decoded;

    next();
  } catch (error) {
    let errorDetail = "Invalid or expired token.";
    if (error.name === "TokenExpiredError") {
      errorDetail = "Token has expired.";
    } else if (error.name === "JsonWebTokenError") {
      errorDetail = "Malformed or invalid token signature.";
    }

    logSecurityEvent({
      endpoint,
      httpMethod: req.method,
      responseStatus: 401,
      clientIp,
      eventType: "AUTH_FAILURE",
      details: `JWT Auth Error (${error.name}): ${error.message}`
    }).catch(err => console.error("Error logging AUTH_FAILURE:", err.message));

    return res.status(401).json({
      success: false,
      message: errorDetail,
      error: "Authentication failed"
    });
  }
};

module.exports = protect;