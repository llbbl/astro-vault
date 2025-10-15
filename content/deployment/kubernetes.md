---
title: Kubernetes
tags: [kubernetes, k8s, containers, orchestration, deployment, scaling, cloud]
---

# Kubernetes

Kubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Created by Google in 2014, Kubernetes has become the standard for running containers at scale. For JavaScript/TypeScript developers, Kubernetes turns [Docker](/content/deployment/docker) containers into production-ready, self-healing, auto-scaling applications.

## What is Kubernetes?

**Kubernetes** orchestrates containers:

```
Developer → Deploy to K8s → Auto-scaling
                          → Self-healing
                          → Load balancing
                          → Zero-downtime updates
                          → Service discovery
```

**Key Concepts:**
- **Cluster**: Group of machines running Kubernetes
- **Node**: Worker machine (physical or virtual)
- **Pod**: Smallest deployable unit (1+ containers)
- **Deployment**: Manages pods and replicas
- **Service**: Exposes pods to network
- **Ingress**: HTTP(S) routing to services

## Why Kubernetes?

### 1. Auto-Scaling

Automatically scale based on load:

```
Low traffic:
[Pod 1] [Pod 2]

High traffic:
[Pod 1] [Pod 2] [Pod 3] [Pod 4] [Pod 5] [Pod 6]
↑ Kubernetes automatically adds pods
```

### 2. Self-Healing

Automatically restart failed containers:

```
[Pod 1] [Pod 2] [Pod 3]
          ↓
      (Pod 2 crashes)
          ↓
[Pod 1] [Pod 2] [Pod 3]
        ↑ Kubernetes restarts Pod 2 automatically
```

### 3. Zero-Downtime Deployments

Rolling updates with no downtime:

```
v1.0: [Pod 1] [Pod 2] [Pod 3]
                ↓
v1.1: [Pod 1-new] [Pod 2] [Pod 3]
                ↓
v1.1: [Pod 1-new] [Pod 2-new] [Pod 3]
                ↓
v1.1: [Pod 1-new] [Pod 2-new] [Pod 3-new]
```

### 4. Load Balancing

Distribute traffic across pods:

```
Request → Load Balancer → [Pod 1]
                        → [Pod 2]
                        → [Pod 3]
```

## Kubernetes Architecture

```
Kubernetes Cluster
├── Control Plane (manages cluster)
│   ├── API Server
│   ├── Scheduler
│   ├── Controller Manager
│   └── etcd (key-value store)
└── Worker Nodes (run containers)
    ├── Node 1
    │   ├── kubelet (node agent)
    │   ├── kube-proxy (networking)
    │   └── Container Runtime (Docker, containerd)
    ├── Node 2
    └── Node 3
```

## Basic Kubernetes Objects

### Pod

Smallest deployable unit:

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:v1.0.0
    ports:
    - containerPort: 3000
```

```bash
# Apply pod
kubectl apply -f pod.yaml

# View pods
kubectl get pods

# View logs
kubectl logs myapp-pod

# Delete pod
kubectl delete pod myapp-pod
```

### Deployment

Manages replicas and updates:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3  # Run 3 pods
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# View deployments
kubectl get deployments

# View pods
kubectl get pods

# Scale deployment
kubectl scale deployment myapp-deployment --replicas=5

# Update image
kubectl set image deployment/myapp-deployment myapp=myapp:v2.0.0

# View rollout status
kubectl rollout status deployment/myapp-deployment

# Rollback
kubectl rollout undo deployment/myapp-deployment
```

### Service

Exposes pods to network:

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer  # Creates external load balancer
```

**Service Types:**

- **ClusterIP** (default): Internal only
- **NodePort**: Exposes on each node's IP
- **LoadBalancer**: Creates external load balancer
- **ExternalName**: Maps to DNS name

```bash
# Apply service
kubectl apply -f service.yaml

# View services
kubectl get services

# Get external IP
kubectl get service myapp-service
```

### Ingress

HTTP(S) routing:

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - myapp.com
    secretName: myapp-tls
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## ConfigMaps and Secrets

### ConfigMap

Non-sensitive configuration:

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  APP_NAME: "My App"
  LOG_LEVEL: "info"
  API_URL: "https://api.example.com"
```

Use in deployment:

```yaml
spec:
  containers:
  - name: myapp
    envFrom:
    - configMapRef:
        name: myapp-config
```

### Secret

Sensitive data (base64 encoded):

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc0BkYi9teWRi  # base64 encoded
  api-key: c2VjcmV0MTIz  # base64 encoded
```

```bash
# Create secret from command
kubectl create secret generic myapp-secrets \
  --from-literal=database-url=postgresql://user:pass@db/mydb \
  --from-literal=api-key=secret123
```

Use in deployment:

```yaml
spec:
  containers:
  - name: myapp
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: myapp-secrets
          key: database-url
```

## Complete Example: Node.js App

### 1. Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Build and Push

```bash
# Build image
docker build -t myusername/myapp:v1.0.0 .

# Push to registry
docker push myusername/myapp:v1.0.0
```

### 3. Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myusername/myapp:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 4. Deploy

```bash
# Create secret
kubectl create secret generic myapp-secrets \
  --from-literal=database-url=$DATABASE_URL

# Apply deployment and service
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/myapp
```

## Auto-Scaling

### Horizontal Pod Autoscaler (HPA)

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
kubectl apply -f hpa.yaml

# View HPA status
kubectl get hpa
```

