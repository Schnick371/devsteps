/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * HTTP Server for MCP - Simplified implementation
 * Reuses existing DevStepsServer from index.ts with HTTP wrapper
 */

import type { Request, Response } from 'express';
import packageJson from '../package.json' with { type: 'json' };
import { logger } from './logger.js';

// We'll import the DevStepsServer class after refactoring index.ts
// For now, create a minimal HTTP wrapper

interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
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
  port: number = Number(process.env.MCP_PORT) || 3100,
  workspacePath: string = process.cwd()
): Promise<{ url: string; close: () => Promise<void> }> {
  // Set workspace for in-process mode (used by getWorkspacePath() in handlers)
  process.env.DEVSTEPS_WORKSPACE = workspacePath;

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
  const unlinkHandler = (await import('./handlers/unlink.js')).default;
  const archiveHandler = (await import('./handlers/archive.js')).default;
  const exportHandler = (await import('./handlers/export.js')).default;
  const purgeHandler = (await import('./handlers/purge.js')).default;
  const traceHandler = (await import('./handlers/trace.js')).default;
  const contextHandler = (await import('./handlers/context.js')).default;
  const metricsHandler = (await import('./handlers/metrics.js')).default;
  const healthHandler = (await import('./handlers/health.js')).default;
  const updateCopilotFilesHandler = (await import('./handlers/update_copilot_files.js')).default;
  const docsImportHandler = (await import('./handlers/devsteps_docs_import.js')).default;
  const docsClassifyHandler = (await import('./handlers/devsteps_docs_classify.js')).default;
  const docsClassifyConfirmHandler = (await import('./handlers/devsteps_docs_classify_confirm.js'))
    .default;
  const docsBomStatusHandler = (await import('./handlers/devsteps_docs_bom_status.js')).default;
  const docsBomCommitHandler = (await import('./handlers/devsteps_docs_bom_commit.js')).default;
  const docsNewHandler = (await import('./handlers/devsteps_docs_new.js')).default;
  const docReadContentHandler = (await import('./handlers/devsteps_doc_read_content.js')).default;
  const writeAnalysisReportHandler = (await import('./handlers/write_analysis_report.js')).default;
  const readAnalysisEnvelopeHandler = (await import('./handlers/read_analysis_envelope.js'))
    .default;
  const writeVerdictHandler = (await import('./handlers/write_verdict.js')).default;
  const writeSprintBriefHandler = (await import('./handlers/write_sprint_brief.js')).default;
  const writeMandateResultHandler = (await import('./handlers/write_mandate_result.js')).default;
  const readMandateResultsHandler = (await import('./handlers/read_mandate_results.js')).default;
  const writeRejectionFeedbackHandler = (await import('./handlers/write_rejection_feedback.js'))
    .default;
  const writeIterationSignalHandler = (await import('./handlers/write_iteration_signal.js'))
    .default;
  const writeEscalationHandler = (await import('./handlers/write_escalation.js')).default;
  const writeDispatchManifestHandler = (await import('./handlers/write_dispatch_manifest.js'))
    .default;
  const patchDispatchManifestHandler = (await import('./handlers/patch_dispatch_manifest.js'))
    .default;

  // Map of tool name to handler (cast to expected type since handlers accept various args)
  // biome-ignore lint/suspicious/noExplicitAny: Handlers have varying argument types
  const toolHandlers = new Map<string, (args: any) => Promise<unknown>>([
    ['init', initHandler],
    ['add', addHandler],
    ['update', updateHandler],
    ['list', listHandler],
    ['get', getHandler],
    ['search', searchHandler],
    ['status', statusHandler],
    ['link', linkHandler],
    ['unlink', unlinkHandler],
    ['archive', archiveHandler],
    ['export', exportHandler],
    ['purge', purgeHandler],
    ['trace', traceHandler],
    ['context', contextHandler],
    ['metrics', metricsHandler],
    ['health-check', healthHandler],
    ['update_copilot_files', updateCopilotFilesHandler],
    ['devsteps_docs_import', docsImportHandler],
    ['devsteps_docs_classify', docsClassifyHandler],
    ['devsteps_docs_classify_confirm', docsClassifyConfirmHandler],
    ['devsteps_docs_bom_status', docsBomStatusHandler],
    ['devsteps_docs_bom_commit', docsBomCommitHandler],
    ['devsteps_docs_new', docsNewHandler],
    ['devsteps_doc_read_content', docReadContentHandler],
    ['write_analysis_report', writeAnalysisReportHandler],
    ['read_analysis_envelope', readAnalysisEnvelopeHandler],
    ['write_verdict', writeVerdictHandler],
    ['write_sprint_brief', writeSprintBriefHandler],
    ['write_mandate_result', writeMandateResultHandler],
    ['read_mandate_results', readMandateResultsHandler],
    ['write_rejection_feedback', writeRejectionFeedbackHandler],
    ['write_iteration_signal', writeIterationSignalHandler],
    ['write_escalation', writeEscalationHandler],
    ['write_dispatch_manifest', writeDispatchManifestHandler],
    ['patch_dispatch_manifest', patchDispatchManifestHandler],
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
    tools.unlinkTool,
    tools.archiveTool,
    tools.exportTool,
    tools.purgeTool,
    tools.traceTool,
    tools.contextTool,
    tools.metricsTool,
    tools.healthCheckTool,
    tools.updateCopilotFilesTool,
    tools.docsImportTool,
    tools.docsClassifyTool,
    tools.docsClassifyConfirmTool,
    tools.docsBomStatusTool,
    tools.docsBomCommitTool,
    tools.docsNewTool,
    tools.docReadContentTool,
    tools.writeAnalysisReportTool,
    tools.readAnalysisEnvelopeTool,
    tools.writeVerdictTool,
    tools.writeSprintBriefTool,
    tools.writeMandateResultTool,
    tools.readMandateResultsTool,
    tools.writeRejectionFeedbackTool,
    tools.writeIterationSignalTool,
    tools.writeEscalationTool,
    tools.writeDispatchManifestTool,
    tools.patchDispatchManifestTool,
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
              version: packageJson.version,
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
      version: packageJson.version,
      tools: allTools.length,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Start server - dynamic port if port=0
  let url = '';
  const httpServer = await new Promise<ReturnType<typeof app.listen>>((resolve, reject) => {
    const server = app.listen(port, 'localhost', () => {
      const addr = server.address() as { port: number };
      const actualPort = addr.port;
      url = `http://localhost:${actualPort}/mcp`;
      logger.info({ port: actualPort, tools: allTools.length }, '🌐 HTTP MCP server listening');
      resolve(server);
    });

    server.on('error', (error: Error) => {
      logger.error({ error, port }, 'Failed to start HTTP server');
      reject(error);
    });
  });

  return {
    url,
    close: async () => {
      delete process.env.DEVSTEPS_WORKSPACE;
      return new Promise((resolve) => {
        httpServer.close(() => {
          logger.info('HTTP MCP Server closed');
          resolve();
        });
      });
    },
  };
}
