# Prometheus Metrics & Observability

Comprehensive monitoring and observability for production MCP server deployments using Prometheus metrics.

## Overview

The MCP server exposes detailed metrics in Prometheus format, enabling:
- **Performance Monitoring**: Track request durations, throughput, and latency percentiles
- **Error Tracking**: Monitor error rates by type and tool
- **Resource Monitoring**: Track memory usage and active connections
- **Alerting**: Configure alerts based on SLOs and error budgets
- **Dashboards**: Visualize metrics in Grafana or other visualization tools

## Available Metrics

### Request Metrics

**`mcp_tool_requests_total` (Counter)**
- Total number of tool requests
- Labels: `tool` (tool name), `status` (success/error)
- Use for: Request rate, success rate, error rate calculations

**`mcp_tool_duration_seconds` (Histogram)**
- Tool execution duration in seconds
- Labels: `tool` (tool name)
- Buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30]
- Use for: Latency percentiles (p50, p95, p99), SLO tracking

### Error Metrics

**`mcp_errors_total` (Counter)**
- Total errors by type
- Labels: `error_type` (error name), `tool` (tool name)
- Use for: Error rate tracking, error breakdown analysis

### Resource Metrics

**`mcp_active_connections` (Gauge)**
- Current number of active connections
- Use for: Capacity planning, connection pool monitoring

**`mcp_memory_bytes` (Gauge)**
- Memory usage in bytes
- Labels: `type` (heap_used, heap_total, rss, external)
- Use for: Memory leak detection, resource optimization

**`mcp_uptime_seconds` (Gauge)**
- Server uptime in seconds
- Use for: Availability tracking, restart detection

## Accessing Metrics

### Via MCP Tool

```json
{
  "tool": "devsteps-metrics",
  "arguments": {
    "format": "prometheus"  // or "json" for JSON format
  }
}
```

### Example Prometheus Format Output

```
# HELP mcp_tool_requests_total Total number of MCP tool requests
# TYPE mcp_tool_requests_total counter
mcp_tool_requests_total{tool="devsteps-add",status="success",service="devsteps-mcp-server",version="0.1.0"} 42
mcp_tool_requests_total{tool="devsteps-list",status="success",service="devsteps-mcp-server",version="0.1.0"} 15

# HELP mcp_tool_duration_seconds Duration of MCP tool executions in seconds
# TYPE mcp_tool_duration_seconds histogram
mcp_tool_duration_seconds_bucket{le="0.01",tool="devsteps-add"} 5
mcp_tool_duration_seconds_bucket{le="0.05",tool="devsteps-add"} 30
mcp_tool_duration_seconds_bucket{le="+Inf",tool="devsteps-add"} 42
mcp_tool_duration_seconds_sum{tool="devsteps-add"} 2.5
mcp_tool_duration_seconds_count{tool="devsteps-add"} 42

# HELP mcp_memory_bytes Memory usage in bytes
# TYPE mcp_memory_bytes gauge
mcp_memory_bytes{type="heap_used",service="devsteps-mcp-server"} 45678912
mcp_memory_bytes{type="rss",service="devsteps-mcp-server"} 78912345
```

## Integration Patterns

### Docker + Prometheus

**Dockerfile** (metrics collection):
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install --prod
RUN pnpm build

# Expose metrics endpoint (if using HTTP server)
EXPOSE 9090

CMD ["node", "dist/index.js"]
```

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'devsteps-mcp-server'
    static_configs:
      - targets: ['mcp-server:9090']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '([^:]+):.*'
        replacement: '${1}'
```

### Kubernetes ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: devsteps-mcp-server
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: devsteps-mcp-server
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

### Grafana Dashboard

Example queries for key metrics:

**Request Rate**:
```promql
rate(mcp_tool_requests_total[5m])
```

**Error Rate**:
```promql
rate(mcp_tool_requests_total{status="error"}[5m]) 
  / 
rate(mcp_tool_requests_total[5m])
```

**P95 Latency**:
```promql
histogram_quantile(0.95, 
  rate(mcp_tool_duration_seconds_bucket[5m])
)
```

**Memory Usage**:
```promql
mcp_memory_bytes{type="heap_used"} / 1024 / 1024
```

## Alerting Rules

### Critical Alerts

**High Error Rate**:
```yaml
- alert: HighErrorRate
  expr: |
    rate(mcp_tool_requests_total{status="error"}[5m]) 
    / 
    rate(mcp_tool_requests_total[5m]) > 0.05
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "MCP server error rate above 5%"
    description: "Error rate is {{ $value | humanizePercentage }}"
```

**High Latency**:
```yaml
- alert: HighLatency
  expr: |
    histogram_quantile(0.95, 
      rate(mcp_tool_duration_seconds_bucket[5m])
    ) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "MCP server P95 latency above 1s"
    description: "P95 latency is {{ $value }}s"
```

**Memory Leak**:
```yaml
- alert: MemoryLeak
  expr: |
    rate(mcp_memory_bytes{type="heap_used"}[1h]) > 0
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Potential memory leak detected"
    description: "Memory usage growing: {{ $value | humanize1024 }}B/s"
```

## OpenTelemetry Integration

For distributed tracing, consider integrating OpenTelemetry:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new NodeSDK({
  metricReader: new PrometheusExporter({ port: 9090 }),
  serviceName: 'devsteps-mcp-server',
});

sdk.start();
```

## Best Practices

### 1. **Cardinality Management**
- Avoid high-cardinality labels (user IDs, timestamps)
- Use tool name and status only for request metrics
- Aggregate detailed data at collection time

### 2. **Retention Policies**
- Short-term (15s): Raw metrics for real-time monitoring
- Medium-term (1h): Downsampled for dashboards
- Long-term (7d+): Aggregated for capacity planning

### 3. **SLO Tracking**
Define Service Level Objectives:
- **Availability**: 99.9% uptime (error rate < 0.1%)
- **Latency**: P95 < 500ms, P99 < 1s
- **Throughput**: Min 100 req/s per instance

### 4. **Dashboard Organization**
- **Overview**: Error rate, latency, throughput
- **Tool Details**: Per-tool metrics and trends
- **Resources**: Memory, connections, uptime
- **Errors**: Error breakdown, error logs

### 5. **Alert Fatigue Prevention**
- Use appropriate thresholds (2-5x normal variance)
- Add `for` duration to prevent flapping
- Group related alerts
- Include actionable context in annotations

## Performance Impact

Metrics collection overhead:
- **Memory**: ~2-5MB per 1000 unique metric series
- **CPU**: < 1% overhead with 15s scrape interval
- **Latency**: < 1ms per request for metric recording

## Troubleshooting

**Metrics Not Updating**:
- Check if prom-client is installed: `pnpm list prom-client`
- Verify metrics handler is registered: check logs for "Tools registered"
- Test metrics endpoint: call `devsteps-metrics` tool

**High Memory Usage**:
- Check metric cardinality: `await getMetricsJSON()` and count series
- Implement label filtering to reduce high-cardinality metrics
- Set max cardinality limits: `register.setDefaultLabels({ maxLabels: 10 })`

**Missing Metrics**:
- Ensure intervals are running: check `setInterval` calls
- Verify metric registration: `register.getMetricsAsJSON()`
- Check for metric name conflicts

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
