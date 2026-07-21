// ==========================================
// MarketMind AI - Activity & Security Logging Middleware
// Module: Security & API Gateway (Milestone 2 Day 6)
// ==========================================

const { pool } = require("../config/db");

// Flag to ensure table check runs once
let tableChecked = false;

/**
 * Ensures activity_logs table exists in PostgreSQL
 */
const ensureLogTable = async () => {
  if (tableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(255) NOT NULL,
        http_method VARCHAR(10) NOT NULL,
        response_status INTEGER NOT NULL,
        execution_time_ms NUMERIC(10,2) DEFAULT 0,
        client_ip VARCHAR(50),
        event_type VARCHAR(50) DEFAULT 'API_REQUEST',
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableChecked = true;
  } catch (error) {
    console.error("⚠️ Error ensuring activity_logs table:", error.message);
  }
};

/**
 * Log a specific Security Event directly into activity_logs table
 * @param {Object} param0 Log properties
 */
const logSecurityEvent = async ({
  userId = null,
  endpoint,
  httpMethod,
  responseStatus,
  executionTimeMs = 0,
  clientIp,
  eventType = "SECURITY_EVENT",
  details = null
}) => {
  try {
    await ensureLogTable();

    // Sanitize details to ensure passwords or raw authorization tokens are never logged
    let sanitizedDetails = details;
    if (typeof sanitizedDetails === "object" && sanitizedDetails !== null) {
      const cleanObj = { ...sanitizedDetails };
      delete cleanObj.password;
      delete cleanObj.token;
      delete cleanObj.authorization;
      sanitizedDetails = JSON.stringify(cleanObj);
    }

    await pool.query(
      `INSERT INTO activity_logs (user_id, endpoint, http_method, response_status, execution_time_ms, client_ip, event_type, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        endpoint,
        httpMethod,
        responseStatus,
        executionTimeMs,
        clientIp || "127.0.0.1",
        eventType,
        sanitizedDetails
      ]
    );
  } catch (error) {
    console.error("❌ Failed to insert activity log:", error.message);
  }
};

/**
 * Global Activity Logging Middleware for Express
 */
const activityLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", async () => {
    try {
      const executionTimeMs = Date.now() - startTime;
      const endpoint = req.originalUrl || req.url;
      const httpMethod = req.method;
      const responseStatus = res.statusCode;
      const clientIp = (req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "").split(",")[0].trim();
      const userId = req.user?.id || req.user?.user_id || null;

      // Skip static options/preflight checks or simple health checks if needed
      let eventType = "API_REQUEST";
      if (responseStatus >= 500) {
        eventType = "SERVER_ERROR";
      } else if (responseStatus >= 400) {
        eventType = "CLIENT_ERROR";
      }

      await logSecurityEvent({
        userId,
        endpoint,
        httpMethod,
        responseStatus,
        executionTimeMs,
        clientIp,
        eventType,
        details: null
      });
    } catch (err) {
      console.error("❌ Activity logger error on finish:", err.message);
    }
  });

  next();
};

module.exports = {
  activityLogger,
  logSecurityEvent
};
