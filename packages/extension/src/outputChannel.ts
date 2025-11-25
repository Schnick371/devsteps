/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 */

import * as vscode from 'vscode';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Centralized logging system for DevSteps extension
 * Provides structured logging with levels, timestamps, and automatic output channel management
 */
export class DevStepsLogger {
  private static instance: DevStepsLogger;
  private outputChannel: vscode.LogOutputChannel;
  private logLevel: LogLevel;

  private constructor() {
    // Use LogOutputChannel with log: true to make it appear in output dropdown
    this.outputChannel = vscode.window.createOutputChannel('DevSteps', { log: true });
    this.logLevel = this.getConfiguredLogLevel();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DevStepsLogger {
    if (!DevStepsLogger.instance) {
      DevStepsLogger.instance = new DevStepsLogger();
    }
    return DevStepsLogger.instance;
  }

  /**
   * Log error message (always shown, auto-displays output channel)
   */
  public error(message: string, error?: Error | unknown): void {
    this.log('ERROR', message, error);
    // Auto-show output on errors if configured
    const config = vscode.workspace.getConfiguration('devsteps');
    if (config.get<boolean>('logging.showOutputOnError', true)) {
      this.outputChannel.show(true);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, data);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, data);
    }
  }

  /**
   * Log debug message (most verbose)
   */
  public debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Show output channel
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Clear output channel
   */
  public clear(): void {
    this.outputChannel.clear();
    this.info('Output channel cleared');
  }

  /**
   * Update logging level from configuration
   */
  public updateLoggingLevel(): void {
    this.logLevel = this.getConfiguredLogLevel();
    this.info(`Logging level updated to: ${this.logLevel}`);
  }

  /**
   * Dispose output channel (called on extension deactivation)
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }

  /**
   * Core logging implementation
   */
  private log(level: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data !== undefined) {
      if (data instanceof Error) {
        logMessage += `\n  Error: ${data.message}`;
        if (data.stack) {
          logMessage += `\n  Stack:\n${data.stack.split('\n').map(line => `    ${line}`).join('\n')}`;
        }
      } else if (typeof data === 'object') {
        try {
          logMessage += `\n  Data: ${JSON.stringify(data, null, 2)}`;
        } catch {
          logMessage += `\n  Data: [Circular or non-serializable object]`;
        }
      } else {
        logMessage += `\n  Data: ${String(data)}`;
      }
    }

    this.outputChannel.appendLine(logMessage);
  }

  /**
   * Check if message should be logged based on configured level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Get logging level from VS Code configuration
   */
  private getConfiguredLogLevel(): LogLevel {
    const config = vscode.workspace.getConfiguration('devsteps');
    const level = config.get<string>('logging.level', 'info');
    
    // Validate level
    if (['error', 'warn', 'info', 'debug'].includes(level)) {
      return level as LogLevel;
    }
    
    return 'info'; // Default fallback
  }
}

/**
 * Convenience export for quick access
 */
export const logger = DevStepsLogger.getInstance();
