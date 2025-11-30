/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * MCP Server Manager - Extension-Bundled Architecture
 * 
 * **Requires VS Code 1.99.0+** (March 2025)
 * - Uses registerMcpServerDefinitionProvider API
 * - Extension-bundled: One MCP server process per VS Code instance
 * - Automatic workspace detection via VS Code roots
 * - No environment variables needed - VS Code provides workspace context
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { logger } from './outputChannel.js';

/**
 * Manages the DevSteps MCP server lifecycle
 * Uses extension-bundled architecture for proper multi-workspace support
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
   * Start the MCP server using VS Code's extension-bundled architecture
   * VS Code automatically provides workspace roots - no environment variables needed!
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

      // Find the MCP server executable
      const mcpServerPath = this.findMcpServerPath();
      if (!mcpServerPath) {
        logger.error('MCP server executable not found');
        vscode.window.showWarningMessage(
          'DevSteps MCP server not found. Please ensure the extension is built correctly.',
        );
        return;
      }

      logger.info(`✅ Found MCP server at: ${mcpServerPath}`);

      // Register MCP server with VS Code using extension-bundled architecture
      this.provider = (vscode as any).lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
        // Event fired when server definitions change
        onDidChangeMcpServerDefinitions: this.changeEmitter.event,
        
        // Provide MCP server definitions
        provideMcpServerDefinitions: async () => {
          const workspacePath = workspaceFolders?.[0]?.uri;
          
          // Create server definition with cwd option
          // IMPORTANT: cwd must be set in constructor options, not as property
          const serverDef = new (vscode as any).McpStdioServerDefinition(
            'devsteps',                    // label
            'node',                        // command
            [mcpServerPath],              // args
            workspacePath ? {             // options (CORRECT WAY!)
              cwd: workspacePath          // Set cwd in options object
            } : {},
            '1.0.0'                       // version
          );
          
          if (workspacePath) {
            logger.info(`📂 MCP server configured with cwd: ${workspacePath.fsPath}`);
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
      this.statusBarItem.tooltip = 'DevSteps MCP Server registered (extension-bundled)';
      this.statusBarItem.show();

      logger.info('✅ DevSteps MCP Server registered successfully');
      logger.info('   Architecture: Extension-bundled (one server per VS Code instance)');
      logger.info('   Workspace detection: Automatic via VS Code roots protocol');
    } catch (error) {
      logger.error('Failed to register MCP server', error);
      this.showFallbackConfiguration();
    }
  }

  /**
   * Find the MCP server executable path
   * Priority: 1) Bundled with extension, 2) Workspace packages/mcp-server, 3) Global npm installation
   */
  private findMcpServerPath(): string | null {
    const fs = require('node:fs');
    
    // 1. Check bundled MCP server (for distributed extension)
    const bundledPath = path.join(
      this.context.extensionPath,
      'dist',
      'mcp-server',
      'index.js',
    );
    
    if (fs.existsSync(bundledPath)) {
      logger.info(`Found bundled MCP server: ${bundledPath}`);
      return bundledPath;
    }
    
    // 2. Check workspace packages/mcp-server (for monorepo development)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const localPath = path.join(
        workspaceRoot,
        'packages',
        'mcp-server',
        'dist',
        'index.js',
      );

      if (fs.existsSync(localPath)) {
        logger.info(`Found MCP server in workspace: ${localPath}`);
        return localPath;
      }
    }

    // 3. Check global npm installation
    try {
      const { execSync } = require('node:child_process');
      const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
      const globalPath = path.join(npmRoot, '@schnick371', 'devsteps-mcp-server', 'dist', 'index.js');

      if (fs.existsSync(globalPath)) {
        logger.info(`Found MCP server globally: ${globalPath}`);
        return globalPath;
      }
    } catch {
      // Global installation not found
    }

    logger.error('MCP server not found in any location');
    return null;
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
              command: 'node',
              args: ['${workspaceFolder}/packages/mcp-server/dist/index.js'],
            },
          },
        };
        vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
        vscode.window.showInformationMessage('MCP configuration copied to clipboard');
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
