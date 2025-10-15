---
title: AWS ECS (Elastic Container Service)
tags: [aws, ecs, containers, fargate, docker, deployment, cloud]
---

# AWS ECS (Elastic Container Service)

AWS Elastic Container Service (ECS) is Amazon's container orchestration platform for running [Docker](/content/deployment/docker) containers on AWS. Launched in 2015, ECS integrates deeply with AWS services and offers two modes: EC2 (manage your own servers) and Fargate (serverless). For JavaScript/TypeScript developers on AWS, ECS provides a managed alternative to [Kubernetes](/content/deployment/kubernetes) with tight AWS integration.

## What is ECS?

**ECS** orchestrates Docker containers on AWS:

```
Your Container → ECS → Choose:
                      → EC2 (manage instances)
                      → Fargate (serverless)

                    → Auto-scaling
                    → Load balancing
                    → AWS integration
```

**Key Concepts:**
- **Cluster**: Logical grouping of tasks/services
- **Task Definition**: Blueprint for container(s)
- **Task**: Running instance of task definition
- **Service**: Maintains desired number of tasks
- **EC2 Launch Type**: Run on EC2 instances you manage
- **Fargate Launch Type**: Serverless (AWS manages servers)

## Why ECS?

### 1. AWS Integration

Native integration with AWS services:

```
ECS Container
├── ALB (Application Load Balancer)
├── RDS (PostgreSQL, MySQL)
├── S3 (Storage)
├── CloudWatch (Logs, Metrics)
├── IAM (Permissions)
├── Secrets Manager
└── VPC (Networking)
```

### 2. Fargate (Serverless)

No server management:

```
Traditional:
You manage EC2 instances
You handle scaling
You patch OS

Fargate:
AWS manages everything
Auto-scaling
No patching
```

### 3. Simpler than Kubernetes

```
Kubernetes:
- Powerful
- Complex
- Steep learning curve
- YAML heavy

ECS:
- AWS-focused
- Simpler
- Easier learning curve
- JSON/YAML
```

### 4. Cost Control

```
EC2 Launch Type:
- Pay for EC2 instances (always running)
- Cheaper for consistent workloads

Fargate Launch Type:
- Pay per task (vCPU + memory)
- Cheaper for variable workloads
- No idle costs
```

## ECS Architecture

```
ECS Cluster
├── EC2 Launch Type
│   ├── EC2 Instance 1
│   │   ├── ECS Agent
│   │   ├── Task 1
│   │   └── Task 2
│   └── EC2 Instance 2
│       ├── ECS Agent
│       └── Task 3
│
└── Fargate Launch Type
    ├── Task 1 (serverless)
    ├── Task 2 (serverless)
    └── Task 3 (serverless)
```

## Task Definition

Blueprint for your container:

```json
{
  "family": "myapp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "myapp",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/myapp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Deploying Node.js App to ECS Fargate

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Build and Push to ECR

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t myapp .

# Tag image
docker tag myapp:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

### 3. Create Task Definition

```bash
# Create task definition JSON (task-def.json)
cat > task-def.json << EOF
{
  "family": "myapp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "myapp",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/myapp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-def.json
```

### 4. Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name myapp-cluster
```

### 5. Create Service

```bash
# Create service
aws ecs create-service \
  --cluster myapp-cluster \
  --service-name myapp-service \
  --task-definition myapp \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## ECS with Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name myapp-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /health

# Create load balancer
aws elbv2 create-load-balancer \
  --name myapp-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...

# Update service with load balancer
aws ecs update-service \
  --cluster myapp-cluster \
  --service myapp-service \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=myapp,containerPort=3000
```

## Auto-Scaling

### Service Auto-Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/myapp-cluster/myapp-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/myapp-cluster/myapp-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

```json
// scaling-policy.json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
```

## Environment Variables and Secrets

### Environment Variables

```json
{
  "environment": [
    {
      "name": "NODE_ENV",
      "value": "production"
    },
    {
      "name": "PORT",
      "value": "3000"
    }
  ]
}
```

### Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name myapp/database-url \
  --secret-string "postgresql://user:pass@host/db"

# Use in task definition
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:myapp/database-url"
    }
  ]
}
```

## ECS with CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: myapp
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster myapp-cluster \
            --service myapp-service \
            --force-new-deployment
```

