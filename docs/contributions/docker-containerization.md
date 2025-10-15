# Feature: Docker Containerization

## Problem

Deploying the Astro application requires:
- Consistent environment across development and production
- Proper build process with database initialization
- Support for both Turso (production) and local.db (development/CI)
- Security best practices (non-root user, health checks)
- Easy local testing without installing dependencies

Without Docker, developers must:
- Install Node.js, pnpm, and all dependencies locally
- Manually manage environment variables
- Ensure consistent builds across different machines
- Configure deployment environments manually

## Solution

Created a complete Docker setup with:
1. **Dockerfile** (default) - Production build that indexes content to Turso and builds the app
2. **Dockerfile.local** - Local development build using embedded SQLite
3. **.dockerignore** to exclude unnecessary files
4. **docker-compose.yml** for easy local development and testing
5. Security best practices (non-root user, health checks)

## Changes

### File: `Dockerfile` (Production)

Multi-stage build for production using Turso:
- Build stage: Accepts Turso credentials as build args, indexes content to Turso, then builds app
- Runtime stage: Only production dependencies and built artifacts, uses Turso via runtime env vars
- **Build args**: `TURSO_DB_URL`, `TURSO_AUTH_TOKEN` required
- Automatically indexes latest content during every build

```dockerfile
# Production Dockerfile - Uses Turso database
# Automatically indexes content to Turso during build

# Build stage
FROM node:20-slim AS builder

# Build arguments for Turso credentials (required for indexing and pre-rendering)
ARG TURSO_DB_URL
ARG TURSO_AUTH_TOKEN
ARG EMBEDDING_PROVIDER=local

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source files
COPY . .

# Set environment variables for build
ENV TURSO_DB_URL=$TURSO_DB_URL
ENV TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN
ENV EMBEDDING_PROVIDER=$EMBEDDING_PROVIDER

# Index content to Turso database (env vars already set via ENV directives)
RUN pnpm exec tsx scripts/init-db.ts && pnpm exec tsx scripts/index-content.ts

# Build application (queries Turso database for static pre-rendering)
RUN pnpm build

# Production stage
FROM node:20-slim AS runtime

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/local.db ./local.db

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs astro

# Change ownership
RUN chown -R astro:nodejs /app

# Switch to non-root user
USER astro

# Expose port
EXPOSE 4321

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4321/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
```

### File: `.dockerignore`

Excludes unnecessary files from Docker context:

```
# Dependencies
node_modules/
pnpm-lock.yaml

# Build output
dist/
.astro/

# Local development
.env
.env.local
# local.db is created during build

# Version control
.git/
.gitignore

# Documentation
docs/
README.md
CLAUDE.md

# Scripts (needed for build-time database initialization)
# scripts/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Test files
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx
coverage/

# CI/CD
.github/
```

### File: `Dockerfile.local` (Local Development)

Self-contained build for local development and testing:
- Build stage: Creates local.db with indexed content
- Runtime stage: Uses embedded local.db, no external dependencies
- No build args required, completely self-contained
- Perfect for local testing without Turso

```dockerfile
# Dockerfile for local development and testing with embedded SQLite (local.db)

# Build stage
FROM node:20-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source files
COPY . .

# Initialize database and index content for build
RUN pnpm db:init:local && pnpm index:local

# Build application
RUN pnpm build

# Production stage
FROM node:20-slim AS runtime

# [... rest of runtime stage same as production ...]

# Copy built application and local.db
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/local.db ./local.db

# [... rest of runtime configuration ...]
```

### File: `docker-compose.yml`

Local development setup using Dockerfile.local:

```yaml
services:
  astro-vault:
    build:
      context: .
      dockerfile: Dockerfile.local
    ports:
      - "4321:4321"
    environment:
      - HOST=0.0.0.0
      - PORT=4321
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:4321/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

## Usage

### Build Docker Image

**For production (uses Turso, auto-indexes content):**
```bash
docker build \
  --build-arg TURSO_DB_URL=libsql://your-db.turso.io \
  --build-arg TURSO_AUTH_TOKEN=your-token \
  -t astro-vault .
