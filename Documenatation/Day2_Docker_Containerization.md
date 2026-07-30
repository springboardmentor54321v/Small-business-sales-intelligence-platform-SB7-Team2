# Day 2 – Docker Containerization Report

## Objective

Containerize the Frontend, Backend, AI Service, and Database using Docker and Docker Compose.

---

## Work Completed

- Created Dockerfile for the Frontend application.
- Created Dockerfile for the Backend application.
- Created Dockerfile for the AIML (FastAPI) service.
- Configured the `docker-compose.yml` file to manage all services.
- Successfully built Docker images using Docker Compose.
- Successfully started all containers.

---

## Docker Images Created

- devops_integration-frontend
- devops_integration-backend
- devops_integration-ai-service
- postgres:16

---

## Containers Running

| Service | Port | Status |
|---------|------|--------|
| Frontend | 3000 | Running |
| Backend | 5001 | Running |
| AI Service | 8000 | Running |
| PostgreSQL | 5432 | Running |

---

## Verification Performed

- Verified Docker images using:
  ```bash
  docker images
  ```

- Verified running containers using:
  ```bash
  docker ps
  ```

- Verified Backend container using Docker Desktop:
  - Logs
  - Exec
  - Files

- Verified Backend container environment:
  ```bash
  pwd
  ls
  node -v
  npm -v
  ```

Output:

```text
/app

Dockerfile
docs
node_modules
package.json
package-lock.json
readme.md
src
uploads

Node.js v20.20.2
npm 10.8.2
```

---

## Result

- Docker images were built successfully.
- All containers started successfully.
- Backend connected to PostgreSQL.
- Frontend, Backend, AI Service, and Database are running correctly.

---

## Conclusion

The project has been successfully containerized using Docker and Docker Compose. All services were verified and are running correctly.

**Status:** Day 2 Completed Successfully