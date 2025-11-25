/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * MCP Server Manager - Automatic startup and configuration
 * Uses VS Code's official registerMcpServerDefinitionProvider API (2025)
 */

import * as vscode from 'vscode';
import * as path from 'node:path';

/**
 * Manages the DevSteps MCP server lifecycle
 * Automatically registers and configures the server with VS Code
 */
export class McpServerManager {
  private statusBarItem: vscode.StatusBarItem;
  private provider?: vscode.Disposable;

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = 'devcrumbs.mcp.showStatus';
    this.context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Start the MCP server using VS Code's official API
   */
  async start(): Promise<void> {
    try {
      // Check if VS Code MCP API is available
      if (!('lm' in vscode) || !('registerMcpServerDefinitionProvider' in (vscode as any).lm)) {
        this.showFallbackConfiguration();
        return;
      }

      // Find the MCP server executable
      const mcpServerPath = this.findMcpServerPath();
      if (!mcpServerPath) {
        vscode.window.showWarningMessage(
          'DevSteps MCP server not found. Please install @schnick371/devsteps-mcp-server.',
        );
        return;
      }

      // Register MCP server with VS Code
      this.provider = (vscode as any).lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
        provideMcpServerDefinitions: async () => {
          return [
            {
              name: 'devsteps',
              command: 'node',
              args: [mcpServerPath],
              type: 'stdio',
              description: 'DevSteps task tracking and AI integration',
            },
          ];
        },
      });

      if (this.provider) {
        this.context.subscriptions.push(this.provider);
      }

      // Update status bar
      this.statusBarItem.text = '$(check) DevSteps MCP';
      this.statusBarItem.tooltip = 'DevSteps MCP Server registered';
      this.statusBarItem.show();

      console.log('DevSteps MCP Server registered successfully');
    } catch (error) {
      console.error('Failed to register MCP server:', error);
      this.showFallbackConfiguration();
    }
  }

  /**
   * Find the MCP server executable path
   */
  private findMcpServerPath(): string | null {
    // Check workspace node_modules first
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

      try {
        // Check if file exists using sync check (extension activation context)
        const fs = require('node:fs');
        if (fs.existsSync(localPath)) {
          return localPath;
        }
      } catch {
        // Fall through to global check
      }
    }

    // Check global installation
    try {
      const { execSync } = require('node:child_process');
      const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
      const globalPath = path.join(npmRoot, '@schnick371', 'devsteps-mcp-server', 'dist', 'index.js');

      const fs = require('node:fs');
      if (fs.existsSync(globalPath)) {
        return globalPath;
      }
    } catch {
      // Global installation not found
    }

    return null;
  }

  /**
   * Show fallback instructions for manual configuration
   */
  private showFallbackConfiguration(): void {
    const message =
      'DevSteps MCP Server requires manual configuration. ' +
      'Add it to your mcp.json or use the MCP: Add Server command.';

    vscode.window.showInformationMessage(message, 'Open Documentation', 'Copy Config').then((selection) => {
      if (selection === 'Open Documentation') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/devcrumbs/devcrumbs#mcp-setup'));
      } else if (selection === 'Copy Config') {
        const config = {
          servers: {
            devcrumbs: {
              type: 'stdio',
              command: 'node',
              args: ['${workspaceFolder}/packages/mcp-server/dist/index.js'],
            },
          },
        };
        vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
        vscode.window.showInformationMessage('MCP configuration copied to clipboard');
      }
    });

    this.statusBarItem.text = '$(warning) DevSteps MCP';
    this.statusBarItem.tooltip = 'DevSteps MCP Server - Manual configuration required';
    this.statusBarItem.show();
  }

  /**
   * Stop the MCP server
   */
  stop(): void {
    this.provider?.dispose();
    this.statusBarItem.hide();
  }

  /**
   * Register status command
   */
  registerCommands(): void {
    this.context.subscriptions.push(
      vscode.commands.registerCommand('devcrumbs.mcp.showStatus', () => {
        const message = this.provider
          ? 'DevSteps MCP Server is registered and available in Copilot Chat.'
          : 'DevSteps MCP Server requires manual configuration.';

        vscode.window.showInformationMessage(message);
      }),
    );
  }
}