```

This build will:
1. Install dependencies
2. Index all markdown content to your Turso database
3. Build the application using Turso data for static pre-rendering

**For local development (uses local.db):**
```bash
docker build -f Dockerfile.local -t astro-vault:local .
```

### Run Container

**Production (Turso):**
```bash
# Runtime environment variables (can be different from build args)
docker run -p 4321:4321 \
  -e TURSO_DB_URL=libsql://your-db.turso.io \
  -e TURSO_AUTH_TOKEN=your-token \
  astro-vault
```

**Local development (local.db):**
```bash
docker run -p 4321:4321 astro-vault:local
```

### Docker Compose (Local Development)

The `docker-compose.yml` uses `Dockerfile.local` for local testing:

```bash
# Build and start
docker compose up

# Detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

## Key Features

### 1. Multi-Stage Build

- **Build stage**: Full development environment with all dependencies
- **Runtime stage**: Minimal production image (only runtime dependencies)
- Results in smaller, more secure production images

### 2. Database Flexibility

The application automatically chooses database based on environment variables:

**With Turso credentials:**
```bash
TURSO_DB_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```
→ Uses remote Turso database

**Without Turso credentials:**
```bash
# No TURSO_* variables set
```
→ Uses local.db (embedded SQLite)

### 3. Build-Time Content Indexing

The Dockerfile runs `pnpm db:init:local && pnpm index:local` during build:
- Creates local.db with indexed content
- Enables static pre-rendering during build
- Provides fallback database if Turso credentials aren't available
- Copies local.db to production image

### 4. Security Best Practices

- **Non-root user**: Application runs as user `astro` (UID 1001)
- **Minimal base image**: Uses `node:20-slim` (Debian-based, not Alpine for better native module support)
- **Health checks**: Automatic container health monitoring
- **No secrets in image**: Environment variables loaded at runtime

### 5. Development Workflow

**Local development (without Docker):**
```bash
pnpm dev
```

**Test with Docker (simulates production):**
```bash
docker-compose up
```

**Both use same codebase and configuration!**

## Image Size Optimization

### Techniques Used:

1. **Multi-stage build**: Separates build and runtime environments
2. **.dockerignore**: Excludes unnecessary files from context
3. **Production dependencies only**: Runtime stage uses `pnpm install --prod`
4. **Slim base image**: Uses `node:20-slim` instead of full Node image

### Approximate Image Sizes:

- **Builder stage**: ~1.5 GB (includes dev dependencies, build tools)
- **Final image**: ~450 MB (production dependencies only)
- **Compressed (pulled)**: ~150 MB

## Why Debian Slim Instead of Alpine?

**Alpine issues:**
- Native modules (like `onnxruntime-node` for embeddings) fail with `ld-linux-aarch64.so.1` errors
- Requires additional packages (`libc6-compat`, `libstdc++`) for Node native modules
- Different `adduser` syntax

**Debian Slim benefits:**
- Better compatibility with Node.js native modules
- More predictable behavior
- Slightly larger (+100 MB) but more reliable

## Deployment Examples

### Cloud Run (Google Cloud)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/astro-vault

# Deploy to Cloud Run
gcloud run deploy astro-vault \
  --image gcr.io/PROJECT_ID/astro-vault \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars TURSO_DB_URL=libsql://your-db.turso.io \
  --set-env-vars TURSO_AUTH_TOKEN=your-token
```

### AWS ECS / Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t astro-vault .
docker tag astro-vault:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/astro-vault:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/astro-vault:latest

# Create task definition and service with environment variables
```

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app (uses Dockerfile automatically)
flyctl launch

