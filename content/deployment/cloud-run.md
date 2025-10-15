---
title: Google Cloud Run
tags: [cloud-run, google-cloud, gcp, serverless, containers, deployment]
---

# Google Cloud Run

Google Cloud Run is a fully managed serverless platform for running containers. Launched in 2019, Cloud Run combines the flexibility of containers with the simplicity of serverless—deploy any containerized app and Cloud Run handles scaling, load balancing, and infrastructure. For JavaScript/TypeScript developers, Cloud Run offers the easiest way to run [Docker](/content/deployment/docker) containers in production.

## What is Cloud Run?

**Cloud Run** is **serverless containers**:

```bash
# Deploy container from source
gcloud run deploy myapp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

```
Your Code → Docker Container → Cloud Run → Auto-scales (0 to 1000+)
                                         → HTTPS automatically
                                         → Pay per use
```

**Key Features:**
- **Serverless**: No infrastructure management
- **Any language**: Deploy any container
- **Auto-scaling**: 0 to 1000+ instances automatically
- **Pay per use**: Only pay when handling requests
- **HTTPS included**: Automatic SSL certificates
- **Fast deploys**: ~30 seconds

## Why Cloud Run?

### 1. Serverless Containers

Best of both worlds:

```
Kubernetes:
- Powerful
- Complex
- Manual scaling
- Always running (costly)

Cloud Run:
- Powerful (any container)
- Simple
- Auto-scaling
- Scale to zero (cheap)
```

### 2. Scale to Zero

```
No traffic:
[0 instances] ← No cost

Traffic arrives:
[Instance 1] ← Auto-starts in < 1s

High traffic:
[Instance 1] [Instance 2] [Instance 3] ... [Instance N]
↑ Auto-scales based on load
```

Pay only when handling requests.

### 3. Any Container

Deploy any containerized app:

```
Node.js ✓
Python ✓
Go ✓
Rust ✓
Java ✓
Custom Dockerfile ✓
```

### 4. Zero Configuration

```bash
# That's it!
gcloud run deploy myapp --source .
```

Cloud Run handles:
- Load balancing
- SSL certificates
- Scaling
- Health checks
- Logging
- Monitoring

## Using Cloud Run with Node.js

### Simple Node.js App

```typescript
// server.ts
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Cloud Run!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "dist/server.js"]
```

```bash
# Deploy
gcloud run deploy myapp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Important**: Cloud Run sets `PORT` environment variable. Your app MUST listen on this port.

### With Next.js

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```json
// next.config.js
module.exports = {
  output: 'standalone',
};
```

```bash
# Deploy
gcloud run deploy myapp \
  --source . \
  --platform managed \
  --region us-central1
```

### With Database

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

```bash
# Set database URL
gcloud run deploy myapp \
  --source . \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --region us-central1
```

## Deployment Methods

### 1. From Source (Recommended)

```bash
# Cloud Run builds container for you
gcloud run deploy myapp \
  --source . \
  --region us-central1
```

Cloud Run automatically:
- Detects language
- Builds Dockerfile
- Creates container
- Deploys

### 2. From Dockerfile

```bash
# Use your Dockerfile
gcloud run deploy myapp \
  --source . \
  --region us-central1
```

### 3. From Pre-Built Image

```bash
# Build locally
docker build -t gcr.io/PROJECT_ID/myapp .
docker push gcr.io/PROJECT_ID/myapp

# Deploy
gcloud run deploy myapp \
  --image gcr.io/PROJECT_ID/myapp \
  --region us-central1
```

### 4. From Container Registry

```bash
# Deploy from Artifact Registry
gcloud run deploy myapp \
  --image us-docker.pkg.dev/PROJECT_ID/myrepo/myapp:latest \
  --region us-central1
```

## Configuration

### Environment Variables

```bash
# Set single variable
gcloud run deploy myapp \
  --set-env-vars API_KEY=secret123

# Set multiple variables
gcloud run deploy myapp \
  --set-env-vars KEY1=value1,KEY2=value2

# From file
gcloud run deploy myapp \
  --env-vars-file .env.yaml
```

```yaml
# .env.yaml
API_KEY: secret123
DATABASE_URL: postgresql://...
NODE_ENV: production
```

### Secrets

```bash
# Create secret
echo -n "my-secret-value" | gcloud secrets create my-secret --data-file=-

# Use in Cloud Run
gcloud run deploy myapp \
  --set-secrets DATABASE_URL=my-secret:latest
```

### Memory and CPU

```bash
gcloud run deploy myapp \
  --memory 512Mi \
  --cpu 2
```

**Limits:**
- Memory: 128 MiB to 32 GiB
- CPU: 1 to 8 vCPUs
- Timeout: 1s to 60 minutes

### Concurrency

```bash
# Max concurrent requests per instance
gcloud run deploy myapp \
  --concurrency 80
```

**Default**: 80 concurrent requests per instance

### Min/Max Instances

```bash
# Always keep 1 instance warm (avoid cold starts)
gcloud run deploy myapp \
  --min-instances 1 \
  --max-instances 100
```

## Auto-Scaling

Cloud Run automatically scales based on:

