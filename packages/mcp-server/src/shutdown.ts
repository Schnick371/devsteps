import { logger } from './logger.js';

/**
 * Graceful Shutdown Manager
 *
 * Handles SIGTERM and SIGINT signals to ensure clean server shutdown.
 * Implements a proper shutdown sequence with timeout protection.
 */
export class GracefulShutdownManager {
  private shutdownTimeout = 30000; // 30 seconds
  private isShuttingDown = false;
  private pendingOperations = new Set<Promise<unknown>>();

  /**
   * Register a pending operation to wait for during shutdown
   */
  trackOperation<T>(operation: Promise<T>): Promise<T> {
    this.pendingOperations.add(operation);
    operation.finally(() => {
      this.pendingOperations.delete(operation);
    });
    return operation;
  }

  /**
   * Initiate graceful shutdown sequence
   */
  async initiateShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn({ signal }, 'Shutdown already in progress, ignoring signal');
      return;
    }

    this.isShuttingDown = true;
    logger.info({ signal }, 'Initiating graceful shutdown');

    // Set timeout to force exit if shutdown takes too long
    const shutdownTimer = setTimeout(() => {
      logger.error(
        {
          signal,
          timeout_ms: this.shutdownTimeout,
          pending_operations: this.pendingOperations.size,
        },
        'Shutdown timeout exceeded, forcing exit'
      );
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // Wait for all pending operations to complete
      if (this.pendingOperations.size > 0) {
        logger.info(
          { pending_count: this.pendingOperations.size },
          'Waiting for pending operations to complete'
        );

        await Promise.all(Array.from(this.pendingOperations));

        logger.info('All pending operations completed');
      }

      // Flush logs before exit
      await this.flushLogs();

      clearTimeout(shutdownTimer);
      logger.info({ signal }, 'Graceful shutdown completed successfully');

      process.exit(0);
    } catch (error) {
      clearTimeout(shutdownTimer);
      logger.error(
        {
          signal,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : error,
        },
        'Error during graceful shutdown'
      );
      process.exit(1);
    }
  }

  /**
   * Flush pending log entries
   */
  private async flushLogs(): Promise<void> {
    return new Promise((resolve) => {
      // Pino flush (if available)
      if (typeof logger.flush === 'function') {
        logger.flush();
      }

      // Small delay to ensure logs are written
      setTimeout(resolve, 100);
    });
  }

  /**
   * Check if server is shutting down
   */
  isShutdown(): boolean {
    return this.isShuttingDown;
  }
}

/**
 * Global shutdown manager instance
 */
export const shutdownManager = new GracefulShutdownManager();

/**
 * Register signal handlers for graceful shutdown
 */
export function registerShutdownHandlers(): void {
  process.on('SIGTERM', () => {
    shutdownManager.initiateShutdown('SIGTERM').catch((error) => {
      logger.fatal({ error }, 'Fatal error during SIGTERM handling');
      process.exit(1);
    });
  });

  process.on('SIGINT', () => {
    shutdownManager.initiateShutdown('SIGINT').catch((error) => {
      logger.fatal({ error }, 'Fatal error during SIGINT handling');
      process.exit(1);
    });
  });

  logger.info('Shutdown handlers registered (SIGTERM, SIGINT)');
}