## Health Checks

### Liveness Probe

Restart container if unhealthy:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```

### Readiness Probe

Remove from load balancer if not ready:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

```typescript
// server.ts
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/ready', async (req, res) => {
  try {
    await db.ping();
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

## Rolling Updates

### Update Deployment

```bash
# Update image
kubectl set image deployment/myapp myapp=myapp:v2.0.0

# Or edit deployment
kubectl edit deployment myapp

# Watch rollout
kubectl rollout status deployment/myapp

# View rollout history
kubectl rollout history deployment/myapp

# Rollback
kubectl rollout undo deployment/myapp

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=2
```

### Update Strategy

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1  # Max extra pods during update
      maxUnavailable: 0  # Max unavailable pods
```

## Managed Kubernetes Services

### Google Kubernetes Engine (GKE)

```bash
# Create cluster
gcloud container clusters create my-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --region=us-central1

# Get credentials
gcloud container clusters get-credentials my-cluster

# Deploy
kubectl apply -f deployment.yaml
```

**Pricing:**
- $0.10/hour per cluster + compute costs

### Amazon EKS

```bash
# Create cluster (using eksctl)
eksctl create cluster \
  --name my-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Deploy
kubectl apply -f deployment.yaml
```

**Pricing:**
- $0.10/hour per cluster + compute costs

### Azure Kubernetes Service (AKS)

```bash
# Create cluster
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --enable-addons monitoring

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# Deploy
kubectl apply -f deployment.yaml
```

**Pricing:**
- Free control plane + compute costs

## kubectl Commands

```bash
# View resources
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get nodes

# Describe resource
kubectl describe pod myapp-pod

# View logs
kubectl logs myapp-pod
kubectl logs -f deployment/myapp  # Follow logs

# Execute command in container
kubectl exec -it myapp-pod -- sh

# Port forward (local testing)
kubectl port-forward pod/myapp-pod 3000:3000

# Delete resources
kubectl delete pod myapp-pod
kubectl delete deployment myapp
kubectl delete service myapp-service

# Delete everything in namespace
kubectl delete all --all

# View resource usage
kubectl top nodes
kubectl top pods
```

## Namespaces

Isolate resources:

```bash
# Create namespace
kubectl create namespace staging

# Deploy to namespace
kubectl apply -f deployment.yaml -n staging

# View resources in namespace
kubectl get pods -n staging

# Set default namespace
kubectl config set-context --current --namespace=staging
```

## Best Practices

### 1. Use Resource Limits

```yaml
resources:
  requests:  # Minimum resources
    memory: "128Mi"
    cpu: "100m"
  limits:  # Maximum resources
    memory: "256Mi"
    cpu: "500m"
```

### 2. Use Liveness and Readiness Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
```

### 3. Use ConfigMaps and Secrets

```yaml
# ✓ Good - externalized config
envFrom:
- configMapRef:
    name: myapp-config
- secretRef:
    name: myapp-secrets

# ❌ Bad - hardcoded
env:
- name: API_KEY
  value: "secret123"
```

### 4. Use Labels

```yaml
metadata:
  labels:
    app: myapp
    version: v1.0.0
    environment: production
```

### 5. Use Rolling Updates

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## Kubernetes vs. Alternatives

| Feature | Kubernetes | [Docker](/content/deployment/docker) Compose | [Cloud Run](/content/deployment/cloud-run) |
|---------|------------|----------|-----------|
| **Complexity** | High | Low | Low |
| **Scaling** | Auto | Manual | Auto |
| **Self-healing** | Yes | No | Yes |
| **Multi-cloud** | Yes | No | No (GCP only) |
| **Learning Curve** | Steep | Easy | Easy |
| **Best For** | Large scale | Development | Serverless |

## When to Use Kubernetes

**Use Kubernetes when:**
- Running microservices (10+ services)
- Need auto-scaling
- Multi-cloud deployment
- High availability requirements
- Large team/company

**Avoid Kubernetes when:**
- Small team (< 5 developers)
- Simple monolithic app
- Limited DevOps expertise
- Tight budget

**Alternatives:**
- Small apps: [Cloud Run](/content/deployment/cloud-run), Heroku, Railway
- Simple containers: [Docker](/content/deployment/docker) Compose
- AWS ecosystem: [ECS](/content/deployment/ecs)

## Key Takeaways

- **Container orchestration** platform
- **Auto-scaling** and self-healing
- **Zero-downtime** rolling updates
- **Load balancing** and service discovery
- **Complex** but powerful
- **Best for** large-scale applications
- **Use managed services** (GKE, EKS, AKS)

## Related Topics

- [Docker](/content/deployment/docker) - Container platform (prerequisite)
- [Cloud Run](/content/deployment/cloud-run) - Simpler alternative for serverless
- [ECS](/content/deployment/ecs) - AWS container service
- [Deployment Overview](/content/deployment/deployment-overview) - Compare deployment strategies
- [Node.js](/content/runtimes/nodejs) - Popular runtime for Kubernetes

Kubernetes is powerful but complex. It's the industry standard for large-scale container orchestration, but consider simpler alternatives (Cloud Run, ECS Fargate) unless you truly need Kubernetes' power. Use managed Kubernetes services (GKE, EKS, AKS) to reduce operational overhead.
