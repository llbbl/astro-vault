---
title: Deployment Overview
tags: [deployment, docker, kubernetes, cloud, containers, infrastructure]
---

# Deployment Overview

Modern application deployment has evolved from manually configuring servers to using containers, orchestration platforms, and serverless architectures. This guide explores deployment strategies and platforms to help JavaScript/TypeScript developers ship applications reliably and scale effortlessly.

## Deployment Strategies

### Traditional Servers

Manual server management:

```
Developer → Server (SSH) → Install dependencies → Run app
                           ↑ Manual updates
                           ↑ Manual scaling
                           ↑ Manual monitoring
```

**Pros:**
- Full control
- Simple for small apps
- Cheaper for predictable traffic

**Cons:**
- Manual scaling
- Manual updates
- Single point of failure
- Time-consuming maintenance

### Containers (Docker)

Package app + dependencies in portable containers:

```
Developer → Docker Image → Registry → Deploy anywhere
                          ↑ Consistent environment
                          ↑ Easy rollbacks
                          ↑ Reproducible builds
```

**Pros:**
- Consistent environments (dev = prod)
- Easy to scale
- Portable (run anywhere)
- Fast deployments

**Cons:**
- Learning curve
- Resource overhead (compared to bare metal)

**→ [Learn more about Docker](/content/deployment/docker)**

### Container Orchestration (Kubernetes)

Automate container deployment, scaling, and management:

```
Developer → K8s Cluster → Auto-scaling
                        → Load balancing
                        → Self-healing
                        → Rolling updates
```

**Pros:**
- Auto-scaling
- Self-healing
- Load balancing
- Zero-downtime deployments

**Cons:**
- Complex setup
- Steep learning curve
- Overkill for small apps

**→ [Learn more about Kubernetes](/content/deployment/kubernetes)**

### Serverless

No server management—just deploy functions:

```
Developer → Deploy function → Auto-scales (0 to ∞)
                             → Pay per invocation
                             → No infrastructure management
```

**Pros:**
- Zero infrastructure management
- Auto-scaling (0 to millions)
- Pay per use
- Fast deployments

**Cons:**
- Cold starts
- Vendor lock-in
- Limited execution time
- Stateless only

**→ [Learn more about Serverless](/content/runtimes/serverless-edge)**

## Deployment Platforms

### Managed Container Platforms

#### Google Cloud Run

Fully managed container platform:

```bash
# Build and deploy container
gcloud run deploy my-app --source .
```

**Features:**
- Serverless containers
- Auto-scaling (0 to 1000+)
- Pay per use
- HTTPS included

**Pricing:**
- Free tier: 2 million requests/month
- $0.00002400 per request after

**→ [Learn more about Cloud Run](/content/deployment/cloud-run)**

#### AWS ECS (Elastic Container Service)

AWS-managed container orchestration:

```bash
# Deploy to ECS
aws ecs create-service --cluster my-cluster ...
```

**Features:**
- Tight AWS integration
- Choose EC2 or Fargate (serverless)
- Load balancing
- Service discovery

**Pricing:**
- EC2: Pay for instances
- Fargate: Pay per vCPU/GB

**→ [Learn more about ECS](/content/deployment/ecs)**

### Platform-as-a-Service (PaaS)

#### Vercel

Git-push deployments for [Next.js](/content/frameworks/nextjs) and frontend apps:

```bash
# Deploy on git push
git push origin main
```

**Features:**
- Zero-config deployments
- Preview deployments (per PR)
- Edge network
- Built-in analytics

**Pricing:**
- Free for personal projects
- Pro: $20/user/month

**Best for:** Next.js, frontend apps, serverless functions

#### Netlify

Similar to Vercel, great for JAMstack:

**Features:**
- Git-based deployments
- Preview deployments
- Edge functions
- Form handling

**Pricing:**
- Free tier (100 GB bandwidth)
- Pro: $19/month

**Best for:** Static sites, JAMstack

#### Railway

Modern PaaS for full-stack apps:

```bash
railway up
```

**Features:**
- Deploy from GitHub
- Databases included
- Auto-scaling
- Simple pricing

**Pricing:**
- $5/month + usage

**Best for:** Full-stack apps, databases

#### Fly.io

Run apps close to users globally:

```bash
fly deploy
```

**Features:**
- Global edge deployment
- Run anywhere (Docker)
- Low latency
- Pay-as-you-go

**Pricing:**
- Free tier (3 VMs)
- $0.02/GB bandwidth

**Best for:** Global apps, low-latency needs

### Kubernetes Platforms

#### Google Kubernetes Engine (GKE)

Managed Kubernetes on Google Cloud:

```bash
gcloud container clusters create my-cluster
kubectl apply -f deployment.yaml
```

**Features:**
- Fully managed
- Auto-scaling
- Auto-repair
- Load balancing

**Pricing:**
- $0.10/hour per cluster + compute

**→ [Learn more about Kubernetes](/content/deployment/kubernetes)**

#### Amazon EKS (Elastic Kubernetes Service)

Managed Kubernetes on AWS:

**Features:**
- AWS integration
- Fargate support (serverless)
- Auto-scaling

**Pricing:**
- $0.10/hour per cluster + compute

#### Azure Kubernetes Service (AKS)

Managed Kubernetes on Azure:

**Features:**
- Azure integration
- Free control plane
- Auto-scaling

**Pricing:**
- Free control plane + compute

## Deployment Comparison

