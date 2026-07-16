# MarketMind AI - Role Permission Matrix

## Overview

This document defines the access permissions for each user role in the MarketMind AI platform. It ensures that only authorized users can access specific modules and APIs.

---

## User Roles

1. Business Owner
2. Store Manager
3. Sales Executive
4. System Administrator

---

## Permission Matrix

| Module / Feature | Business Owner | Store Manager | Sales Executive | System Administrator |
|------------------|----------------|---------------|-----------------|----------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ❌ | ✅ |
| Inventory | ✅ | ✅ | ❌ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Sales | ✅ | ✅ | ✅ | ✅ |
| Invoice | ✅ | ❌ | ✅ | ✅ |
| Payments | ✅ | ❌ | ✅ | ✅ |
| Reports | ✅ | ✅ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

---

## Purpose

The permission matrix helps secure the application by restricting access based on user roles. It ensures users can perform only the operations assigned to their role.