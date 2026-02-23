/**
 * DevSteps MCP Server
 *
 * Main server class — handles tool registration and MCP protocol request routing.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../package.json' with { type: 'json' };
import { trackRequestError, trackRequestSuccess } from './handlers/health.js';
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
      { capabilities: { tools: {}, resources: {} } }
    );

    this.tools = new Map();
    this.setupTools();
    this.setupHandlers();
  }

  private setupTools() {
    const tools = [
      initTool, addTool, getTool, listTool, updateTool, linkTool, unlinkTool,
      searchTool, statusTool, traceTool, exportTool, archiveTool, purgeTool,
      contextTool, healthCheckTool, metricsTool,
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

        const devstepsDir = join(getWorkspacePath(), '.devsteps');
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
