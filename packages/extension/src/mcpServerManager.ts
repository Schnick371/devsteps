/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Server Manager - Hybrid Runtime Detection Architecture
 *
 * **Fallback Chain:**
 * 1. HTTP in-process (VS Code 1.109+) - Zero-overhead, no child process
 * 2. stdio via npx (1.99–1.108) - Auto-downloads from npm registry
 * 3. stdio via node (fallback) - Uses bundled MCP server
 * 4. error (guidance) - Shows installation instructions
 *
 * **Requires VS Code 1.109.0+** for automatic in-process setup
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as vscode from 'vscode';
import { logger } from './outputChannel.js';
import {
  detectMcpRuntime,
  formatDiagnostics,
  type McpRuntimeConfig,
} from './utils/runtimeDetector.js';

/**
 * Experimental VS Code MCP API (requires VS Code 1.109+)
 * These types are not yet in the official @types/vscode
 */
interface VsCodeWithMcpApi {
  lm: {
    registerMcpServerDefinitionProvider: (id: string, provider: unknown) => vscode.Disposable;
  };
  McpStdioServerDefinition: new (
    label: string,
    command: string,
    args: string[],
    options: { cwd?: string },
    version: string
  ) => unknown;
  /** Available in VS Code 1.109+ for in-process HTTP MCP servers */
  McpHttpServerDefinition: new (
    label: string,
    url: string,
    version: string
  ) => unknown;
}

/**
 * Check if extension is running as pre-release version
 *
 * Uses VS Code's version convention extended with patch-level detection:
 * - minor is ODD (e.g. 1.1.x, 1.3.x) → pre-release (standard convention)
 * - minor is EVEN, patch is ODD (e.g. 1.0.1, 1.2.3) → pre-release (patch-level)
 * - minor and patch both EVEN (e.g. 1.0.0, 1.2.0) → stable
 *
 * Background: The VS Code Marketplace requires N.N.N version format — semver
 * pre-release suffixes like "1.1.0-next.1" are not supported. VSIX pre-release
 * status is instead set via `vsce publish --pre-release` (no package.json field).
 *
 * "preRelease: true" does NOT exist in package.json — only the vsce CLI flag matters.
 *
 * @param context Extension context with package.json access
 * @returns True if extension version indicates a pre-release build
 */
