---
title: Docker
tags: [docker, containers, containerization, devops, deployment, infrastructure]
---

# Docker

Docker is a platform for building, shipping, and running applications in containers. Created in 2013, Docker revolutionized software deployment by packaging applications with their dependencies into portable containers that run consistently anywhere. For JavaScript/TypeScript developers, Docker ensures "it works on my machine" becomes "it works everywhere."

## What is Docker?

**Docker** packages apps into **containers**:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build image
docker build -t myapp .

# Run container
docker run -p 3000:3000 myapp
```

**Key Concepts:**
- **Image**: Blueprint for container (like a class)
- **Container**: Running instance of image (like an object)
- **Dockerfile**: Instructions to build image
- **Registry**: Storage for images (Docker Hub, GitHub Container Registry)
- **Volume**: Persistent storage for containers
- **Network**: Communication between containers

## Why Docker?

### 1. Consistent Environments

```
Developer's Machine:
- Node.js 18
- macOS
- npm 9

Production Server:
- Node.js 20
- Linux
- npm 10

Result: "Works on my machine" ❌
```

**With Docker:**

```
Developer + Production:
- Same Docker image
- Same Node version
- Same dependencies
- Same OS

Result: Works everywhere ✓
```

### 2. Isolation

Each container runs in isolation:

```
Host Machine
├── Container 1 (Node.js 18)
├── Container 2 (Node.js 20)
├── Container 3 (Python 3.11)
└── Container 4 (Go 1.21)
```

No conflicts between apps.

### 3. Portability

```
Build once → Run anywhere

Developer laptop ✓
CI/CD server ✓
Production server ✓
Cloud (AWS, GCP, Azure) ✓
Kubernetes ✓
```

### 4. Easy Rollback

```bash
# Deploy v2
docker run myapp:v2

# Issue found? Rollback to v1
docker stop myapp-v2
docker run myapp:v1
```

Instant rollbacks.

## Dockerfile Basics

### Simple Node.js App

```dockerfile
# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
```

### Multi-Stage Build (Smaller Images)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

**Result:** Smaller final image (no build tools).

### TypeScript App

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Next.js App

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Docker Commands

### Build and Run

```bash
# Build image
docker build -t myapp .

# Build with tag
docker build -t myapp:v1.0.0 .

# Run container
docker run -p 3000:3000 myapp

# Run in background (detached)
docker run -d -p 3000:3000 --name myapp-container myapp

# Run with environment variables
docker run -p 3000:3000 -e DATABASE_URL=postgresql://... myapp

# Run with volume (persistent data)
docker run -p 3000:3000 -v $(pwd)/data:/app/data myapp
```

### Managing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop myapp-container

# Start stopped container
docker start myapp-container

# Remove container
docker rm myapp-container

# View logs
docker logs myapp-container

# Follow logs (tail -f)
docker logs -f myapp-container

# Execute command in running container
docker exec -it myapp-container sh

# Inspect container
docker inspect myapp-container
```

### Managing Images

```bash
# List images
docker images

# Remove image
docker rmi myapp

# Pull image from registry
docker pull node:20-alpine

# Push image to registry
docker push myusername/myapp:v1.0.0

# Tag image
docker tag myapp myusername/myapp:v1.0.0

# Remove unused images
docker image prune

# Remove all unused images, containers, volumes
docker system prune -a
```

## Docker Compose

Run multi-container applications:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build

# Stop and remove volumes
docker-compose down -v
```

## Environment Variables

### .env File

```env
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=secret123
NODE_ENV=production
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    env_file:
      - .env
    ports:
      - "3000:3000"
```

### In Dockerfile

```dockerfile
# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use build arguments
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
```

```bash
# Pass build args
docker build --build-arg NODE_VERSION=18 -t myapp .
```

## Volumes (Persistent Data)

### Named Volumes

```bash
# Create volume
docker volume create myapp-data

# Use volume
docker run -v myapp-data:/app/data myapp

# List volumes
docker volume ls