- **CPU utilization**
- **Concurrent requests**
- **Custom metrics**

```bash
# Scale from 0 to 100 instances
gcloud run deploy myapp \
  --min-instances 0 \
  --max-instances 100
```

```
0 requests:
[0 instances] ← Scale to zero

10 requests/sec:
[Instance 1]

100 requests/sec:
[Instance 1] [Instance 2] [Instance 3]

1000 requests/sec:
[Instance 1] ... [Instance 12]

Scales automatically based on load
```

## Custom Domains

```bash
# Map domain
gcloud run services add-iam-policy-binding myapp \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region us-central1

gcloud run domain-mappings create \
  --service myapp \
  --domain myapp.com \
  --region us-central1
```

Cloud Run provides free SSL certificate.

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy myapp \
            --source . \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  image: google/cloud-sdk:alpine
  script:
    - echo $GCP_SERVICE_KEY | base64 -d > ${HOME}/gcloud-service-key.json
    - gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
    - gcloud run deploy myapp --source . --platform managed --region us-central1
  only:
    - main
```

## Cloud Run vs. Alternatives

| Feature | Cloud Run | [Kubernetes](/content/deployment/kubernetes) | [ECS Fargate](/content/deployment/ecs) |
|---------|-----------|-------------|--------------|
| **Setup** | Zero config | Complex | Medium |
| **Scaling** | Auto (0 to N) | Auto (N to M) | Auto (N to M) |
| **Scale to Zero** | Yes | No | No |
| **Cold Starts** | < 1s | N/A | N/A |
| **Pricing** | Pay per use | Pay for nodes | Pay per task |
| **Best For** | Serverless | Large scale | AWS ecosystem |

## Pricing

**Pricing Model:**
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million

**Free Tier (per month):**
- 2 million requests
- 360,000 vCPU-seconds
- 180,000 GiB-seconds

**Example Cost:**

```
Small app (1M requests, 500ms avg):
- Requests: Free (under 2M)
- CPU/Memory: ~$5/month

Medium app (10M requests, 500ms avg):
- Requests: $3.20
- CPU/Memory: ~$50/month
- Total: ~$53/month

Large app (100M requests, 500ms avg):
- Requests: $39.20
- CPU/Memory: ~$500/month
- Total: ~$539/month
```

## Best Practices

### 1. Listen on PORT Environment Variable

```typescript
// ✓ Good - use PORT from environment
const PORT = process.env.PORT || 8080;
app.listen(PORT);

// ❌ Bad - hardcoded port
app.listen(3000);
```

### 2. Implement Health Checks

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

### 3. Handle SIGTERM for Graceful Shutdown

```typescript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
```

### 4. Use Connection Pooling for Databases

```typescript
// ✓ Good - connection pooling
const pool = new Pool({
  max: 5, // Limit connections per instance
});

// ❌ Bad - no pooling
const client = new Client();
```

### 5. Set Min Instances to Avoid Cold Starts

```bash
# Keep 1 instance warm for production
gcloud run deploy myapp --min-instances 1
```

### 6. Use Secrets for Sensitive Data

```bash
# ✓ Good - use secrets
gcloud run deploy myapp --set-secrets API_KEY=my-secret:latest

# ❌ Bad - environment variable
gcloud run deploy myapp --set-env-vars API_KEY=secret123
```

## Limitations

- **Request timeout**: Max 60 minutes (default 5 minutes)
- **Cold starts**: First request slower (~1s)
- **Stateless**: No persistent local storage
- **WebSocket**: Supported but closes on scale-to-zero
- **GCP only**: Not portable (vendor lock-in)

## When to Use Cloud Run

**Use Cloud Run when:**
- Building web APIs or services
- Want serverless simplicity with container flexibility
- Need auto-scaling (including scale-to-zero)
- On Google Cloud Platform
- Want easy deployments

**Avoid Cloud Run when:**
- Need persistent local storage
- Running stateful applications
- Require WebSockets with long connections
- Want multi-cloud portability

**Alternatives:**
- Multi-cloud: [Kubernetes](/content/deployment/kubernetes)
- AWS: [ECS Fargate](/content/deployment/ecs)
- Simpler: Vercel, Railway

## Key Takeaways

- **Serverless containers** (best of both worlds)
- **Auto-scaling** from 0 to 1000+ instances
- **Pay per use** (only when handling requests)
- **Zero configuration** (deploy with one command)
- **Any language/framework** (any container)
- **HTTPS included** (automatic SSL)
- **Fast deployments** (~30 seconds)

## Related Topics

- [Docker](/content/deployment/docker) - Container basics
- [Kubernetes](/content/deployment/kubernetes) - Full orchestration platform
- [ECS](/content/deployment/ecs) - AWS container service
- [Deployment Overview](/content/deployment/deployment-overview) - Compare deployment strategies
- [Node.js](/content/runtimes/nodejs) - Popular runtime for Cloud Run

Cloud Run is the sweet spot between serverless simplicity and container flexibility. It's perfect for most web applications, offering easy deployments, automatic scaling, and pay-per-use pricing. Use it when you want the power of containers without the complexity of Kubernetes.
