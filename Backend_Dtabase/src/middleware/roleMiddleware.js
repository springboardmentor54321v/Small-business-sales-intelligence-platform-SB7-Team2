const { pool } = require("../config/db");

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            // role comes from JWT middleware (usually role_id)
            const userRoleId = req.user?.role;

            if (!userRoleId) {
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