// ==========================================
// MarketMind AI - PostgreSQL / Supabase Database Configuration
// Module: Backend & Database (Milestone Day 10)
// ==========================================

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "aws-0-ap-northeast-1.pooler.supabase.com",
  port: Number(process.env.DB_PORT || 6543),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: Number(process.env.DB_POOL_MAX || 20), // Max concurrent connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
  ssl: {
    rejectUnauthorized: false,
  },
});

// Event listener for unexpected errors on idle pool clients
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

/**
 * Verify PostgreSQL database connection on server startup
 */
const connectDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log(`✅ PostgreSQL Connected Successfully at ${res.rows[0].now}`);
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
};