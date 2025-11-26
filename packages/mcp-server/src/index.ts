#!/usr/bin/env node
import { Command } from 'commander';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { trackRequestError, trackRequestSuccess } from './handlers/health.js';
import { configureLogger, createRequestLogger, getLogger } from './logger.js';
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
  searchTool,
  statusTool,
  traceTool,
  updateTool,
} from './tools/index.js';

/**
 * CLI Options interface
 */
interface CliOptions {
  logLevel: string;
  heartbeatInterval: string;
  logFile?: string;
}

/**
 * Setup heartbeat monitoring
 */
function setupHeartbeat(intervalSeconds: number) {
  setInterval(() => {
    const logger = getLogger();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    logger.info(
      {
        uptime_seconds: Math.floor(uptime),
        memory_mb: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heap_used: Math.round(memory.heapUsed / 1024 / 1024),
          heap_total: Math.round(memory.heapTotal / 1024 / 1024),
        },
      },
      '💓 Server heartbeat'
    );
  }, intervalSeconds * 1000);
}

/**
 * Generate one-line command summary for logging
 */
function generateToolSummary(toolName: string, args: any, result: any, duration: number): string {
  const durationStr = `(${duration}ms)`;

  switch (toolName) {
    case 'add':
      return `[add] Created ${result.itemId}: "${args.title}" → success ${durationStr}`;

    case 'update':
      const changes = Object.keys(args).filter((k) => k !== 'id');
      return `[update] ${args.id} [${changes.join(', ')}] → success ${durationStr}`;

    case 'get':
      return `[get] ${args.id} → success ${durationStr}`;

    case 'search':
      const count = result.count || result.items?.length || 0;
      return `[search] "${args.query}" → ${count} results ${durationStr}`;

    case 'list':
      const itemCount = result.count || result.items?.length || 0;
      const filters = [];
      if (args.status) filters.push(`status=${args.status}`);
      if (args.type) filters.push(`type=${args.type}`);
      if (args.priority) filters.push(`priority=${args.priority}`);
      const filterStr = filters.length > 0 ? ` [${filters.join(', ')}]` : '';
      return `[list]${filterStr} → ${itemCount} items ${durationStr}`;

    case 'link':
      return `[link] ${args.source_id} --${args.relation_type}--> ${args.target_id} → success ${durationStr}`;

    case 'status':
      const total = result.stats?.total || 0;
      return `[status] → ${total} items ${durationStr}`;

    case 'trace':
      return `[trace] ${args.id} → traced ${durationStr}`;

    case 'archive':
      return `[archive] ${args.id} → archived ${durationStr}`;

    case 'purge':
      const purgeCount = result.count || 0;
      return `[purge] → ${purgeCount} items archived ${durationStr}`;

    case 'init':
      return `[init] "${args.project_name}" → initialized ${durationStr}`;

    case 'export':
      return `[export] format=${args.format} → exported ${durationStr}`;

    case 'context':
      const level = args.level || 'quick';
      return `[context] level=${level} → generated ${durationStr}`;

    case 'health':
      return `[health] → ${result.status} ${durationStr}`;

    case 'metrics':
      return `[metrics] → collected ${durationStr}`;

    default:
      return `[${toolName}] → success ${durationStr}`;
  }
}

/**
 * DevSteps MCP Server
 * Provides AI-powered task tracking for developers
 */
class DevStepsServer {
  private server: Server;
  private tools: Map<string, Tool>;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();

    // Log initialization
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
      {
        name: 'mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = new Map();
    this.setupTools();
    this.setupHandlers();
  }

  private setupTools() {
    const tools = [
      initTool,
      addTool,
      getTool,
      listTool,
      updateTool,
      linkTool,
      searchTool,
      statusTool,
      traceTool,
      exportTool,
      archiveTool,
      purgeTool,
      contextTool,
      healthCheckTool,
      metricsTool,
    ];

    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }

    const logger = getLogger();
    logger.info(
      {
        tool_count: tools.length,
        tool_names: tools.map((t) => t.name),
      },
      '✅ Tools registered'
    );
  }

  private setupHandlers() {
    // Register graceful shutdown handlers
    registerShutdownHandlers();

    // Set up request handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const logger = getLogger();
      logger.info({ tool_count: this.tools.size }, 'Listing available tools');
      return {
        tools: Array.from(this.tools.values()),
      };
    });

    // Handle tool calls
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
        // Note: esbuild warns about empty-glob (suppressed in esbuild.cjs)
        // This is intentional - handlers are resolved at runtime, not build-time
        const handler = await import(`./handlers/${toolName}.js`);
        const handlerFn = handler.default || handler[`${toolName.replace('', '')}Handler`];

        // Track operation for graceful shutdown
        const operation = handlerFn(request.params.arguments);
        const result = await shutdownManager.trackOperation(operation);

        const duration = Date.now() - startTime;

        // Track metrics
        trackRequestSuccess(duration);
        recordSuccess(toolName, duration); // Prometheus metrics

        requestLogger.info(
          {
            duration_ms: duration,
            status: 'success',
          },
          'Tool executed successfully'
        );

        // Log one-line command summary
        const summary = generateToolSummary(toolName, request.params.arguments, result, duration);
        requestLogger.info(summary);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const duration = Date.now() - startTime;

        // Track error metrics
        trackRequestError(duration);
        const errorType = error instanceof Error ? error.name : 'UnknownError';
        recordError(toolName, duration, errorType); // Prometheus metrics

        requestLogger.error(
          {
            duration_ms: duration,
            status: 'error',
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                  }
                : error,
          },
          'Tool execution failed'
        );
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Track active connection
    activeConnections.inc();

    // Log connection established
    const logger = getLogger();
    logger.info(
      {
        transport: 'stdio',
        pid: process.pid,
        uptime_ms: Math.floor(process.uptime() * 1000),
      },
      '🔌 MCP server connected'
    );

    // Log ready state with startup duration
    const startupDuration = Date.now() - this.startTime;
    logger.info(
      {
        startup_duration_ms: startupDuration,
      },
      '✨ MCP server ready to accept requests'
    );
  }
}

// Parse CLI options
const program = new Command();
program
  .name('mcp-server')
  .description('MCP server for DevSteps task tracking')
  .version('0.1.0')
  .option('--log-level <level>', 'Log level: debug|info|warn|error', 'info')
  .option('--heartbeat-interval <seconds>', 'Health heartbeat interval (0=disabled)', '0')
  .option('--log-file <path>', 'Log file path (default: stderr)')
  .parse();

const opts = program.opts<CliOptions>();

// Configure logger with CLI options
configureLogger({
  level: opts.logLevel,
  file: opts.logFile,
});

// Setup heartbeat if enabled
const heartbeatInterval = Number.parseInt(opts.heartbeatInterval, 10);
if (heartbeatInterval > 0) {
  setupHeartbeat(heartbeatInterval);
  getLogger().info({ interval_seconds: heartbeatInterval }, 'Heartbeat monitoring enabled');
}

// Start the server based on transport mode
const transport = process.env.MCP_TRANSPORT || 'stdio';

if (transport === 'http') {
  // HTTP transport for Docker/production deployment
  const { startHttpMcpServer } = await import('./http-server.js');
  const port = Number(process.env.MCP_PORT) || 3100;
  
  try {
    const httpServer = await startHttpMcpServer(port);
    getLogger().info({ url: httpServer.url, transport: 'http' }, 'MCP server started in HTTP mode');
    
    // Register shutdown handlers to clean up HTTP server
    registerShutdownHandlers();
    
    // Add HTTP server cleanup to shutdown manager
    shutdownManager.trackOperation(
      new Promise<void>((resolve) => {
        process.once('SIGTERM', async () => {
          await httpServer.close();
          resolve();
        });
        process.once('SIGINT', async () => {
          await httpServer.close();
          resolve();
        });
      })
    );
  } catch (error) {
    getLogger().fatal({ error, transport: 'http', port }, 'Failed to start HTTP server');
    process.exit(1);
  }
} else {
  // STDIO transport for local development
  const server = new DevStepsServer();
  server.run().catch((error) => {
    getLogger().fatal({ error, transport: 'stdio' }, 'Fatal server error');
    process.exit(1);
  });
}
