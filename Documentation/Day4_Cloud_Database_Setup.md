# Day 4 – Cloud Database Setup (Supabase)

## Objective
Set up a cloud PostgreSQL database using Supabase and connect the backend application to the cloud database.

---

## Tasks Completed

### 1. Created a Supabase Project
- Created a new Supabase project named **marketmind-db**.
- Selected the appropriate region during project creation.
- Waited for the database to be provisioned successfully.

### 2. Imported Database Schema
- Opened the SQL Editor in Supabase.
- Imported and executed the project's `schema.sql` file.
- Verified that all required tables were created successfully.

### 3. Configured Backend Database Connection
Updated the backend `.env` file with the Supabase database details.

```env
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.nypfiktxilwkzfftpuyc
DB_PASSWORD=********
PORT=5001
JWT_SECRET=marketmind_secret_key
```

> Note: The actual database password is not included in this documentation for security reasons.

### 4. Rebuilt Docker Image

Executed the following command:

```bash
docker build -t marketmind-backend ./backend
```

The Docker image was built successfully.

### 5. Started Docker Container

Executed:

```bash
docker run -d --name marketmind-backend-container -p 5001:5001 marketmind-backend
```

Verified the container status:

```bash
docker ps
```

The container was running successfully.

### 6. Verified Backend API

Tested the backend API using:

```bash
curl http://localhost:5001/api/sales
```

Response received:

```json
{
  "success": true,
  "sales": []
}
```

This confirmed that:
- Backend server is running.
- Docker container is functioning correctly.
- Backend is connected successfully to the cloud database.
- API endpoints are accessible.

---

## Result

Successfully configured a cloud PostgreSQL database using Supabase.

The backend application was connected to the cloud database, deployed inside a Docker container, and verified through API testing.

---

## Outcome

- Supabase cloud database configured successfully.
- Backend connected to cloud PostgreSQL.
- Docker image built successfully.
- Docker container executed successfully.
- API tested successfully.
- Day 4 task completed successfully.