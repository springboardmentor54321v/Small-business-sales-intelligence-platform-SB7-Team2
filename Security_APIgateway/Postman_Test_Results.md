# Postman Test Results Report - Security Module

This testing report captures the status of security, authorization, and validation test cases for MarketMind AI's API endpoints. All tests were executed and passed.

---

## Security Integration Test Results Matrix

| Test ID | API Endpoint | Method | Test Scenario Details | JWT / Auth Header | Expected Status | Actual Status | Result Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :---: |
| **TC-SEC-01** | `/api/reports/customer-groups` | `GET` | System Admin fetching segmentation reports | Valid Admin JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-02** | `/api/reports/customer-groups` | `GET` | Business Owner fetching segmentation reports | Valid Owner JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-03** | `/api/reports/customer-groups` | `GET` | Store Manager fetching segmentation reports | Valid Manager JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-04** | `/api/reports/customer-groups` | `GET` | Sales Executive blocked from segmentations | Valid Executive JWT | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-SEC-05** | `/api/reports/churn-risk` | `GET` | System Admin fetching churn projection logs | Valid Admin JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-06** | `/api/reports/churn-risk` | `GET` | Business Owner fetching churn risk list | Valid Owner JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-07** | `/api/reports/churn-risk` | `GET` | Store Manager blocked from churn reports | Valid Manager JWT | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-SEC-08** | `/api/reports/churn-risk` | `GET` | Sales Executive blocked from churn reports | Valid Executive JWT | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-SEC-09** | `/api/reports/recommendations` | `GET` | Sales Executive accessing product recommendations | Valid Executive JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-10** | `/api/reports/anomaly-alerts` | `GET` | Store Manager reading inventory anomaly logs | Valid Manager JWT | `200 OK` | `200 OK` | **PASS** |
| **TC-SEC-11** | `/api/reports/anomaly-alerts` | `GET` | Sales Executive blocked from anomalies | Valid Executive JWT | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-SEC-12** | `/api/invoices` | `POST` | Reject invoice containing negative tax | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-13** | `/api/invoices` | `POST` | Reject invoice containing empty items list | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-14** | `/api/invoices` | `POST` | Reject invoice containing non-numeric customer_id | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-15** | `/api/invoices` | `POST` | Reject invoice containing invalid date string | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-16** | `/api/invoices/:id` | `GET` | Reject alphanumeric route path ID parameters (`/abc`) | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-17** | `/api/payments` | `POST` | Reject payment containing negative amount | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-18** | `/api/payments` | `POST` | Reject payment with missing invoice_id | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-SEC-19** | `/api/reports/recommendations` | `GET` | Block query containing invalid signature token | Invalid JWT Signature | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-SEC-20** | `/api/reports/recommendations` | `GET` | Block query missing Authorization header | Missing JWT Header | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-SEC-21** | `/api/invoices` | `POST` | Block invoice creation body missing all fields | Valid Admin JWT | `400 Bad Request` | `400 Bad Request` | **PASS** |

---

## Summary of Executed Test Scenarios

* **Total Security Test Cases:** 21
* **Test Runs Executed:** 21
* **Successful Outcomes:** 21
* **Failed Outcomes:** 0
* **Success Rate:** 100%

---

## Expected Success and Error Response Formats

### 1. Success Response (Access Granted & Valid Payload)
```json
{
  "success": true,
  "message": "AI Recommendations fetched successfully",
  "recommendations": [
    { "product_a_name": "Laptop", "product_b_name": "Wireless Mouse", "frequency": 12 }
  ]
}
```

### 2. Error Response: Unauthorized Access (Missing JWT)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 3. Error Response: Forbidden Access (Role Blocked)
```json
{
  "success": false,
  "message": "Access Denied"
}
```

### 4. Error Response: Bad Request (Joi Validation Failure)
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "tax",
      "message": "tax cannot be negative"
    }
  ]
}
```
