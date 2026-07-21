const jwt = require("jsonwebtoken");
const { logSecurityEvent } = require("./activityLogger");

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
        details: "Access denied. No token provided."
      }).catch(err => console.error("Error logging AUTH_FAILURE:", err.message));

      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    logSecurityEvent({
      endpoint,
      httpMethod: req.method,
      responseStatus: 401,
      clientIp,
      eventType: "AUTH_FAILURE",
      details: `Invalid or expired token: ${error.message}`
    }).catch(err => console.error("Error logging AUTH_FAILURE:", err.message));

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;