const { pool } = require("../config/db");
const { logSecurityEvent } = require("./activityLogger");

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        const clientIp = (req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "").split(",")[0].trim();
        const endpoint = req.originalUrl || req.url;

        try {
            // role comes from JWT middleware (usually role_id)
            const userRoleId = req.user?.role;
            const userId = req.user?.id || req.user?.user_id || null;

            if (!userRoleId) {
                logSecurityEvent({
                    userId,
                    endpoint,
                    httpMethod: req.method,
                    responseStatus: 403,
                    clientIp,
                    eventType: "ACCESS_FORBIDDEN",
                    details: "Access denied. User role not present in token."
                }).catch(err => console.error("Error logging ACCESS_FORBIDDEN:", err.message));

                return res.status(403).json({
                    success: false,
                    message: "Access Denied"
                });
            }

            // Direct match check (for integer IDs, e.g. authorizeRoles(1))
            if (allowedRoles.includes(userRoleId) || allowedRoles.includes(String(userRoleId))) {
                return next();
            }

            // Look up role name and description in database
            const result = await pool.query(
                "SELECT role_name, description FROM roles WHERE role_id = $1",
                [userRoleId]
            );

            if (result.rows.length > 0) {
                const roleName = result.rows[0].role_name;
                const roleDesc = result.rows[0].description;

                // Case-insensitive match against role_name or description
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
                details: `Access denied for role_id: ${userRoleId}. Required: ${allowedRoles.join(", ")}`
            }).catch(err => console.error("Error logging ACCESS_FORBIDDEN:", err.message));

            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        } catch (error) {
            console.error("Error in authorizeRoles middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };
};

module.exports = authorizeRoles;