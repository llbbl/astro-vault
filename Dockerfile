# Build stage
FROM node:20-slim AS builder

# Build argument to control database initialization
ARG USE_TURSO=false

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

# Initialize database and index content for build (only if not using Turso)
# When USE_TURSO=true, assumes Turso database is already indexed
RUN if [ "$USE_TURSO" = "false" ]; then \
      pnpm db:init:local && pnpm index:local; \
    else \
      touch local.db; \
    fi

# Build application
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
