const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require('./routes/authRoutes');

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