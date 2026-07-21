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
const { activityLogger } = require("./middleware/activityLogger");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Security Middleware
app.use(helmet());

// CORS
app.use(cors());

// Logger
app.use(morgan("dev"));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity & Security Event Logger
app.use(activityLogger);

// Apply Moderate Rate Limiter to Business APIs
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

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MarketMind AI Backend API is running...",
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

module.exports = app;