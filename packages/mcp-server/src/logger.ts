import pino from 'pino';
import type { Logger } from 'pino';

let loggerInstance: Logger;

/**
 * Configure logger with options
 */
export function configureLogger(options: { level?: string; file?: string } = {}): Logger {
  const level = options.level || process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

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
      service: 'devcrumbs-mcp-server',
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
 * Log levels:
 * - fatal: The service is going to stop or become unusable
 * - error: Fatal for a particular request, but the service continues
 * - warn: A note on something that should probably be looked at by an operator
 * - info: Detail on regular operation
 * - debug: Anything else, i.e. too verbose to be included in info
 * - trace: Very detailed debug information
 */
