const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const { activityLogger } = require("./middleware/activityLogger");
const { apiLimiter } = require("./middleware/rateLimiter");
const sanitizerMiddleware = require("./middleware/sanitizerMiddleware");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();

// 1. Secure HTTP Headers using Helmet (OWASP Hardened Configuration)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year HSTS policy
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" }, // X-Frame-Options: DENY (Clickjacking Protection)
    noSniff: true, // X-Content-Type-Options: nosniff
    xssFilter: true, // X-XSS-Protection: 1; mode=block
    hidePoweredBy: true, // Hide X-Powered-By header
  })
);

// 2. Strict CORS Configuration Review
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy error: Origin not allowed by gateway whitelist"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  maxAge: 86400, // Cache preflight response for 24 hours
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable preflight across-the-board

// 3. Logger
app.use(morgan("dev"));

// 4. Body Parser with Strict Payload Size Limits (DoS Protection)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Global Activity & Security Event Audit Logger
app.use(activityLogger);

// 6. Global Input Sanitization (XSS, SQLi & NoSQLi Protection)
app.use(sanitizerMiddleware);

// 7. Route Handlers with Moderate Rate Limiter
app.use("/api/auth", authRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/products", apiLimiter, productRoutes);
app.use("/api/inventory", apiLimiter, inventoryRoutes);
app.use("/api/customers", apiLimiter, customerRoutes);
app.use("/api/sales", apiLimiter, salesRoutes);
app.use("/api/dashboard", apiLimiter, dashboardRoutes);
app.use("/api/reports", apiLimiter, reportRoutes);
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/invoices", apiLimiter, invoiceRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);

// Health Check Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MarketMind AI Backend API Gateway is secure and running...",
  });
});

// 8. 404 Unmatched Route Handler & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;