# Set secrets
flyctl secrets set TURSO_DB_URL=libsql://your-db.turso.io
flyctl secrets set TURSO_AUTH_TOKEN=your-token

# Deploy
flyctl deploy
```

### Railway

```bash
# Connect GitHub repo or use CLI
railway up

# Set environment variables in Railway dashboard
```

### Coolify

**Coolify Configuration:**

1. **Create new resource** → Docker Image (or connect GitHub repo)
2. **Build Pack**: Dockerfile (default)
3. **Build Arguments** (required - set in Coolify dashboard):
   - `TURSO_DB_URL`: Your Turso database URL (e.g., `libsql://your-db.turso.io`)
   - `TURSO_AUTH_TOKEN`: Your Turso authentication token
   - `EMBEDDING_PROVIDER`: `local` (optional, defaults to `local`)
4. **Runtime Environment Variables** (set in Coolify dashboard):
   - `TURSO_DB_URL`: Your Turso database URL (same as build arg)
   - `TURSO_AUTH_TOKEN`: Your Turso authentication token (same as build arg)
   - `EMBEDDING_PROVIDER`: `local` (or `gemini`/`openai` if using cloud embeddings)
   - Optional: `GEMINI_API_KEY` or `OPENAI_API_KEY` (if not using local embeddings)
5. **Port**: 4321
6. **Health Check Path**: `/`

**How it works:**
- Every build automatically indexes the latest markdown content to Turso
- Build args provide credentials for indexing and static pre-rendering
- Runtime env vars provide credentials for the running container
- No manual indexing step needed - just push code and deploy!

## Environment Variables

### Required for Turso (Production)
- `TURSO_DB_URL`: Turso database URL
- `TURSO_AUTH_TOKEN`: Turso authentication token

### Optional
- `EMBEDDING_PROVIDER`: `local` (default), `gemini`, or `openai`
- `GEMINI_API_KEY`: Required if using Gemini embeddings
- `OPENAI_API_KEY`: Required if using OpenAI embeddings
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `4321`)

### Automatic Fallback

If `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` are not set:
- Application uses `local.db` (embedded SQLite)
- Useful for CI/CD, testing, and offline development

## Testing

```bash
# Build image
docker build -t astro-vault:test .

# Run tests
docker run --rm astro-vault:test pnpm test

# Test with local database
docker run -d -p 4321:4321 --name test astro-vault:test

# Check logs
docker logs test

# Test HTTP endpoint
curl http://localhost:4321/

# Clean up
docker stop test && docker rm test
```

## Benefits

- **Consistent environments**: Same container runs in dev, staging, and production
- **Easy deployment**: Single Docker image deployable anywhere
- **Database flexibility**: Supports both remote Turso and local SQLite
- **Fast builds**: Multi-stage caching optimizes rebuild times
- **Security**: Non-root user, health checks, no hardcoded secrets
- **Developer friendly**: Docker Compose for local testing
- **Production ready**: Optimized image size, proper error handling

## Limitations

- **Build time**: Indexing 40+ markdown files adds ~6 seconds to build
- **Image size**: ~450 MB (acceptable for modern container platforms)
- **Local.db included**: Increases image size by ~5-10 MB
- **Static content**: To update content, must rebuild image (unless using Turso)

## Future Improvements

- [ ] Add CI/CD examples (GitHub Actions, GitLab CI)
- [ ] Create Kubernetes manifests
- [ ] Add docker-compose.prod.yml for production-like local testing
- [ ] Implement content hot-reloading (watch content/ directory)
- [ ] Add monitoring/observability examples (Prometheus, Grafana)

## Related Files

- `Dockerfile` - Multi-stage build configuration
- `.dockerignore` - Files excluded from Docker context
- `docker-compose.yml` - Local development orchestration
- `src/lib/turso.ts` - Database client with automatic Turso/local.db fallback
- `scripts/init-db.ts` - Database schema initialization
- `scripts/index-content.ts` - Content indexing script
