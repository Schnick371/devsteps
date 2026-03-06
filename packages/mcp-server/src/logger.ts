/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Pino logger configuration
 * Configures structured JSON logging with optional file transport.
 */

import type { Logger } from 'pino';
import pino from 'pino';

let loggerInstance: Logger;

/**
 * Configure logger with options
 */
export function configureLogger(options: { level?: string; file?: string } = {}): Logger {
  const level =
    options.level ||
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

  const config: pino.LoggerOptions = {
    level,

    // Always use JSON output when running as MCP server (no pretty print)
    // VS Code MCP can't parse ANSI color codes from pino-pretty
    transport: options.file
      ? {
          target: 'pino/file',
          options: { destination: options.file },
        }
      : undefined,

    // Redact sensitive data
    redact: {
      paths: [
        '*.token',
        '*.password',
        '*.api_key',
        '*.apiKey',
        '*.secret',
        '*.authorization',
        'req.headers.authorization',
      ],
      remove: true,
    },

    // Base fields for all log entries
    base: {
      service: 'devsteps-mcp-server',
      version: '0.1.0',
    },

    // Serialize errors properly
    serializers: {
      error: pino.stdSerializers.err,
    },
  };

  loggerInstance = pino(config);
  return loggerInstance;
}

/**
 * Get or create logger instance
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = configureLogger();
  }
  return loggerInstance;
}

// Default logger instance
export const logger = getLogger();

/**
 * Creates a child logger with request-specific context
 */
export function createRequestLogger(requestId: string, toolName?: string) {
  return logger.child({
    request_id: requestId,
    tool_name: toolName,
  });
}

/**
 * Creates a child logger scoped to a coord dispatch context.
 *
 * The dispatchId is provided by coord (Ring 0) as a tool argument —
 * it is NEVER auto-generated server-side.
 *
 * Pass an optional `parent` logger (e.g. a requestLogger) to combine
 * dispatch_id with request_id + tool_name in a single log entry.
 * Without a parent, creates a child of the module-level base logger.
 *
 * Follows the devsteps.* namespace design (not OpenTelemetry).
 *
 * @example
 *   // Standalone dispatch logger (dispatch_id only):
 *   const log = createDispatchLogger(args.dispatch_id);
 *
 *   // Combined with request context:
 *   const requestLog = createRequestLogger(requestId, toolName);
 *   const log = createDispatchLogger(args.dispatch_id, requestLog);
 */
export function createDispatchLogger(dispatchId?: string, parent?: Logger): Logger {
  const base = parent ?? logger;
  return base.child(dispatchId ? { dispatch_id: dispatchId } : {});
}

/**
 * Log levels:
 * - fatal: The service is going to stop or become unusable
 * - error: Fatal for a particular request, but the service continues
 * - warn: A note on something that should probably be looked at by an operator
 * - info: Detail on regular operation
 * - debug: Anything else, i.e. too verbose to be included in info
 * - trace: Very detailed debug information
 */
