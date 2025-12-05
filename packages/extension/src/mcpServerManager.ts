/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * MCP Server Manager - Hybrid Runtime Detection Architecture
 * 
 * **Fallback Chain:**
 * 1. npx (preferred) - Auto-downloads from npm registry
 * 2. node (fallback) - Uses bundled MCP server
 * 3. error (guidance) - Shows installation instructions
 * 
 * **Requires VS Code 1.99.0+** for MCP API support
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { logger } from './outputChannel.js';
import { detectMcpRuntime, formatDiagnostics, type McpRuntimeConfig } from './utils/runtimeDetector.js';

/**
 * Manages the DevSteps MCP server lifecycle
 * 
 * Implements intelligent runtime detection:
 * 1. Tries npx (preferred - auto-installs from npm)
 * 2. Falls back to node + bundled server
 * 3. Shows helpful error if neither available
 */
export class McpServerManager {
  private statusBarItem: vscode.StatusBarItem;
  private provider?: vscode.Disposable;
  private changeEmitter: vscode.EventEmitter<void>;
  private runtimeConfig?: McpRuntimeConfig;

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = 'devsteps.mcp.showStatus';
    this.context.subscriptions.push(this.statusBarItem);
    
    // Event emitter for server definition changes
    this.changeEmitter = new vscode.EventEmitter<void>();
    this.context.subscriptions.push(this.changeEmitter);
  }

  /**
   * Start the MCP server with intelligent runtime detection
   * 
   * Fallback chain:
   * 1. npx → Auto-installs from npm registry
   * 2. node → Uses bundled MCP server
   * 3. error → Shows installation guide
   */
  async start(): Promise<void> {
    try {
      // Check if VS Code MCP API is available
      if (!('lm' in vscode) || !('registerMcpServerDefinitionProvider' in (vscode as any).lm)) {
        logger.warn('VS Code MCP API not available (requires VS Code 1.99+)');
        this.showFallbackConfiguration();
        return;
      }

      // Log workspace information
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const workspacePath = workspaceFolders[0].uri.fsPath;
        logger.info(`🗂️  Detected workspace: ${workspacePath}`);
      } else {
        logger.warn('No workspace folder detected - MCP server may not function correctly');
      }

      logger.info('🔍 Detecting Node.js runtime...');
      
      // Detect available runtime (with optional bundled server path)
      const bundledServerPath = path.join(this.context.extensionPath, 'dist', 'mcp-server.js');
      this.runtimeConfig = await detectMcpRuntime(bundledServerPath);
      
      // Log diagnostics
      logger.info(formatDiagnostics(this.runtimeConfig.diagnostics));
      
      // Check if we have a working runtime
      if (this.runtimeConfig.strategy === 'none') {
        logger.error('No compatible Node.js runtime found');
        logger.error(this.runtimeConfig.error || 'Unknown error');
        this.showNoRuntimeError(this.runtimeConfig.error || 'Node.js not found');
        return;
      }
      
      logger.info(`✅ Using runtime strategy: ${this.runtimeConfig.strategy}`);
      logger.info(`   Command: ${this.runtimeConfig.command} ${this.runtimeConfig.args?.join(' ') || ''}`);
      logger.info('🚀 Starting MCP server...');

      // Register MCP server with VS Code using detected runtime
      this.provider = (vscode as any).lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
        // Event fired when server definitions change
        onDidChangeMcpServerDefinitions: this.changeEmitter.event,
        
        // Provide MCP server definitions
        provideMcpServerDefinitions: async () => {
          if (!this.runtimeConfig || this.runtimeConfig.strategy === 'none') {
            logger.error('Cannot provide MCP server definition - no runtime available');
            return [];
          }
          
          const workspacePath = workspaceFolders?.[0]?.uri;
          const workspaceDir = workspacePath?.fsPath;
          
          // Build args based on detected strategy
          const args = [...(this.runtimeConfig.args || [])];
          
          // Add workspace path for both strategies
          if (workspaceDir) {
            args.push(workspaceDir);  // Pass workspace as positional argument
          }
          
          const serverDef = new (vscode as any).McpStdioServerDefinition(
            'devsteps',                                      // label
            this.runtimeConfig.command!,                     // command: npx or node
            args,                                            // args: based on strategy
            workspaceDir ? {                                 // options
              cwd: workspaceDir                             // Sets process.cwd() for spawned process
            } : {},
            '1.0.0'                                         // version
          );
          
          if (workspaceDir) {
            logger.info(`📂 MCP server configured with cwd: ${workspaceDir}`);
          } else {
            logger.warn('⚠️  No workspace folder found - MCP server may not find project');
          }
          
          const definitions = [serverDef];
          
          logger.info('🚀 MCP server definitions provided to VS Code');
          logger.info(`   Strategy: ${this.runtimeConfig.strategy}`);
          logger.info('   Server will start in workspace directory');
          
          return definitions;
        },

        // Resolve server definition before starting (optional auth/validation)
        resolveMcpServerDefinition: async (server: any) => {
          if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            logger.info(`🔧 Resolving MCP server for workspace: ${workspacePath}`);
            logger.info('   VS Code will provide workspace roots automatically');
          }
          
          // Return server as-is - VS Code handles workspace context
          return server;
        },
      });

      if (this.provider) {
        this.context.subscriptions.push(this.provider);
      }

      // Update status bar
      this.statusBarItem.text = '$(check) DevSteps MCP';
      this.statusBarItem.tooltip = `DevSteps MCP Server registered (${this.runtimeConfig.strategy})`;
      this.statusBarItem.show();

      logger.info('✅ DevSteps MCP Server registered successfully');
      logger.info(`   Runtime: ${this.runtimeConfig.strategy}`);
      logger.info(`   Command: ${this.runtimeConfig.command}`);
    } catch (error) {
      logger.error('Failed to register MCP server', error);
      this.showFallbackConfiguration();
    }
  }



  /**
   * Show error when no Node.js runtime is available
   */
  private showNoRuntimeError(errorMessage: string): void {
    logger.error('No Node.js runtime available');
    
    const message = 'DevSteps requires Node.js to be installed. Install Node.js and restart VS Code.';

    vscode.window.showErrorMessage(
      message,
      'Install Node.js',
      'Check Prerequisites',
      'Show Details'
    ).then((selection) => {
      if (selection === 'Install Node.js') {
        vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/'));
      } else if (selection === 'Check Prerequisites') {
        vscode.commands.executeCommand('devsteps.checkPrerequisites');
      } else if (selection === 'Show Details') {
        logger.show();
      }
    });

    this.statusBarItem.text = '$(error) DevSteps MCP';
    this.statusBarItem.tooltip = 'DevSteps MCP Server requires Node.js';
    this.statusBarItem.show();
  }

  /**
   * Show fallback instructions for manual configuration
   */
  private showFallbackConfiguration(): void {
    logger.warn('VS Code MCP API not available - showing fallback configuration');
    
    const message =
      'DevSteps MCP Server requires VS Code 1.99+ for automatic setup. ' +
      'You can configure it manually or upgrade VS Code.';

    vscode.window.showInformationMessage(message, 'Open Documentation', 'Copy Config').then((selection) => {
      if (selection === 'Open Documentation') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/devsteps/devsteps#mcp-setup'));
      } else if (selection === 'Copy Config') {
        const config = {
          servers: {
            devsteps: {
              type: 'stdio',
              command: 'npx',
              args: ['-y', '--package=@schnick371/devsteps-mcp-server', 'devsteps-mcp'],
            },
          },
        };
        vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
        logger.info('MCP configuration copied to clipboard');
      }
    });

    this.statusBarItem.text = '$(warning) DevSteps MCP';
    this.statusBarItem.tooltip = 'DevSteps MCP Server requires manual setup (VS Code 1.99+ required)';
    this.statusBarItem.show();
  }

  /**
   * Stop the MCP server
   */
  stop(): void {
    logger.info('Stopping DevSteps MCP Server...');
    this.provider?.dispose();
    this.statusBarItem.hide();
  }

  /**
   * Register MCP-related commands
   */
  registerCommands(): void {
    this.context.subscriptions.push(
      vscode.commands.registerCommand('devsteps.mcp.showStatus', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders?.[0]?.uri.fsPath || 'No workspace';
        
        logger.info('=== DevSteps MCP Server Status ===');
        logger.info(`Workspace: ${workspacePath}`);
        if (this.runtimeConfig) {
          logger.info(`Runtime: ${this.runtimeConfig.strategy}`);
          logger.info(`Command: ${this.runtimeConfig.command || 'none'}`);
          logger.info(formatDiagnostics(this.runtimeConfig.diagnostics));
        }
        logger.info(`Status: ${this.provider ? 'Registered with VS Code' : 'Not registered'}`);
        
        const message = this.provider
          ? `DevSteps MCP Server running (${this.runtimeConfig?.strategy || 'unknown'})`
          : 'DevSteps MCP Server not registered.';

        vscode.window.showInformationMessage(message, 'Show Output', 'Check Prerequisites').then((selection) => {
          if (selection === 'Show Output') {
            logger.show();
          } else if (selection === 'Check Prerequisites') {
            vscode.commands.executeCommand('devsteps.checkPrerequisites');
          }
        });
      }),
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand('devsteps.mcp.restart', async () => {
        await this.restart();
      }),
    );
  }

  /**
   * Restart the MCP server
   */
  private async restart(): Promise<void> {
    try {
      logger.info('Restarting DevSteps MCP Server...');
      
      if (this.provider) {
        this.provider.dispose();
        this.provider = undefined;
      }

      // Fire change event to notify VS Code
      this.changeEmitter.fire();

      await this.start();
      vscode.window.showInformationMessage('DevSteps MCP Server restarted successfully');
      logger.info('✅ DevSteps MCP Server restarted');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Failed to restart MCP Server: ${errorMsg}`);
      logger.error('Failed to restart MCP Server', error);
    }
  }
}
