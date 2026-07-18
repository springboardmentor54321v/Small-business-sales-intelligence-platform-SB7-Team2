# Input Request Validation - Day 5 Documentation

## 1. Why Request Validation is Important
Request validation is the first line of defense for a secure application. Before a request payload is processed by controllers or queries the database, the system must verify its structure, types, constraints, and presence.
* **Security:** Blocks SQL injection, parameter pollution, and cross-site scripting attempts by restricting field formats.
* **Integrity:** Prevents bad database writes (e.g., negative quantities, alphanumeric IDs, or invalid ISO dates).
* **System Stability:** Rejects invalid payloads before controllers run, avoiding unhandled exceptions and server crashes.
* **API Usability:** Provides clear, descriptive validation error responses to frontend clients.

---

## 2. Joi Validation Library
**Joi** is a schema description language and data validator for JavaScript. In MarketMind AI, we use Joi schemas to declare expected properties for invoices, payments, and parameters. This enforces validation rules such as data types (numbers, dates, arrays) and boundary conditions (positive limits, string length).

---

## 3. Validation Middleware & Process
We utilize a reusable validation helper that intercepts requests before they reach the controllers:
1. **Body Validation (`validateBody(schema)`)**: Intercepts `req.body`, compiles schema errors, formats them into a clean array, and returns a `400 Bad Request`.
2. **Parameters Validation (`validateParams(schema)`)**: Intercepts route path variables (like `:id` parameters) to ensure they are positive integers.

---

## 4. Request Flow Sequence
```text
Client Request ──> Route Middleware ──> Joi Validator Middleware ──> Controller
                                                │
                                    (Validation Fails)
                                                ▼
                                    400 Bad Request (Aborted)
```

---

## 5. Validation Failure Examples & Expected JSON Responses

### A. Missing Fields
* **Schema Violation:** Triggered if mandatory fields (e.g., `customer_id`, `items`) are missing.
* **Request Payload:**
  ```json
  {
    "user_id": 1,
    "due_date": "2026-08-15"
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "customer_id", "message": "customer_id is a required field" },
      { "field": "items", "message": "items is a required field" }
    ]
  }
  ```

### B. Empty Body
* **Schema Violation:** Sending an empty JSON object.
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "customer_id", "message": "customer_id is a required field" },
      { "field": "user_id", "message": "user_id is a required field" },
      { "field": "due_date", "message": "due_date is a required field" },
      { "field": "items", "message": "items is a required field" }
    ]
  }
  ```

### C. Negative Amount
* **Schema Violation:** Sending a negative number for amount, tax, or discount.
* **Request Payload:**
  ```json
  {
    "invoice_id": 1,
    "amount_paid": -50.00
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "amount_paid", "message": "amount_paid must be a positive number greater than 0" }
    ]
  }
  ```

### D. Invalid Customer ID (Non-numeric)
* **Request Payload:**
  ```json
  {
    "customer_id": "cust-99",
    "user_id": 1,
    "due_date": "2026-08-15",
    "items": [{"product_id": 1, "quantity": 1}]
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "customer_id", "message": "customer_id must be a number" }
    ]
  }
  ```

### E. Invalid Product ID (Negative Integer)
* **Request Payload:**
  ```json
  {
    "customer_id": 1,
    "user_id": 1,
    "due_date": "2026-08-15",
    "items": [{"product_id": -2, "quantity": 1}]
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "items.0.product_id", "message": "product_id must be a positive integer" }
    ]
  }
  ```

### F. Invalid Date Format
* **Request Payload:**
  ```json
  {
    "customer_id": 1,
    "user_id": 1,
    "due_date": "15/08/2026",
    "items": [{"product_id": 1, "quantity": 1}]
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "due_date", "message": "due_date must be in ISO format (YYYY-MM-DD)" }
    ]
  }
  ```

### G. Invalid Number Format
* **Request Payload:**
  ```json
  {
    "customer_id": 1,
    "user_id": 1,
    "due_date": "2026-08-15",
    "tax": "ten_dollars",
    "items": [{"product_id": 1, "quantity": 1}]
  }
  ```
* **Expected Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "tax", "message": "tax must be a number" }
    ]
  }
  ```
