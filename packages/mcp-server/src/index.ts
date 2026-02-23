#!/usr/bin/env node
/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Server Entry Point
 *
 * Parses CLI arguments, configures logging, runs auto-migration,
 * then starts the server in the appropriate transport mode.
 */

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import { configureLogger, getLogger } from './logger.js';
import { registerShutdownHandlers, shutdownManager } from './shutdown.js';
import { DevStepsServer } from './server.js';
import { setupHeartbeat } from './server-utils.js';

/**
 * CLI Options interface
 */
interface CliOptions {
  logLevel: string;
  heartbeatInterval: string;
  logFile?: string;
}

// Global unhandled rejection handler — prevents server crash on legitimate errors
process.on('unhandledRejection', (reason, promise) => {
  const logger = getLogger();
  logger.error(
    {
      reason: reason instanceof Error ? { message: reason.message, stack: reason.stack, name: reason.name } : reason,
      promise: String(promise),
    },
    '⚠️  Unhandled Promise Rejection - Server continues running'
  );
  // DO NOT exit — errors like "Project not initialized" should not crash the server
});

// Parse CLI options and workspace path argument
const program = new Command();
program
  .name('mcp-server')
  .description('MCP server for DevSteps task tracking')
  .version(packageJson.version)
  .argument('[workspace-path]', 'Workspace directory path (default: current directory)')
  .option('--log-level <level>', 'Log level: debug|info|warn|error', 'info')
  .option('--heartbeat-interval <seconds>', 'Health heartbeat interval (0=disabled)', '0')
  .option('--log-file <path>', 'Log file path (default: stderr)')
  .allowUnknownOption()
  .parse();

const opts = program.opts<CliOptions>();

// Configure logger with CLI options
configureLogger({ level: opts.logLevel, file: opts.logFile });

// Auto-migrate index if needed (before server starts)
try {
  const { join } = await import('node:path');
  const { existsSync } = await import('node:fs');
  const { ensureIndexMigrated } = await import('@schnick371/devsteps-shared');

  const workspaceArgs = program.args;
  const workspacePath = workspaceArgs.length > 0 ? workspaceArgs[0] : process.cwd();
  const devstepsDir = join(workspacePath, '.devsteps');

  if (existsSync(devstepsDir)) {
    await ensureIndexMigrated(devstepsDir, { silent: true });
  }
} catch (error) {
  getLogger().warn(
    { error: error instanceof Error ? error.message : String(error) },
    'Auto-migration check skipped'
  );
}

// Setup heartbeat monitoring if enabled
const heartbeatInterval = Number.parseInt(opts.heartbeatInterval, 10);
if (heartbeatInterval > 0) {
  setupHeartbeat(heartbeatInterval);
  getLogger().info({ interval_seconds: heartbeatInterval }, 'Heartbeat monitoring enabled');
}

// Start the server in the appropriate transport mode
const transport = process.env.MCP_TRANSPORT || 'stdio';

if (transport === 'http') {
  const { startHttpMcpServer } = await import('./http-server.js');
  const port = Number(process.env.MCP_PORT) || 3100;

  try {
    const httpServer = await startHttpMcpServer(port);
    getLogger().info({ url: httpServer.url, transport: 'http' }, 'MCP server started in HTTP mode');

    registerShutdownHandlers();
    shutdownManager.trackOperation(
      new Promise<void>((resolve) => {
        process.once('SIGTERM', async () => { await httpServer.close(); resolve(); });
        process.once('SIGINT', async () => { await httpServer.close(); resolve(); });
      })
    );
  } catch (error) {
    getLogger().fatal({ error, transport: 'http', port }, 'Failed to start HTTP server');
    process.exit(1);
  }
} else {
  const server = new DevStepsServer();
  server.run().catch((error) => {
    getLogger().fatal({ error, transport: 'stdio' }, 'Fatal server error');
    process.exit(1);
  });
}
