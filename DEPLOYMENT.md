# Production Deployment Guide

Comprehensive guide for deploying the DevSteps MCP server to production environments using Docker and Kubernetes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- **Docker**: 24.0+ (with BuildKit support)
- **Kubernetes**: 1.28+ (kubectl configured)
- **Container Registry**: Docker Hub, GitHub Container Registry, or private registry
- **Monitoring**: Prometheus + Grafana (optional but recommended)

### System Requirements
- **CPU**: 100m-500m per instance
- **Memory**: 128Mi-512Mi per instance
- **Storage**: 10Gi for persistent data (shared across replicas)
- **Network**: ClusterIP with session affinity for stateful connections

## Docker Deployment

### Building the Image

**Multi-stage build for optimized production image:**
```bash
docker build -t devsteps-mcp-server:latest .
```

**With build arguments:**
```bash
docker build \
  --build-arg NODE_VERSION=22 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t devsteps-mcp-server:v1.0.0 \
  .
```

**Build statistics:**
- **Builder stage**: ~500MB (includes build tools)
- **Production stage**: ~150MB (minimal runtime)
- **Build time**: 2-3 minutes (with caching)

### Running Locally

**Basic run:**
```bash
docker run --rm -it \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  devsteps-mcp-server:latest
```

**With volume mount for data persistence:**
```bash
docker run --rm -it \
  -v $(pwd)/.devsteps:/app/.devsteps \
  -e NODE_ENV=production \
  -e LOG_LEVEL=debug \
  devsteps-mcp-server:latest
```

**With resource limits:**
```bash
docker run --rm -it \
  --memory="512m" \
  --cpus="0.5" \
  -e NODE_ENV=production \
  devsteps-mcp-server:latest
```

### Docker Compose

```yaml
services:
  mcp-server:
    image: devsteps-mcp-server:latest
    container_name: devsteps-mcp
    restart: unless-stopped
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
    volumes:
      - ./data:/app/.devsteps
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Publishing to Registry

**Docker Hub:**
```bash
docker tag devsteps-mcp-server:latest username/devsteps-mcp-server:v1.0.0
docker push username/devsteps-mcp-server:v1.0.0
```

**GitHub Container Registry:**
```bash
docker tag devsteps-mcp-server:latest ghcr.io/username/devsteps-mcp-server:v1.0.0
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin
docker push ghcr.io/username/devsteps-mcp-server:v1.0.0
```

## Kubernetes Deployment

### Quick Start

**1. Create namespace:**
```bash
kubectl create namespace devsteps
kubectl config set-context --current --namespace=devsteps
```

**2. Apply manifests:**
```bash
# Apply in order
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/servicemonitor.yaml  # If using Prometheus Operator
```

**3. Verify deployment:**
```bash
kubectl get pods
kubectl get svc
kubectl get hpa
```

### Configuration Details

#### Deployment
- **Replicas**: 3 (minimum for high availability)
- **Strategy**: RollingUpdate with 25% surge
- **Pod Anti-Affinity**: Spread pods across nodes
- **Graceful Shutdown**: 30s termination grace period
- **Security**: Non-root user (1001), read-only root filesystem

#### Resource Management
```yaml
requests:
  memory: "128Mi"  # Minimum guaranteed
  cpu: "100m"      # 0.1 CPU cores
limits:
  memory: "512Mi"  # Maximum allowed
  cpu: "500m"      # 0.5 CPU cores
```

#### Probes
**Liveness Probe** (restart if failing):
- Initial delay: 30s
- Period: 10s
- Timeout: 5s
- Failure threshold: 3

**Readiness Probe** (remove from service if failing):
- Initial delay: 10s
- Period: 5s
- Timeout: 3s
- Failure threshold: 2

### Service Configuration

**Session Affinity:**
- Type: ClientIP
- Timeout: 3600s (1 hour)
- Ensures same client always hits same pod (important for stateful MCP sessions)

**Ports:**
- **8080**: HTTP/MCP traffic
- **9090**: Metrics endpoint

### Horizontal Pod Autoscaling

**Scaling triggers:**
- CPU > 70% utilization
- Memory > 80% utilization
- Custom metrics (e.g., requests per second)

**Scaling behavior:**
- **Scale up**: Fast (100% increase every 15s, max +2 pods)
- **Scale down**: Slow (50% decrease every 60s after 5min stabilization)
- **Range**: 3-10 replicas

**View HPA status:**
```bash
kubectl get hpa devsteps-mcp-server-hpa
kubectl describe hpa devsteps-mcp-server-hpa
```

### Persistent Storage

**PersistentVolumeClaim:**
- **Access Mode**: ReadWriteMany (shared across pods)
- **Size**: 10Gi (adjust based on data volume)
- **Storage Class**: standard (change to your cluster's storage class)

**Important**: Ensure your storage class supports ReadWriteMany for multi-pod access.

**Check storage:**
```bash
kubectl get pvc
kubectl describe pvc devsteps-data-pvc
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `LOG_LEVEL` | `info` | Logging level (fatal, error, warn, info, debug, trace) |
| `POD_NAME` | - | Pod name (auto-injected) |
| `POD_NAMESPACE` | - | Pod namespace (auto-injected) |

### ConfigMap Usage

**Update configuration:**
```bash
kubectl edit configmap devsteps-mcp-config
```

**Apply changes** (requires pod restart):
```bash
kubectl rollout restart deployment/devsteps-mcp-server
```

### Secrets Management

For sensitive data (API keys, credentials):
```bash
kubectl create secret generic devsteps-secrets \
  --from-literal=api-key=your-secret-key
```

