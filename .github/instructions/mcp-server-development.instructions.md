---
applyTo: "packages/mcp-server/**/*.ts"
description: "MCP server development best practices and architecture patterns"
---

# MCP Server Development Best Practices

## Core MCP Principles

Model Context Protocol (MCP) enables standardized AI-tool integration. Follow these principles for robust MCP server development.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Host (Claude, VS Code)           │
└─────────────────────────────────────────────────────────┘
                            │
                    JSON-RPC 2.0 over STDIO/SSE
                            │
┌─────────────────────────────────────────────────────────┐
│                     MCP Server                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Tools     │  │  Resources  │  │   Prompts   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## STDIO Transport Critical Rules

### NEVER Write to stdout

For STDIO-based servers, stdout corruption breaks the JSON-RPC protocol:

```typescript
// ❌ BAD - Corrupts JSON-RPC messages
console.log('Server started');
console.log('Processing request:', data);

// ✅ GOOD - Use stderr for logging
console.error('Server started');
process.stderr.write('Processing request\n');

// ✅ BEST - Use a dedicated logger
import { logger } from './logger';
logger.info('Server started'); // Writes to stderr or file
```

### Logger Configuration

```typescript
// logger.ts - Production-ready MCP logger
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      destination: 2, // stderr (fd 2)
      colorize: true,
    },
  },
  level: process.env.LOG_LEVEL || 'info',
});
```

## Tool Definition Best Practices

### Use Zod for Schema Validation

```typescript
import { z } from 'zod';

// Define input schema with Zod
const AddItemInput = z.object({
  type: z.enum(['epic', 'story', 'task', 'bug']),
  title: z.string().max(200),
  description: z.string().optional(),
  priority: z.enum([
    'urgent-important',
    'not-urgent-important',
    'urgent-not-important',
    'not-urgent-not-important',
  ]).optional(),
});

// Register tool with schema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'devsteps_add') {
    const parsed = AddItemInput.safeParse(args);
    if (!parsed.success) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Validation error: ${parsed.error.message}` }],
      };
    }
    // Process validated input...
  }
});
```

### Tool Design Principles

```typescript
// ✅ GOOD - Single responsibility, clear naming
{
  name: 'devsteps_add',
  description: 'Add a new work item to the DevSteps project',
  inputSchema: { /* Zod schema converted to JSON Schema */ },
}

// ❌ BAD - Too generic, unclear purpose
{
  name: 'do_action',
  description: 'Do something with items',
}
```

**Tool Naming:**
- Use snake_case for tool names
- Prefix with namespace (e.g., `devsteps_`)
- Use clear verbs: `add`, `get`, `list`, `update`, `delete`, `search`

**Tool Annotations:**
```typescript
// Hint at tool behavior for safety
{
  name: 'devsteps_archive',
  annotations: {
    destructiveHint: true,  // Indicates data modification
    readOnlyHint: false,
  },
}
```

## Resource Management

### URI Design

```typescript
// ✅ GOOD - Hierarchical, RESTful URIs
'devsteps://items/STORY-042'
'devsteps://items/STORY-042/description'
'devsteps://config/methodology'

// ❌ BAD - Flat, unclear structure
'devsteps://get-item-42'
'devsteps://stuff'
```

### Dynamic Resource Discovery

```typescript
// Notify clients when resources change
await server.notification({
  method: 'notifications/resources/list_changed',
});
```

## Error Handling

### Structured Error Responses

```typescript
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk';

class DevStepsError extends McpError {
  constructor(
    code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(code, message);
  }
}

// Usage in tool handler
try {
  const result = await processItem(input);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  if (error instanceof DevStepsError) {
    return {
      isError: true,
      content: [{ type: 'text', text: error.message }],
    };
  }
  // Log unexpected errors
  logger.error({ error }, 'Unexpected error in tool handler');
  throw new McpError(ErrorCode.InternalError, 'An unexpected error occurred');
}
```

### Error Codes

| Code | When to Use |
|------|-------------|
| `InvalidRequest` | Malformed request structure |
| `InvalidParams` | Schema validation failure |
| `MethodNotFound` | Unknown tool/resource |
| `InternalError` | Server-side failures |

## Security Best Practices

### Path Traversal Prevention

```typescript
import path from 'node:path';

