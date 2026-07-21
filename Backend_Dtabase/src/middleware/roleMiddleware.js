const { pool } = require("../config/db");
const { logSecurityEvent } = require("./activityLogger");

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * Validates authenticated user role claims against allowed roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    const clientIp = (req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "").split(",")[0].trim();
    const endpoint = req.originalUrl || req.url;

    try {
      const userRoleId = req.user?.role || req.user?.role_id;
      const userId = req.user?.id || req.user?.user_id || null;

      if (!userRoleId) {
        logSecurityEvent({
          userId,
          endpoint,
          httpMethod: req.method,
          responseStatus: 403,
          clientIp,
          eventType: "ACCESS_FORBIDDEN",
          details: "Access denied. Role claim missing in JWT token."
        }).catch(err => console.error("Error logging ACCESS_FORBIDDEN:", err.message));

        return res.status(403).json({
          success: false,
          message: "Access Denied: Role permissions required.",
          error: "Missing role claim"
        });
      }

      // Direct ID match check
      if (allowedRoles.includes(userRoleId) || allowedRoles.includes(String(userRoleId)) || allowedRoles.includes(Number(userRoleId))) {
        return next();
      }

      // Database role lookup for string role names
      const result = await pool.query(
        "SELECT role_name, description FROM roles WHERE role_id = $1",
        [userRoleId]
      );

      if (result.rows.length > 0) {
        const roleName = result.rows[0].role_name;
        const roleDesc = result.rows[0].description;

        const isMatch = allowedRoles.some(allowed => {
          if (typeof allowed !== "string") return false;
          const normalized = allowed.trim().toLowerCase();
          return (
            (roleName && roleName.trim().toLowerCase() === normalized) ||
            (roleDesc && roleDesc.trim().toLowerCase() === normalized)
          );
        });

        if (isMatch) {
          return next();
        }
      }

      logSecurityEvent({
        userId,
        endpoint,
        httpMethod: req.method,
        responseStatus: 403,
        clientIp,
        eventType: "ACCESS_FORBIDDEN",
        details: `Access denied for role_id ${userRoleId}. Required: ${allowedRoles.join(", ")}`
      }).catch(err => console.error("Error logging ACCESS_FORBIDDEN:", err.message));

      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to perform this action.",
        error: "Insufficient permissions"
      });
    } catch (error) {
      console.error("Error in authorizeRoles middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error during authorization check",
        error: error.message
      });
    }
  };
};

module.exports = authorizeRoles;