**Reference in deployment:**
```yaml
env:
- name: API_KEY
  valueFrom:
    secretKeyRef:
      name: devsteps-secrets
      key: api-key
```

## Monitoring

### Prometheus Integration

**ServiceMonitor** (Prometheus Operator):
- Automatically discovers metrics endpoint
- Scrapes every 15 seconds
- Targets port 9090 at `/metrics`

**Manual Prometheus config:**
```yaml
scrape_configs:
- job_name: 'devsteps-mcp-server'
  kubernetes_sd_configs:
  - role: pod
    namespaces:
      names:
      - devsteps
  relabel_configs:
  - source_labels: [__meta_kubernetes_pod_label_app]
    regex: devsteps-mcp-server
    action: keep
```

### Grafana Dashboards

**Import dashboard:**
1. Go to Grafana → Dashboards → Import
2. Use queries from METRICS.md
3. Key metrics to monitor:
   - Request rate by tool
   - Error rate percentage
   - P95/P99 latency
   - Memory usage trend
   - Active connections

### Logging

**View logs:**
```bash
# All pods
kubectl logs -l app=devsteps-mcp-server --tail=100 -f

# Specific pod
kubectl logs devsteps-mcp-server-xxxxx-yyyyy -f

# Previous container (after crash)
kubectl logs devsteps-mcp-server-xxxxx-yyyyy --previous
```

**Centralized logging:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Loki + Grafana
- CloudWatch Logs (AWS)
- Stackdriver (GCP)

## Scaling

### Manual Scaling

**Scale deployment:**
```bash
kubectl scale deployment devsteps-mcp-server --replicas=5
```

**Scale HPA range:**
```bash
kubectl patch hpa devsteps-mcp-server-hpa --patch '{"spec":{"maxReplicas":15}}'
```

### Autoscaling Best Practices

1. **Set appropriate thresholds**: 70% CPU, 80% memory
2. **Use stabilization windows**: Prevent flapping
3. **Monitor scaling events**: `kubectl get events --watch`
4. **Test under load**: Use load testing tools (k6, Gatling)

### Load Testing

**Example with k6:**
```javascript
import { check } from 'k6';
import exec from 'k6/x/exec';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Steady state
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  // Call MCP server via kubectl exec
  const result = exec.command('kubectl', [
    'exec', 'deployment/devsteps-mcp-server', '--',
    'node', '-e', 'console.log("test")'
  ]);
  
  check(result, {
    'status is 0': (r) => r.exitCode === 0,
  });
}
```

## Troubleshooting

### Common Issues

#### Pods Not Starting

**Check pod status:**
```bash
kubectl get pods
kubectl describe pod devsteps-mcp-server-xxxxx-yyyyy
```

**Common causes:**
- Image pull errors (check registry credentials)
- Resource limits too low (increase limits)
- PVC not bound (check storage class)
- Configuration errors (check configmap/secrets)

#### High Memory Usage

**Check metrics:**
```bash
kubectl top pods
```

**Solutions:**
- Increase memory limits
- Check for memory leaks (review metrics trends)
- Reduce data volume per pod
- Scale horizontally instead of vertically

#### Connection Issues

**Test service:**
```bash
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod:
wget -O- http://devsteps-mcp-server:8080/health
```

**Check service endpoints:**
```bash
kubectl get endpoints devsteps-mcp-server
```

### Debugging Tools

**Interactive shell in pod:**
```bash
kubectl exec -it devsteps-mcp-server-xxxxx-yyyyy -- sh
```

**Port forwarding:**
```bash
kubectl port-forward deployment/devsteps-mcp-server 8080:8080
```

**Event monitoring:**
```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Health Checks

**Manual health check:**
```bash
kubectl exec deployment/devsteps-mcp-server -- node -e "
  const handler = require('./dist/handlers/devsteps-health.js');
  handler.healthHandler().then(console.log);
"
```

**Metrics check:**
```bash
kubectl exec deployment/devsteps-mcp-server -- node -e "
  const metrics = require('./dist/metrics.js');
  metrics.getMetricsJSON().then(m => console.log(JSON.stringify(m, null, 2)));
"
```

## Security Best Practices

### Pod Security

1. **Run as non-root**: UID 1001 (nodejs user)
2. **Drop all capabilities**: No privileged operations
3. **Read-only root filesystem**: Prevent tampering
4. **Security context**: Enforce at pod and container level

### Network Policies

**Example policy** (allow only from ingress):
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: devsteps-mcp-server-netpol
spec:
  podSelector:
    matchLabels:
      app: devsteps-mcp-server
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
```

### RBAC

**Minimal ServiceAccount:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: devsteps-mcp-server-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: devsteps-mcp-server-role
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: devsteps-mcp-server-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: devsteps-mcp-server-role
subjects:
- kind: ServiceAccount
  name: devsteps-mcp-server-sa
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t devsteps-mcp-server:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
        docker tag devsteps-mcp-server:${{ github.sha }} ghcr.io/${{ github.repository }}:${{ github.sha }}
        docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/devsteps-mcp-server \
          mcp-server=ghcr.io/${{ github.repository }}:${{ github.sha }}
        kubectl rollout status deployment/devsteps-mcp-server
```

## Performance Tuning

### Node.js Optimization

**Environment variables:**
```yaml
env:
- name: NODE_OPTIONS
  value: "--max-old-space-size=256 --max-semi-space-size=16"
```

### Resource Right-Sizing

**Monitor resource usage:**
```bash
kubectl top pods --containers
```

**Adjust based on actual usage:**
- If consistently near limits: Increase limits
- If consistently near requests: Decrease requests
- If low utilization: Scale down replicas

## References

- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