function validatePath(requestedPath: string, allowedRoot: string): string {
  const normalized = path.normalize(requestedPath);
  const resolved = path.resolve(allowedRoot, normalized);
  
  // Ensure path stays within allowed directory
  if (!resolved.startsWith(path.resolve(allowedRoot))) {
    throw new DevStepsError(
      ErrorCode.InvalidParams,
      'Path traversal detected'
    );
  }
  
  return resolved;
}
```

### Input Sanitization

```typescript
// Always validate and sanitize user input
function sanitizeItemId(id: string): string {
  // Only allow valid ID patterns
  const pattern = /^(EPIC|STORY|TASK|BUG|SPIKE|TEST|REQ|FEAT)-\d+$/;
  if (!pattern.test(id)) {
    throw new DevStepsError(
      ErrorCode.InvalidParams,
      `Invalid item ID format: ${id}`
    );
  }
  return id;
}
```

### Environment Variable Security

```typescript
// Never expose sensitive config
const config = {
  workspacePath: process.env.DEVSTEPS_WORKSPACE || process.cwd(),
  logLevel: process.env.LOG_LEVEL || 'info',
  // ❌ Never log or expose secrets
  // apiKey: process.env.API_KEY,
};
```

## Performance Optimization

### Caching Strategies

```typescript
import { LRUCache } from 'lru-cache';

const itemCache = new LRUCache<string, Item>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

async function getItem(id: string): Promise<Item> {
  const cached = itemCache.get(id);
  if (cached) return cached;
  
  const item = await loadItemFromDisk(id);
  itemCache.set(id, item);
  return item;
}

// Invalidate on mutations
async function updateItem(id: string, data: Partial<Item>): Promise<void> {
  await saveItemToDisk(id, data);
  itemCache.delete(id);
}
```

### Async Operations

```typescript
// ✅ Parallel processing when possible
const [items, config] = await Promise.all([
  loadItems(),
  loadConfig(),
]);

// ✅ Batch operations
async function listItems(filter: Filter): Promise<Item[]> {
  const ids = await getMatchingIds(filter);
  const items = await Promise.all(
    ids.slice(0, 100).map(id => getItem(id)) // Limit batch size
  );
  return items;
}
```

## Testing MCP Servers

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { handleAddItem } from './handlers/add';

describe('devsteps_add handler', () => {
  it('should create item with valid input', async () => {
    const result = await handleAddItem({
      type: 'story',
      title: 'Test story',
    });
    
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('STORY-');
  });
  
  it('should reject invalid item type', async () => {
    const result = await handleAddItem({
      type: 'invalid',
      title: 'Test',
    });
    
    expect(result.isError).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

describe('MCP Server Integration', () => {
  let client: Client;
  
  beforeAll(async () => {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['./dist/index.js'],
    });
    client = new Client({ name: 'test', version: '1.0' }, {});
    await client.connect(transport);
  });
  
  afterAll(async () => {
    await client.close();
  });
  
  it('should list available tools', async () => {
    const result = await client.listTools();
    expect(result.tools).toContainEqual(
      expect.objectContaining({ name: 'devsteps_list' })
    );
  });
});
```

## Graceful Shutdown

```typescript
// shutdown.ts
const shutdownHandlers: (() => Promise<void>)[] = [];

export function registerShutdownHandler(handler: () => Promise<void>): void {
  shutdownHandlers.push(handler);
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down gracefully');
  
  for (const handler of shutdownHandlers) {
    try {
      await handler();
    } catch (error) {
      logger.error({ error }, 'Shutdown handler failed');
    }
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

## Metrics and Observability

```typescript
// metrics.ts
import { Counter, Histogram } from 'prom-client';

export const toolCalls = new Counter({
  name: 'mcp_tool_calls_total',
  help: 'Total number of tool calls',
  labelNames: ['tool', 'status'],
});

export const toolDuration = new Histogram({
  name: 'mcp_tool_duration_seconds',
  help: 'Tool call duration in seconds',
  labelNames: ['tool'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

// Usage in handler
const end = toolDuration.startTimer({ tool: 'devsteps_add' });
try {
  const result = await handleAddItem(args);
  toolCalls.inc({ tool: 'devsteps_add', status: 'success' });
  return result;
} catch (error) {
  toolCalls.inc({ tool: 'devsteps_add', status: 'error' });
  throw error;
} finally {
  end();
}
```

---

**See:** [MCP Specification](https://modelcontextprotocol.io), [LOGGING.md](../../packages/mcp-server/LOGGING.md), [METRICS.md](../../packages/mcp-server/METRICS.md)
