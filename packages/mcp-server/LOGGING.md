# Logging Documentation

## Overview

The MCP server uses [Pino](https://getpino.io/) for structured, high-performance logging. This implementation follows production best practices for 2025:

- ✅ No console.* usage (prevents stdio corruption)
- ✅ Structured JSON logs in production
- ✅ Pretty-printed logs in development
- ✅ Automatic sensitive data redaction
- ✅ Request-scoped logging with correlation IDs
- ✅ Performance tracking (duration_ms)

## Log Levels

```
fatal  (60) - Service stopping or unusable
error  (50) - Request failed, service continues
warn   (40) - Should be investigated by operator
info   (30) - Regular operation details
debug  (20) - Detailed debug information
trace  (10) - Very detailed traces
```

**Default Levels:**
- Development: `debug`
- Production: `info`

## Configuration

### Environment Variables

```bash
# Set log level
export LOG_LEVEL=debug

# Enable development mode (pretty printing)
export NODE_ENV=development

# Production mode (JSON output)
export NODE_ENV=production
```

### npm Scripts

```bash
# Normal startup (info level)
pnpm start

# Debug mode
pnpm start:debug

# Trace mode (very verbose)
pnpm start:trace
```

## Log Structure

### Startup Log
```json
{
  "level": 30,
  "time": 1700000000000,
  "service": "devsteps-mcp-server",
  "version": "0.1.0",
  "tool_count": 13,
  "msg": "Tools registered successfully"
}
```

### Request Log (Success)
```json
{
  "level": 30,
  "time": 1700000000000,
  "service": "devsteps-mcp-server",
  "version": "0.1.0",
  "request_id": "req_1700000000000",
  "tool_name": "devsteps-status",
  "duration_ms": 42,
  "status": "success",
  "msg": "Tool executed successfully"
}
```

### Request Log (Error)
```json
{
  "level": 50,
  "time": 1700000000000,
  "service": "devsteps-mcp-server",
  "version": "0.1.0",
  "request_id": "req_1700000000000",
  "tool_name": "devsteps-add",
  "duration_ms": 15,
  "status": "error",
  "error": {
    "message": "Invalid input: missing required field 'title'",
    "name": "ValidationError",
    "stack": "..."
  },
  "msg": "Tool execution failed"
}
```

## Sensitive Data Redaction

The following fields are automatically redacted:

- `*.token`
- `*.password`
- `*.api_key`
- `*.apiKey`
- `*.secret`
- `*.authorization`
- `req.headers.authorization`

Example:
```javascript
logger.info({
  user: 'john@example.com',
  api_key: 'secret123'  // This will be [Redacted]
});
```

## Usage in Code

### Basic Logging

```typescript
import { logger } from './logger.js';

// Info level
logger.info('Server started');

// With structured data
logger.info({ port: 8000, host: 'localhost' }, 'Server listening');

// Error with stack trace
try {
  // ...
} catch (error) {
  logger.error({ error }, 'Operation failed');
}
```

### Request-Scoped Logging

```typescript
import { createRequestLogger } from './logger.js';

// Create request-specific logger
const requestLogger = createRequestLogger('req_12345', 'devsteps-status');

// All logs will include request_id and tool_name
requestLogger.debug({ args }, 'Processing request');
requestLogger.info({ duration_ms: 42 }, 'Request completed');
```

## Why Not console.log?

**CRITICAL:** stdio-based MCP servers must NEVER use console methods!

```typescript
// ❌ WRONG - Corrupts JSON-RPC protocol
console.log('Server started');
console.error('Error occurred');

// ✅ CORRECT - Logs to proper channels
logger.info('Server started');
logger.error({ error }, 'Error occurred');
```

**Reason:** MCP uses stdio (stdin/stdout) for JSON-RPC communication. Any output to stdout/stderr breaks the protocol. Pino automatically routes logs to appropriate channels that don't interfere with MCP communication.

## Production Deployment

### Docker Logging

```dockerfile
# Logs to stdout in JSON format
CMD ["node", "dist/index.js"]
```

Logs are captured by Docker and can be viewed with:
```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow
```

### Kubernetes Logging

Deploy with proper logging configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mcp-server
spec:
  containers:
  - name: mcp-server
    image: devsteps-mcp:latest
    env:
    - name: LOG_LEVEL
      value: "info"
    - name: NODE_ENV
      value: "production"
```

View logs:
```bash
kubectl logs mcp-server
kubectl logs -f mcp-server  # Follow
```

### Log Aggregation

JSON logs integrate seamlessly with:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **Datadog**
- **CloudWatch**
- **Splunk**

Example Logstash filter:
```ruby
filter {
  json {
    source => "message"
  }
  date {
    match => [ "time", "UNIX_MS" ]
  }
}
```

## Monitoring & Alerting

### Key Metrics to Monitor

From logs, extract:
- Error rate: `level >= 50`
- Request duration: `duration_ms` percentiles (p50, p95, p99)
- Tool usage: `tool_name` frequency
- Request status: `status` distribution

### Alert Examples

**High Error Rate:**
```
Sum(level >= 50) / Total_Requests > 0.05  # 5% error rate
```

**Slow Requests:**
```
p95(duration_ms) > 1000  # 1 second p95 latency
```

## Performance

Pino is designed for high performance:
- **~2-3x faster** than Winston
- **~30x faster** than Bunyan
- Minimal CPU overhead
- Asynchronous I/O
- Zero dependencies in production mode

Benchmark (ops/sec):
```
pino        47,000+
winston      8,000+
bunyan       5,000+
```

## Best Practices

1. **Use structured logging:** Pass objects, not strings
   ```typescript
   // ✅ Good
   logger.info({ user_id: 123, action: 'login' }, 'User logged in');
   
   // ❌ Bad
   logger.info('User 123 logged in with action login');
   ```

2. **Include context:** Request IDs, tool names, durations
   ```typescript
   const requestLogger = createRequestLogger(requestId, toolName);
   requestLogger.info({ duration_ms: 42 }, 'Completed');
   ```

3. **Log errors properly:** Include full error object
   ```typescript
   // ✅ Good
   logger.error({ error }, 'Failed to process');
   
   // ❌ Bad
   logger.error(`Error: ${error.message}`);
   ```

4. **Choose appropriate levels:**
   - `fatal`: Server crash
   - `error`: Request failed
   - `warn`: Suspicious but not failing
   - `info`: Normal operations
   - `debug`: Diagnostic information
   - `trace`: Very detailed traces

5. **Don't log in hot paths:** Cache frequently accessed data

## Troubleshooting

### Logs not appearing?

Check LOG_LEVEL:
```bash
LOG_LEVEL=debug node dist/index.js
```

### Pretty printing not working?

Ensure NODE_ENV is set:
```bash
NODE_ENV=development node dist/index.js
```

### Logs corrupting MCP?

Verify no console.* calls remain:
```bash
grep -r "console\." packages/mcp-server/src/
```

## References

- [Pino Documentation](https://getpino.io/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices)
- [Production Logging Guide](https://skywork.ai/blog/mcp-server-enhance-prompt-best-practices-2025/)
