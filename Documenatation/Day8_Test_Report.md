# Day 8 - Load Testing Report

## Date
22 July 2026

## Environment
- Backend: Node.js + Express
- Database: PostgreSQL 16
- Docker Compose
- ApacheBench (ab)

## Backend URL

http://localhost:5001/

## Load Test Command

```bash
ab -n 100 -c 10 http://localhost:5001/
```

## Test Configuration

- Total Requests: 100
- Concurrent Users: 10

## Results

| Metric | Value |
|---------|-------|
| Complete Requests | 100 |
| Failed Requests | 0 |
| Requests per Second | 560.94 req/sec |
| Average Response Time | 17.827 ms |
| Maximum Response Time | 24 ms |
| Transfer Rate | 518.76 KB/sec |

## Observation

- Backend handled all requests successfully.
- No request failures occurred.
- Response time remained low.
- Dockerized backend and PostgreSQL worked correctly during testing.

## Conclusion

The backend is stable under basic concurrent load and is ready for deployment testing.