# Remove volume
docker volume rm myapp-data
```

### Bind Mounts (Local Development)

```bash
# Mount local directory
docker run -v $(pwd):/app myapp

# Read-only mount
docker run -v $(pwd):/app:ro myapp
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    volumes:
      - .:/app  # Bind mount current directory
      - /app/node_modules  # Don't override node_modules
```

## Networking

### Default Bridge Network

```bash
# Containers can communicate by name in docker-compose
# app can reach db at: postgresql://db:5432
```

### Custom Networks

```bash
# Create network
docker network create myapp-network

# Run containers on network
docker run --network myapp-network --name app myapp
docker run --network myapp-network --name db postgres

# Inspect network
docker network inspect myapp-network
```

## Docker for Development

### Hot Reload with Volumes

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

```dockerfile
# Dockerfile with dev stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]
```

```bash
# Run dev environment
docker-compose -f docker-compose.dev.yml up
```

## Best Practices

### 1. Use .dockerignore

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
dist
coverage
.next
```

### 2. Multi-Stage Builds

```dockerfile
# ✓ Good - multi-stage (smaller image)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/server.js"]

# ❌ Bad - single stage (larger image with dev dependencies)
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/server.js"]
```

### 3. Layer Caching

```dockerfile
# ✓ Good - copy package.json first (caches dependencies)
COPY package*.json ./
RUN npm ci
COPY . .

# ❌ Bad - copy everything first (reinstalls deps on any file change)
COPY . .
RUN npm ci
```

### 4. Use Alpine Images

```dockerfile
# ✓ Good - alpine (smaller)
FROM node:20-alpine  # ~40 MB

# ❌ Bad - full image (larger)
FROM node:20  # ~300 MB
```

### 5. Run as Non-Root User

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

CMD ["node", "server.js"]
```

### 6. Health Checks

```dockerfile
# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on('error', () => process.exit(1));
request.end();
```

## Security Best Practices

### 1. Scan Images for Vulnerabilities

```bash
# Scan image
docker scan myapp

# Or use Trivy
trivy image myapp
```

### 2. Don't Store Secrets in Images

```bash
# ✓ Good - pass as environment variable
docker run -e API_KEY=$API_KEY myapp

# ❌ Bad - hardcoded in Dockerfile
ENV API_KEY=secret123
```

### 3. Use Official Images

```dockerfile
# ✓ Good - official image
FROM node:20-alpine

# ❌ Bad - unknown source
FROM randomuser/node
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t myapp .

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push to Docker Hub
        run: |
          docker tag myapp ${{ secrets.DOCKER_USERNAME }}/myapp:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/myapp:latest
```

## Docker vs. Alternatives

| Feature | Docker | VM | Bare Metal |
|---------|--------|----|-----------|
| **Startup Time** | Seconds | Minutes | N/A |
| **Resource Usage** | Low | High | Lowest |
| **Isolation** | Process-level | OS-level | None |
| **Portability** | High | Medium | Low |
| **Size** | MB | GB | N/A |
| **Best For** | Apps | Multiple OSes | Maximum performance |

## Key Takeaways

- **Containers** package app + dependencies
- **Consistent environments** (dev = prod)
- **Portable** (run anywhere)
- **Use multi-stage builds** for smaller images
- **Use .dockerignore** to exclude files
- **Docker Compose** for multi-container apps
- **Layer caching** speeds up builds
- **Alpine images** are smaller
- **Best for** consistent deployments, microservices

## Related Topics

- [Kubernetes](/content/deployment/kubernetes) - Container orchestration
- [Cloud Run](/content/deployment/cloud-run) - Serverless containers
- [ECS](/content/deployment/ecs) - AWS container service
- [Deployment Overview](/content/deployment/deployment-overview) - Compare deployment strategies
- [Node.js](/content/runtimes/nodejs) - Popular runtime for Docker

Docker is the foundation of modern application deployment. It ensures your app runs consistently everywhere, from development to production. Master Docker to unlock containerization, microservices, and cloud-native deployment strategies.