## ECS EC2 vs. Fargate

| Feature | EC2 Launch Type | Fargate Launch Type |
|---------|----------------|---------------------|
| **Server Management** | You manage | AWS manages |
| **Pricing** | Pay for EC2 instances | Pay per task |
| **Scaling** | Manual + Auto | Auto-scaling |
| **Customization** | Full control | Limited |
| **Cost (consistent)** | Cheaper | More expensive |
| **Cost (variable)** | More expensive | Cheaper |
| **Best For** | Predictable workloads | Variable workloads |

## Fargate Pricing

**Pricing Model:**
- vCPU: $0.04048 per vCPU-hour
- Memory: $0.004445 per GB-hour

**Example Cost:**

```
Task: 0.25 vCPU + 0.5 GB memory
Running 24/7 for 1 month:

vCPU: 0.25 × $0.04048 × 730 hours = $7.39
Memory: 0.5 × $0.004445 × 730 hours = $1.62
Total: ~$9/month per task

2 tasks = ~$18/month
10 tasks = ~$90/month
```

## ECS vs. Alternatives

| Feature | ECS | [Kubernetes](/content/deployment/kubernetes) | [Cloud Run](/content/deployment/cloud-run) |
|---------|-----|-------------|-----------|
| **Complexity** | Medium | High | Low |
| **AWS Integration** | Native | Good | None (GCP) |
| **Multi-cloud** | No | Yes | No |
| **Serverless** | Fargate only | No | Yes |
| **Learning Curve** | Medium | Steep | Easy |
| **Best For** | AWS apps | Multi-cloud | Serverless |

## Best Practices

### 1. Use Fargate for Variable Workloads

```bash
# ✓ Good - Fargate for variable traffic
--launch-type FARGATE

# Consider EC2 for consistent high traffic
```

### 2. Use Secrets Manager

```json
// ✓ Good - secrets from Secrets Manager
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:..."
    }
  ]
}

// ❌ Bad - hardcoded secrets
{
  "environment": [
    {
      "name": "DATABASE_URL",
      "value": "postgresql://user:pass@host/db"
    }
  ]
}
```

### 3. Health Checks

```json
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

### 4. Use Application Load Balancer

```bash
# Provides:
# - Health checks
# - Auto-scaling triggers
# - HTTPS termination
# - Path-based routing
```

### 5. Resource Limits

```json
{
  "cpu": "256",    // 0.25 vCPU
  "memory": "512"  // 512 MB
}
```

## When to Use ECS

**Use ECS when:**
- Running containers on AWS
- Want simpler alternative to Kubernetes
- Need tight AWS integration
- Using other AWS services (RDS, S3, etc.)

**Use Fargate when:**
- Variable workloads
- Don't want to manage servers
- Quick deployments

**Use EC2 when:**
- Consistent high workloads
- Need full control
- Cost-sensitive (predictable traffic)

**Alternatives:**
- Multi-cloud: [Kubernetes](/content/deployment/kubernetes)
- Simpler: [Cloud Run](/content/deployment/cloud-run), Vercel, Railway
- AWS Lambda: Event-driven functions

## Key Takeaways

- **AWS container orchestration** platform
- **Two modes**: EC2 (manage servers) or Fargate (serverless)
- **Tight AWS integration** (RDS, S3, IAM, etc.)
- **Simpler than Kubernetes**
- **Fargate** for variable workloads
- **EC2** for predictable high traffic
- **Use ALB** for load balancing and health checks

## Related Topics

- [Docker](/content/deployment/docker) - Container basics
- [Kubernetes](/content/deployment/kubernetes) - Alternative orchestration
- [Cloud Run](/content/deployment/cloud-run) - Google's serverless containers
- [Deployment Overview](/content/deployment/deployment-overview) - Compare deployment strategies
- [Node.js](/content/runtimes/nodejs) - Popular runtime for ECS

ECS is the best choice for running containers on AWS. Use Fargate for simplicity and variable workloads, or EC2 launch type for cost optimization with predictable traffic. It's simpler than Kubernetes while providing excellent AWS integration.
