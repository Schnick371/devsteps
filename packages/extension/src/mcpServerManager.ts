/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * MCP Server Manager - NPX Zero-Configuration Architecture
 * 
 * **Requires VS Code 1.99.0+** (March 2025)
 * - Uses registerMcpServerDefinitionProvider API
 * - NPX-based: Auto-downloads from npm registry (no sudo required!)
 * - One MCP server process per VS Code instance
 * - Automatic workspace detection via VS Code roots
 * - No environment variables needed - VS Code provides workspace context
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { logger } from './outputChannel.js';

/**
 * Manages the DevSteps MCP server lifecycle
 * Uses npx for zero-configuration execution (no installation required!)
 * npx auto-downloads to user cache (~/.npm/_npx/) - no sudo needed
 */
export class McpServerManager {
  private statusBarItem: vscode.StatusBarItem;
  private provider?: vscode.Disposable;
  private changeEmitter: vscode.EventEmitter<void>;

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
   * Start the MCP server using npx (zero-configuration!)
   * VS Code automatically provides workspace roots - no environment variables needed!
   * npx downloads package to user cache on first run - no sudo required
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
        logger.info(`📁 MCP server will use this workspace automatically (via VS Code roots)`);
      } else {
        logger.warn('No workspace folder detected - MCP server may not function correctly');
      }

      logger.info('🚀 Starting MCP server via npx (zero-configuration)');

      // Register MCP server with VS Code using NPX architecture
      this.provider = (vscode as any).lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
        // Event fired when server definitions change
        onDidChangeMcpServerDefinitions: this.changeEmitter.event,
        
        // Provide MCP server definitions
        provideMcpServerDefinitions: async () => {
          const workspacePath = workspaceFolders?.[0]?.uri;
          const workspaceDir = workspacePath?.fsPath;
          
          // Create server definition using NPX
          // NPX auto-downloads to user cache (~/.npm/_npx/) - NO SUDO REQUIRED!
          // Workspace path passed as CLI argument (Standard MCP pattern)
          const args = ['-y', '--package=@schnick371/devsteps-mcp-server', 'devsteps-mcp'];
          if (workspaceDir) {
            args.push(workspaceDir);  // Pass workspace as positional argument
          }
          
          const serverDef = new (vscode as any).McpStdioServerDefinition(
            'devsteps',                                      // label
            'npx',                                          // command: npx (not node!)
            args,                                           // args: package + bin + workspace
            workspaceDir ? {                                // options
              cwd: workspaceDir                            // Sets process.cwd() for spawned process
            } : {},
            '1.0.0'                                        // version
          );
          
          if (workspaceDir) {
            logger.info(`📂 MCP server configured with cwd: ${workspaceDir}`);
          } else {
            logger.warn('⚠️  No workspace folder found - MCP server may not find project');
          }
          
          const definitions = [serverDef];
          
          logger.info('🚀 MCP server definitions provided to VS Code');
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
      this.statusBarItem.tooltip = 'DevSteps MCP Server registered (npx zero-config)';
      this.statusBarItem.show();

      logger.info('✅ DevSteps MCP Server registered successfully');
      logger.info('   Architecture: NPX zero-configuration (one server per VS Code instance)');
      logger.info('   Installation: Auto-download to user cache - no sudo required');
      logger.info('   Workspace detection: Automatic via VS Code roots protocol');
    } catch (error) {
      logger.error('Failed to register MCP server', error);
      this.showFallbackConfiguration();
    }
  }



  /**
   * Show fallback instructions for manual configuration
   */
  private showFallbackConfiguration(): void {
    logger.warn('VS Code MCP API not available - showing fallback configuration');
    
    const message =
      'DevSteps MCP Server requires VS Code 1.99+ for automatic setup via npx. ' +
      'You can configure it manually or upgrade VS Code.';

    vscode.window.showInformationMessage(message, 'Open Documentation', 'Copy Config').then((selection) => {
      if (selection === 'Open Documentation') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/devsteps/devsteps#mcp-setup'));
      } else if (selection === 'Copy Config') {
        const config = {
          servers: {
            devsteps: {
              type: 'stdio',
              command: 'node',
              args: ['${workspaceFolder}/packages/mcp-server/dist/index.js'],
            },
          },
        };
        vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
        logger.info('MCP configuration copied to clipboard');
        logger.info('Manual MCP configuration copied to clipboard');
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
        logger.info('Architecture: Extension-bundled (one server per VS Code instance)');
        logger.info(`Status: ${this.provider ? 'Registered with VS Code' : 'Not registered'}`);
        
        const message = this.provider
          ? `DevSteps MCP Server running for workspace: ${workspacePath}`
          : 'DevSteps MCP Server requires manual configuration.';

        vscode.window.showInformationMessage(message, 'Show Output').then((selection) => {
          if (selection === 'Show Output') {
            logger.show();
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
