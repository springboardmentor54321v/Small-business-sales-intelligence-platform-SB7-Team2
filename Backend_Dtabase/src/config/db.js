const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "aws-0-ap-northeast-1.pooler.supabase.com",
  port: Number(process.env.DB_PORT || 6543),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log(`✅ PostgreSQL Connected Successfully via ${process.env.DB_HOST || "aws-0-ap-northeast-1.pooler.supabase.com"}`);
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
};