function isPreRelease(context: vscode.ExtensionContext): boolean {
  // Explicit channel field takes precedence over version parity
  if (context.extension.packageJSON.channel === 'next') {
    return true;
  }
  const version: string = context.extension.packageJSON.version ?? '0.0.0';
  const parts = version.split('.');
  const minor = parseInt(parts[1] ?? '0', 10);
  const patch = parseInt(parts[2] ?? '0', 10);
  // Odd minor (1.1.x, 1.3.x) OR odd patch with even minor (1.0.1, 1.2.3)
  return minor % 2 !== 0 || patch % 2 !== 0;
}

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
  private httpServer?: { url: string; close: () => Promise<void> };

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'devsteps.mcp.showStatus';
    this.context.subscriptions.push(this.statusBarItem);

    // Event emitter for server definition changes
    this.changeEmitter = new vscode.EventEmitter<void>();
    this.context.subscriptions.push(this.changeEmitter);
  }

  /**
   * Get MCP server package name based on pre-release status
   *
   * Pre-release extensions use @next tag to get compatible MCP server versions.
   * Stable releases use latest version without tag.
   *
   * @returns Package specifier for npx
   */
  private getMcpServerPackage(): string {
    const usePreRelease = isPreRelease(this.context);
    const packageName = usePreRelease
      ? '@schnick371/devsteps-mcp-server@next'
      : '@schnick371/devsteps-mcp-server';

    logger.info(`Using MCP server package: ${packageName} (pre-release: ${usePreRelease})`);
    return packageName;
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
      // Skip if a DevSteps VS Code plugin is already managing MCP
      const pluginPaths = vscode.workspace
        .getConfiguration('chat')
        .get<Record<string, string[]>>('plugins.paths', {});
      const pluginActive = Object.values(pluginPaths)
        .flat()
        .some((p) => p.toLowerCase().includes('devsteps'));
      if (pluginActive) {
        logger.info('[MCP] DevSteps plugin detected — skipping extension-managed MCP server start');
        return;
      }

      // Check if VS Code MCP API is available
      const mcpVscode = vscode as unknown as Partial<VsCodeWithMcpApi>;
      if (!mcpVscode.lm?.registerMcpServerDefinitionProvider) {
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

      const vscodeApi = vscode as unknown as VsCodeWithMcpApi;

      // Prefer HTTP in-process mode (VS Code 1.109+)
      if ('McpHttpServerDefinition' in vscodeApi) {
        logger.info('🌐 VS Code 1.109+ detected — starting in-process HTTP MCP server');

        const bundledServerPath = path.join(this.context.extensionPath, 'dist', 'mcp-server.js');
        const bundledServerUrl = pathToFileURL(bundledServerPath).href;
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
          logger.warn('⚠️  No workspace folder open — cannot start in-process HTTP MCP server safely');
          return;
        }

        logger.info(`📂 Workspace: ${workspacePath}`);
        logger.info(`📦 Loading bundled MCP server: ${bundledServerPath}`);

        if (!fs.existsSync(bundledServerPath)) {
          const reinstallMsg =
            'DevSteps extension installation is incomplete — bundled MCP server not found. ' +
            'Please reinstall the DevSteps extension.';
          logger.error(`❌ Bundled MCP server not found: ${bundledServerPath}`);
          void vscode.window.showErrorMessage(reinstallMsg, 'Reinstall Extension').then((sel) => {
            if (sel === 'Reinstall Extension') {
              void vscode.commands.executeCommand(
                'workbench.extensions.action.showExtensionsWithIds',
                ['devsteps.devsteps']
              );
            }
          });
          this.statusBarItem.text = '$(error) DevSteps MCP';
          this.statusBarItem.tooltip = 'DevSteps MCP: Reinstall required';
          this.statusBarItem.show();
          return;
        }

        const { startHttpMcpServer } = await import(bundledServerUrl);
        this.httpServer = await startHttpMcpServer(0, workspacePath);

        logger.info(`✅ In-process HTTP MCP server started: ${this.httpServer.url}`);

        const httpDef = new vscodeApi.McpHttpServerDefinition(
          'devsteps',
          this.httpServer.url,
          '1.0.0'
        );
        this.provider = vscodeApi.lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
          onDidChangeMcpServerDefinitions: this.changeEmitter.event,
          provideMcpServerDefinitions: async () => [httpDef],
          resolveMcpServerDefinition: async (server: unknown) => server,
        });

        if (this.provider) {
          this.context.subscriptions.push(this.provider);
        }

        this.statusBarItem.text = '$(check) DevSteps MCP';
        this.statusBarItem.tooltip = `DevSteps MCP Server (in-process HTTP) @ ${this.httpServer.url}`;
        this.statusBarItem.show();

        await vscode.commands.executeCommand('setContext', 'devsteps.mcpActive', true);
        logger.info('[MCP] devsteps.mcpActive context key set (HTTP in-process)');
        logger.info('✅ DevSteps MCP Server registered successfully (HTTP in-process)');
        return;
      }

      // Fallback: stdio mode (VS Code < 1.109)
      logger.info('🔍 Detecting Node.js runtime (stdio fallback)...');

      // Detect available runtime (with optional bundled server path)
      const bundledServerPath = path.join(this.context.extensionPath, 'dist', 'mcp-server.js');
      const mcpPackage = this.getMcpServerPackage();
      this.runtimeConfig = await detectMcpRuntime(bundledServerPath, mcpPackage);

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
      logger.info(
        `   Command: ${this.runtimeConfig.command} ${this.runtimeConfig.args?.join(' ') || ''}`
      );
      logger.info('🚀 Starting MCP server (stdio)...');

      // Register MCP server with VS Code using detected runtime
      this.provider = vscodeApi.lm.registerMcpServerDefinitionProvider('devsteps-mcp', {
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
            args.push(workspaceDir); // Pass workspace as positional argument
          }

          const serverDef = new vscodeApi.McpStdioServerDefinition(
            'devsteps', // label
            this.runtimeConfig.command || '', // command: npx or node
            args, // args: based on strategy
            workspaceDir
              ? {
                  // options
                  cwd: workspaceDir, // Sets process.cwd() for spawned process
                }
              : {},
            '1.0.0' // version
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
        resolveMcpServerDefinition: async (server: unknown) => {
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

      await vscode.commands.executeCommand('setContext', 'devsteps.mcpActive', true);
      logger.info('[MCP] devsteps.mcpActive context key set (stdio)');
      logger.info('✅ DevSteps MCP Server registered successfully');
      logger.info(`   Runtime: ${this.runtimeConfig.strategy}`);
      logger.info(`   Command: ${this.runtimeConfig.command}`);
    } catch (error) {
      logger.error('Failed to register MCP server', error);
      this.showStartupError(error);
    }
  }

  /**
   * Show error when no Node.js runtime is available
   */
  private showNoRuntimeError(_errorMessage: string): void {
    logger.error('No Node.js runtime available');

    const message =
      'DevSteps requires Node.js to be installed. Install Node.js and restart VS Code.';

    vscode.window
      .showErrorMessage(message, 'Install Node.js', 'Check Prerequisites', 'Show Details')
      .then((selection) => {
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
   * Show error when MCP server startup fails on VS Code 1.109+.
   * Surfaces the actual error to the user instead of misleading version message.
   */
  private showStartupError(error: unknown): void {
    const detail = error instanceof Error ? error.message : String(error);
    logger.error(`MCP server startup failed: ${detail}`);

    void vscode.window
      .showErrorMessage(
        `DevSteps MCP Server failed to start. See DevSteps output for details.`,
        'Show Output',
        'Open Documentation'
      )
      .then((selection) => {
        if (selection === 'Show Output') {
          logger.show();
        } else if (selection === 'Open Documentation') {
          void vscode.env.openExternal(
            vscode.Uri.parse('https://github.com/Schnick371/devsteps#mcp-setup')
          );
        }
      });

    this.statusBarItem.text = '$(error) DevSteps MCP';
    this.statusBarItem.tooltip = `DevSteps MCP failed: ${detail.slice(0, 80)}`;
    this.statusBarItem.show();
  }

  /**
   * Show fallback instructions for manual configuration.
   * Only called when VS Code < 1.99 (MCP API entirely absent).
   */
  private showFallbackConfiguration(): void {
    logger.warn('VS Code MCP API not available - showing fallback configuration');

    const message =
      'DevSteps MCP Server requires VS Code 1.109+ for automatic setup. ' +
      'You can configure it manually or upgrade VS Code.';

    vscode.window
      .showInformationMessage(message, 'Open Documentation', 'Copy Config')
      .then((selection) => {
        if (selection === 'Open Documentation') {
          vscode.env.openExternal(
            vscode.Uri.parse('https://github.com/Schnick371/devsteps#mcp-setup')
          );
        } else if (selection === 'Copy Config') {
          const mcpPackage = this.getMcpServerPackage();
          const config = {
            servers: {
              devsteps: {
                type: 'stdio',
                command: 'npx',
                args: ['-y', `--package=${mcpPackage}`, 'devsteps-mcp'],
              },
            },
          };
          vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
          logger.info('MCP configuration copied to clipboard');
        }
      });

    this.statusBarItem.text = '$(warning) DevSteps MCP';
    this.statusBarItem.tooltip =
      'DevSteps MCP Server requires manual setup (VS Code 1.99+ required)';
    this.statusBarItem.show();
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    logger.info('Stopping DevSteps MCP Server...');
    this.provider?.dispose();
    if (this.httpServer) {
      await this.httpServer.close();
      this.httpServer = undefined;
    }
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

        vscode.window
          .showInformationMessage(message, 'Show Output', 'Check Prerequisites')
          .then((selection) => {
            if (selection === 'Show Output') {
              logger.show();
            } else if (selection === 'Check Prerequisites') {
              vscode.commands.executeCommand('devsteps.checkPrerequisites');
            }
          });
      })
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand('devsteps.mcp.restart', async () => {
        await this.restart();
      })
    );
  }

  /**
   * Restart the MCP server
   */
  private async restart(): Promise<void> {
    try {
      logger.info('Restarting DevSteps MCP Server...');

      if (this.httpServer) {
        await this.httpServer.close();
        this.httpServer = undefined;
      }

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
