# MarketMind AI - JWT Authentication

## Overview

The backend uses JSON Web Token (JWT) authentication to secure all protected APIs.

Only authenticated users with a valid JWT token can access protected resources.

---

## Authentication Flow

1. User enters email and password.
2. Backend validates user credentials.
3. Backend generates a JWT token.
4. JWT token is returned to the client.
5. Client sends the token in every protected request.
6. Backend verifies the token before processing the request.

---

## Authorization Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Protected APIs

The following modules require JWT authentication:

- Dashboard API
- Product API
- Inventory API
- Customer API
- Sales API
- Reports API
- Invoice API
- Payment API
- CSV Upload API

---

## Security Middleware

The project uses the `protect` middleware to verify JWT tokens before allowing access to protected routes.

Example:

```javascript
router.use(protect);
```

---

## Benefits

- Secure user authentication
- Protected API endpoints
- Prevents unauthorized access
- Supports role-based access control in future milestones