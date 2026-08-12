const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const healthRoutes = require("./routes/healthRoutes");

// Security & Gateway Middlewares
const { activityLogger } = require("./middleware/activityLogger");
const sanitizerMiddleware = require("./middleware/sanitizerMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();

// Normalize suspicious URL characters before routing to avoid 404s from malformed requests
app.use((req, res, next) => {
  const normalizeUrl = (value) => {
    if (typeof value !== "string") return value;
    let normalized = value;

    try {
      normalized = decodeURIComponent(value);
    } catch {
      normalized = value;
    }

    normalized = normalized.replace(/[\r\n\u0000]/g, "");
    return normalized;
  };

  const sanitizedOriginalUrl = normalizeUrl(req.originalUrl);
  const sanitizedUrl = normalizeUrl(req.url);

  if (sanitizedOriginalUrl !== req.originalUrl) {
    req.originalUrl = sanitizedOriginalUrl;
  }

  if (sanitizedUrl !== req.url) {
    req.url = sanitizedUrl;
  }

  next();
});

// 1. Helmet HTTP Security Headers
app.use(helmet());

// 2. Strict CORS Origin Whitelist Filter
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(o => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  maxAge: 86400 // Preflight response cache (24 hours)
};
app.use(cors(corsOptions));

// Morgan dev logger
app.use(morgan("dev"));

// 3. Body Parser with Strict 10KB Size Limiter
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 4. Activity & Security Event Audit Logger
app.use(activityLogger);

// 5. Global Input Sanitizer (XSS tag stripping, SQLi pattern blocking, NoSQL operator removal)
app.use(sanitizerMiddleware);

// 6. Express Rate Limiter
app.use("/api", apiLimiter);

// 7. Route Mounts
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/health", healthRoutes);

// Auth routes (Note: authLimiter is attached inside authRoutes)
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MarketMind AI Backend API is running...",
  });
});

// 8. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
