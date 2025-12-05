/**
 * HTTP Server for MCP - Simplified implementation
 * Reuses existing DevStepsServer from index.ts with HTTP wrapper
 */

import type { Request, Response } from 'express';
import { logger } from './logger.js';

// We'll import the DevStepsServer class after refactoring index.ts
// For now, create a minimal HTTP wrapper

interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: Record<string, any>;
}

interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Simple HTTP MCP Server that wraps existing stdio-based server
 * 
 * This is a simplified approach that:
 * 1. Reuses all existing tool handlers
 * 2. Translates HTTP requests to MCP protocol
 * 3. Returns JSON-RPC responses
 * 
 * Production hardening:
 * - CORS restricted to localhost only
 * - Request timeout and body size limits
 * - Configurable port via MCP_PORT environment variable
 */
export async function startHttpMcpServer(
  port: number = Number(process.env.MCP_PORT) || 3100
): Promise<{ url: string; close: () => Promise<void> }> {
  const { default: express } = await import('express');
  
  const app = express();
  
  // Body parser with size limit
  app.use(express.json({ limit: '1mb' }));
  
  // Request timeout (30 seconds)
  app.use((_req: Request, res: Response, next: () => void) => {
    res.setTimeout(30000, () => {
      logger.warn('Request timeout');
      res.status(408).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Request timeout',
        },
      });
    });
    next();
  });

  // Import tool schemas and handlers
  const tools = await import('./tools/index.js');
  
  // Import handlers directly
  const initHandler = (await import('./handlers/init.js')).default;
  const addHandler = (await import('./handlers/add.js')).default;
  const updateHandler = (await import('./handlers/update.js')).default;
  const listHandler = (await import('./handlers/list.js')).default;
  const getHandler = (await import('./handlers/get.js')).default;
  const searchHandler = (await import('./handlers/search.js')).default;
  const statusHandler = (await import('./handlers/status.js')).default;
  const linkHandler = (await import('./handlers/link.js')).default;
  const archiveHandler = (await import('./handlers/archive.js')).default;
  const exportHandler = (await import('./handlers/export.js')).default;
  const purgeHandler = (await import('./handlers/purge.js')).default;
  const traceHandler = (await import('./handlers/trace.js')).default;
  const contextHandler = (await import('./handlers/context.js')).default;
  const metricsHandler = (await import('./handlers/metrics.js')).default;
  const healthHandler = (await import('./handlers/health.js')).default;

  // Map of tool name to handler
  const toolHandlers = new Map<string, (args: any) => Promise<any>>([
    ['init', initHandler],
    ['add', addHandler],
    ['update', updateHandler],
    ['list', listHandler],
    ['get', getHandler],
    ['search', searchHandler],
    ['status', statusHandler],
    ['link', linkHandler],
    ['archive', archiveHandler],
    ['export', exportHandler],
    ['purge', purgeHandler],
    ['trace', traceHandler],
    ['context', contextHandler],
    ['metrics', metricsHandler],
    ['health-check', healthHandler],
  ]);

  // All available tools
  const allTools = [
    tools.initTool,
    tools.addTool,
    tools.updateTool,
    tools.listTool,
    tools.getTool,
    tools.searchTool,
    tools.statusTool,
    tools.linkTool,
    tools.archiveTool,
    tools.exportTool,
    tools.purgeTool,
    tools.traceTool,
    tools.contextTool,
    tools.metricsTool,
    tools.healthCheckTool,
  ];

  /**
   * Handle MCP JSON-RPC requests over HTTP
   */
  async function handleMcpRequest(req: Request, res: Response): Promise<void> {
    try {
      const request = req.body as McpJsonRpcRequest;

      logger.debug({ method: request.method, id: request.id }, 'HTTP MCP request received');

      // Handle initialize request
      if (request.method === 'initialize') {
        const response: McpJsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'devsteps-mcp-server',
              version: '0.1.0',
            },
          },
        };
        res.json(response);
        return;
      }

      // Handle tools/list request
      if (request.method === 'tools/list') {
        const response: McpJsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: allTools,
          },
        };
        res.json(response);
        return;
      }

      // Handle tools/call request
      if (request.method === 'tools/call') {
        const toolName = request.params?.name;
        const toolArgs = request.params?.arguments || {};

        if (!toolName) {
          const response: McpJsonRpcResponse = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32602,
              message: 'Missing tool name',
            },
          };
          res.json(response);
          return;
        }

        const handler = toolHandlers.get(toolName);

        if (!handler) {
          const response: McpJsonRpcResponse = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Unknown tool: ${toolName}`,
            },
          };
          res.json(response);
          return;
        }

        try {
          const result = await handler(toolArgs);
          const response: McpJsonRpcResponse = {
            jsonrpc: '2.0',
            id: request.id,
            result,
          };
          res.json(response);
          logger.debug({ method: request.method, tool: toolName }, 'Tool executed successfully');
        } catch (error) {
          const response: McpJsonRpcResponse = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : String(error),
              data: error instanceof Error ? error.stack : undefined,
            },
          };
          res.json(response);
          logger.error({ error, tool: toolName }, 'Tool execution failed');
        }
        return;
      }

      // Handle notifications (no response needed)
      if (request.method.startsWith('notifications/')) {
        res.status(200).end();
        return;
      }

      // Unknown method
      const response: McpJsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown method: ${request.method}`,
        },
      };
      res.json(response);
    } catch (error) {
      logger.error({ error }, 'HTTP request processing error');
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
          data: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  // CORS headers - restricted to localhost for security
  app.use((req: Request, res: Response, next: () => void) => {
    const origin = req.headers.origin;
    
    // Only allow localhost origins
    if (
      origin &&
      (origin === 'http://localhost' ||
        origin.startsWith('http://localhost:') ||
        origin === 'http://127.0.0.1' ||
        origin.startsWith('http://127.0.0.1:'))
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    next();
  });

  // Handle OPTIONS preflight
  app.options('/mcp', (_req: Request, res: Response) => {
    res.status(200).end();
  });

  // MCP endpoint
  app.post('/mcp', handleMcpRequest);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'healthy',
      transport: 'http',
      version: '0.1.0',
      tools: allTools.length,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Start server
  const httpServer = await new Promise<any>((resolve, reject) => {
    const server = app.listen(port, () => {
      const url = `http://localhost:${port}/mcp`;
      logger.info({ url, port, tools: allTools.length }, 'HTTP MCP Server started');
      resolve(server);
    });

    server.on('error', (error: Error) => {
      logger.error({ error, port }, 'Failed to start HTTP server');
      reject(error);
    });
  });

  return {
    url: `http://localhost:${port}/mcp`,
    close: async () => {
      return new Promise((resolve) => {
        httpServer.close(() => {
          logger.info('HTTP MCP Server closed');
          resolve();
        });
      });
    },
  };
}
