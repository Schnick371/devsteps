/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * DevSteps MCP Server
 *
 * Main server class — handles tool registration and MCP protocol request routing.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../package.json' with { type: 'json' };
import { trackRequestError, trackRequestSuccess } from './handlers/health.js';
import { getPromptHandler, listPromptsHandler } from './handlers/prompts.js';
import { createRequestLogger, getLogger } from './logger.js';
import { activeConnections, recordError, recordSuccess } from './metrics.js';
import { registerShutdownHandlers, shutdownManager } from './shutdown.js';
import {
  addTool,
  archiveTool,
  contextTool,
  exportTool,
  getTool,
  healthCheckTool,
  initTool,
  linkTool,
  listTool,
  metricsTool,
  purgeTool,
  readAnalysisEnvelopeTool,
  readMandateResultsTool,
  searchTool,
  statusTool,
  traceTool,
  unlinkTool,
  updateCopilotFilesTool,
  updateTool,
  writeAnalysisReportTool,
  writeEscalationTool,
  writeIterationSignalTool,
  writeMandateResultTool,
  writeRejectionFeedbackTool,
  writeSprintBriefTool,
  writeVerdictTool,
} from './tools/index.js';
import { type ToolResult, generateToolSummary } from './server-utils.js';

/**
 * DevSteps MCP Server — handles tool registration and request routing
 */
export class DevStepsServer {
  private server: Server;
  private tools: Map<string, Tool>;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();

    const logger = getLogger();
    logger.info(
      {
        pid: process.pid,
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      '🚀 MCP server initializing...'
    );

    this.server = new Server(
      { name: 'mcp-server', version: packageJson.version },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );

    this.tools = new Map();
    this.setupTools();
    this.setupHandlers();
  }

  private setupTools() {
    const tools = [
      initTool, addTool, getTool, listTool, updateTool, linkTool, unlinkTool,
      searchTool, statusTool, traceTool, exportTool, archiveTool, purgeTool,
      contextTool, healthCheckTool, metricsTool, updateCopilotFilesTool,
      // Context Budget Protocol (CBP) Tier-3 analysis tools (EPIC-027)
      writeAnalysisReportTool, readAnalysisEnvelopeTool, writeVerdictTool, writeSprintBriefTool,
      // Context Budget Protocol (CBP) Tier-2 mandate tools (EPIC-028)
      writeMandateResultTool, readMandateResultsTool, writeRejectionFeedbackTool,
      writeIterationSignalTool, writeEscalationTool,
    ];

    for (const tool of tools) { this.tools.set(tool.name, tool); }

    const logger = getLogger();
    logger.info({ tool_count: tools.length, tool_names: tools.map((t) => t.name) }, '✅ Tools registered');
  }

  private setupHandlers() {
    registerShutdownHandlers();

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const logger = getLogger();
      logger.info({ tool_count: this.tools.size }, 'Listing available tools');
      return { tools: Array.from(this.tools.values()) };
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const logger = getLogger();
      logger.info('Listing available resources');
      return {
        resources: [
          {
            uri: 'devsteps://project-context',
            name: 'DevSteps Project Context',
            description:
              'Current project overview: tech stack, active items, conventions, recent changes. ' +
              'High-priority resource — auto-fetched by supporting MCP clients at session start.',
            mimeType: 'text/plain',
            // MCP 2025-06-18 resource annotations — STORY-121 TASK-275
            annotations: {
              audience: ['assistant'],
              priority: 1.0,
            },
          },
          {
            uri: 'devsteps://docs/hierarchy',
            name: 'Hierarchy Rules',
            description: 'Work item hierarchy for Scrum (Epic→Story|Spike, Story→Bug→Task) and Waterfall (Requirement→Feature|Spike, Feature→Bug→Task) based on Jira 2025 standards',
            mimeType: 'text/markdown',
          },
          {
            uri: 'devsteps://docs/ai-guide',
            name: 'MCP Tools Usage Guide',
            description: 'Quick reference for Bug workflow, Spike workflow, link validation rules, and common mistakes',
            mimeType: 'text/markdown',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const logger = getLogger();
      const { uri } = request.params;
      logger.info({ uri }, 'Reading resource');

      try {
        const { readFileSync } = await import('node:fs');
        const { join } = await import('node:path');
        const { getWorkspacePath } = await import('./workspace.js');
        const { getQuickContext, formatContextAsText } = await import('@schnick371/devsteps-shared');

        const cwd = getWorkspacePath();
        const devstepsDir = join(cwd, '.devsteps');

        // STORY-121 TASK-275: high-priority project context resource for AI auto-fetch
        if (uri === 'devsteps://project-context') {
          const ctx = await getQuickContext(cwd, devstepsDir);
          const text = formatContextAsText(ctx);
          return { contents: [{ uri, mimeType: 'text/plain', text }] };
        }

        let content = '';
        if (uri === 'devsteps://docs/hierarchy') {
          content = readFileSync(join(devstepsDir, 'HIERARCHY-COMPACT.md'), 'utf-8');
        } else if (uri === 'devsteps://docs/ai-guide') {
          content = readFileSync(join(devstepsDir, 'AI-GUIDE-COMPACT.md'), 'utf-8');
        } else {
          throw new Error(`Unknown resource URI: ${uri}`);
        }

        return { contents: [{ uri, mimeType: 'text/markdown', text: content }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        getLogger().error({ uri, error: errorMessage }, 'Failed to read resource');
        throw error;
      }
    });

    // MCP Prompts capability — STORY-121 TASK-274
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      const logger = getLogger();
      logger.info('Listing available prompts');
      return listPromptsHandler();
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const logger = getLogger();
      const { name, arguments: promptArgs } = request.params;
      logger.info({ prompt_name: name }, 'Getting prompt');
      return getPromptHandler(name, promptArgs as Record<string, string> | undefined);
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const startTime = Date.now();
      const requestId = String(request.params._meta?.progressToken || `req_${Date.now()}`);
      const toolName = request.params.name;
      const requestLogger = createRequestLogger(requestId, toolName);

      requestLogger.debug({ arguments: request.params.arguments }, 'Tool invocation started');

      const tool = this.tools.get(toolName);
      if (!tool) {
        requestLogger.error({ tool_name: toolName }, 'Unknown tool requested');
        throw new Error(`Unknown tool: ${toolName}`);
      }

      try {
        // Dynamic import for modular handler architecture
        const handler = await import(`./handlers/${toolName}.js`);
        const handlerFn = handler.default || handler[`${toolName.replace('', '')}Handler`];
        const result = await shutdownManager.trackOperation(handlerFn(request.params.arguments));
        const duration = Date.now() - startTime;

        trackRequestSuccess(duration);
        recordSuccess(toolName, duration);
        requestLogger.info({ duration_ms: duration, status: 'success' }, 'Tool executed successfully');

        const summary = generateToolSummary(toolName, request.params.arguments ?? {}, result as ToolResult, duration);
        requestLogger.info(summary);

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const duration = Date.now() - startTime;
        trackRequestError(duration);
        recordError(toolName, duration, error instanceof Error ? error.name : 'UnknownError');

        requestLogger.error(
          {
            duration_ms: duration,
            status: 'error',
            error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
          },
          'Tool execution failed'
        );

        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, error: errorMessage }, null, 2) }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    activeConnections.inc();

    const logger = getLogger();
    logger.info({ transport: 'stdio', pid: process.pid, uptime_ms: Math.floor(process.uptime() * 1000) }, '🔌 MCP server connected');
    logger.info({ startup_duration_ms: Date.now() - this.startTime }, '✨ MCP server ready to accept requests');
  }
}
