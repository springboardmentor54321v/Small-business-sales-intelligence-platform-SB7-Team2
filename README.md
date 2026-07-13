# Small-business-sales-intelligence-platform-SB7-Team1-
MarketMind AI is an AI-powered sales intelligence platform designed to help small businesses, retail stores, supermarkets, and startups make better business decisions using data and Artificial Intelligence
# MarketMind AI Backend

Backend service for the **MarketMind AI – Small Business Sales Intelligence Platform**.

## Overview

This backend provides REST APIs for managing users, authentication, products, inventory, customers, and sales. It uses PostgreSQL as the database and JWT for secure authentication.

---

# Technology Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- JWT (jsonwebtoken)
- bcrypt
- dotenv
- cors
- helmet
- morgan
- express-rate-limit
- multer

---

# Completed Features

## Backend Setup

- Express.js project initialization
- Environment configuration
- PostgreSQL connection
- Modular folder structure

---

## Database

Implemented PostgreSQL database with the following tables:

- Roles
- Users
- Categories
- Products
- Inventory
- Customers
- Sales Transactions
- Sales Items

Features:

- Primary Keys
- Foreign Keys
- Constraints
- Relational Database Design

---

## Authentication Module

### Register API

- User Registration
- Email validation
- Password hashing using bcrypt
- JWT token generation

### Login API

- User authentication
- Password verification
- JWT token generation

### Protected Routes

- JWT verification middleware
- Profile API
- Secure route access

---

# API Endpoints

## Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

---

# Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected APIs
- Environment Variables

---

# Folder Structure

backend/
├── src/
│
├── config/
│ └── db.js
│
├── controllers/
│ └── authController.js
│
├── middleware/
│ └── authMiddleware.js
│
├── routes/
│ └── authRoutes.js
│
├── services/
│
├── models/
│
├── utils/
│ └── generateToken.js
│
├── app.js
├── server.js
│
├── .env
├── package.json
└── README.md

---

# Current Progress

Completed

- Backend Setup
- PostgreSQL Integration
- Database Schema
- Authentication Module
- JWT Security
- Protected Profile API

Upcoming Modules

- Role-Based Access Control (RBAC)
- Product Management APIs
- Inventory APIs
- Customer APIs
- Sales APIs
- AI Integration
- Dashboard APIs
- Deployment

---

# Project Status

Backend Progress: **Approximately 50% Complete**

The backend foundation, database implementation, and authentication system have been completed. The next development phase focuses on business modules and AI integration.
