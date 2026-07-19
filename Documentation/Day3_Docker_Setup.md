# Day 3 – Docker Setup

## Objective
Containerize the backend application using Docker.

## Tasks Completed
- Installed Docker Desktop
- Verified Docker installation
- Created Dockerfile
- Built Docker image
- Ran backend container
- Connected backend container to PostgreSQL
- Verified API using curl

## Commands Used

docker build -t marketmind-backend ./backend

docker run -d --name marketmind-backend-container -p 5001:5001 marketmind-backend

docker ps

curl http://localhost:5001/api/sales

## Result
Backend API is successfully running in a Docker container and responding on port 5001.