| Platform | Type | Best For | Complexity | Cost |
|----------|------|----------|------------|------|
| [Docker](/content/deployment/docker) | Container | Portability | Low | Low |
| [Kubernetes](/content/deployment/kubernetes) | Orchestration | Large scale | High | Medium |
| [Cloud Run](/content/deployment/cloud-run) | Serverless containers | Auto-scaling | Low | Low |
| [ECS](/content/deployment/ecs) | Container orchestration | AWS ecosystem | Medium | Medium |
| Vercel | PaaS | Next.js/frontend | Low | Low |
| Railway | PaaS | Full-stack | Low | Medium |
| Fly.io | PaaS | Global apps | Low | Low |
| Lambda | Serverless | Event-driven | Low | Low |

## Choosing a Deployment Strategy

### For Side Projects

**Best Choice:** Vercel, Netlify, or Railway

```bash
# Push to deploy
git push origin main
```

**Why:**
- Zero config
- Free tier
- Preview deployments
- No infrastructure management

### For Startups

**Best Choice:** Cloud Run, Railway, or Fly.io

```bash
# Deploy container
gcloud run deploy --source .
```

**Why:**
- Auto-scaling
- Pay-per-use
- Easy to start
- Grows with you

### For Established Companies

**Best Choice:** Kubernetes (GKE, EKS, AKS)

```bash
kubectl apply -f deployment.yaml
```

**Why:**
- Full control
- Multi-cloud
- Advanced features
- Proven at scale

### For Enterprise

**Best Choice:** Kubernetes + Multi-cloud

**Why:**
- High availability
- Disaster recovery
- Compliance
- Vendor independence

## Common Deployment Patterns

### Blue-Green Deployment

Run two identical environments, switch traffic:

```
Blue (v1.0) ← 100% traffic
Green (v1.1) ← 0% traffic

(test v1.1 on Green)

Blue (v1.0) ← 0% traffic
Green (v1.1) ← 100% traffic (switch)
```

**Pros:**
- Zero downtime
- Easy rollback

**Cons:**
- Double resources

### Canary Deployment

Gradually roll out to users:

```
v1.0 ← 95% traffic
v1.1 ← 5% traffic

(monitor)

v1.0 ← 50% traffic
v1.1 ← 50% traffic

(monitor)

v1.1 ← 100% traffic
```

**Pros:**
- Gradual rollout
- Lower risk

**Cons:**
- Slower rollout

### Rolling Deployment

Update instances one at a time:

```
Instance 1: v1.0 → v1.1
Instance 2: v1.0 (still running)
Instance 3: v1.0 (still running)

Instance 1: v1.1 ✓
Instance 2: v1.0 → v1.1
Instance 3: v1.0 (still running)

Instance 1: v1.1 ✓
Instance 2: v1.1 ✓
Instance 3: v1.0 → v1.1

All instances: v1.1 ✓
```

**Pros:**
- Zero downtime
- No extra resources

**Cons:**
- Mixed versions temporarily

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t myapp .

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy myapp \
            --image myapp \
            --platform managed \
            --region us-central1
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  script:
    - docker build -t myapp .
    - kubectl apply -f deployment.yaml
  only:
    - main
```

## Monitoring and Observability

### Logging

```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'User logged in',
  userId: '123',
  timestamp: new Date().toISOString(),
}));
```

### Metrics

Common metrics to track:

- **Request rate**: Requests per second
- **Error rate**: 5xx errors per second
- **Latency**: p50, p95, p99 response times
- **Saturation**: CPU, memory, disk usage

### Tools

- **Logs**: CloudWatch, Stackdriver, Datadog
- **Metrics**: Prometheus, Grafana, Datadog
- **Tracing**: Jaeger, Zipkin, DataDog APM
- **All-in-one**: Datadog, New Relic, Sentry

## Best Practices

### 1. Use Environment Variables

```typescript
// ✓ Good - use env vars
const dbUrl = process.env.DATABASE_URL;

// ❌ Bad - hardcoded
const dbUrl = 'postgresql://user:pass@host/db';
```

### 2. Health Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Readiness check (check dependencies)
app.get('/ready', async (req, res) => {
  try {
    await db.ping();
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

### 3. Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Stop accepting new requests
  server.close();

  // Close database connections
  await db.close();

  // Exit
  process.exit(0);
});
```

### 4. Use .dockerignore

```
# .dockerignore
node_modules
.git
.env
*.md
```

## Deployment Technologies

- **[Docker](/content/deployment/docker)** - Containerization platform
- **[Kubernetes](/content/deployment/kubernetes)** - Container orchestration
- **[Cloud Run](/content/deployment/cloud-run)** - Serverless containers on GCP
- **[ECS](/content/deployment/ecs)** - Container orchestration on AWS

## Key Takeaways

- **Containers** (Docker) provide consistent environments
- **Kubernetes** automates scaling and management (complex)
- **Serverless** offers zero infrastructure management
- **PaaS** (Vercel, Railway) simplest for small/medium apps
- **Choose based on** team size, app complexity, traffic patterns
- **Use CI/CD** for automated deployments
- **Monitor** logs, metrics, and traces

## Related Topics

- [Docker](/content/deployment/docker) - Containerization basics
- [Kubernetes](/content/deployment/kubernetes) - Container orchestration
- [Cloud Run](/content/deployment/cloud-run) - Serverless containers
- [Serverless & Edge](/content/runtimes/serverless-edge) - Serverless deployment
- [Node.js](/content/runtimes/nodejs) - Popular runtime for deployments

Modern deployment has never been easier. For most teams, start with a PaaS like Vercel or Railway, use Docker for portability, and graduate to Kubernetes only when you truly need its power. The best deployment strategy is the simplest one that meets your needs.
