// ==========================================
// MarketMind AI - Express Rate Limiter Middleware
// Module: Security & API Gateway (Milestone 2 Day 7)
// ==========================================

const rateLimit = require("express-rate-limit");

/**
 * Strict Rate Limiter for Authentication APIs (Login & Registration)
 * Protects against brute-force password guessing and credential stuffing attacks.
 * Limit: 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
      error: "Rate limit exceeded",
      retryAfter: "15 minutes"
    });
  }
});

/**
 * Moderate Rate Limiter for Business APIs (Invoices, Payments, Products, etc.)
 * Protects server resources against denial-of-service and API scraping.
 * Limit: 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 API requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests to business APIs from this IP. Please try again later.",
      error: "Rate limit exceeded",
      retryAfter: "15 minutes"
    });
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};
