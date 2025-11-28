/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Package Installer - Auto-download CLI and MCP packages from npm
 * 
 * Platform-aware installation:
 * - Windows: Installs to global npm (native Windows Node)
 * - WSL2: Installs to WSL2 global npm via wsl.exe
 * - Linux: Installs to global npm (native Linux Node)
 */

import * as vscode from 'vscode';
import * as child_process from 'node:child_process';
import * as util from 'node:util';

const execAsync = util.promisify(child_process.exec);

/**
 * Auto-installer for DevSteps CLI and MCP Server packages
 * 
 * Detects platform (Windows/WSL2/Linux) and installs packages globally
 * Updates VS Code MCP configuration automatically
 */
export class PackageInstaller {
  private readonly isWSL: boolean;
  private readonly isWindows: boolean;

  constructor() {
    // Detect platform
    this.isWSL = vscode.env.remoteName === 'wsl';
    this.isWindows = process.platform === 'win32' && !this.isWSL;
  }

  /**
   * Ensure packages are installed globally
   * Checks for existing installation before downloading
   */
  async ensurePackagesInstalled(): Promise<void> {
    // Check if packages already installed
    if (await this.arePackagesInstalled()) {
      console.log('[DevSteps] Packages already installed');
      return;
    }

    // Show progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Installing DevSteps packages...',
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ message: 'Downloading from npm...' });
          await this.installPackages();
          
          progress.report({ message: 'Configuring MCP server...' });
          await this.configureMCP();
          
          vscode.window.showInformationMessage(
            'DevSteps packages installed successfully!'
          );
        } catch (error) {
          throw new Error(
            `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    );
  }

  /**
   * Check if CLI and MCP packages are installed globally
   */
  private async arePackagesInstalled(): Promise<boolean> {
    try {
      const command = this.isWSL
        ? 'wsl.exe -e bash -c "npm list -g @schnick371/devsteps-cli @schnick371/devsteps-mcp-server"'
        : 'npm list -g @schnick371/devsteps-cli @schnick371/devsteps-mcp-server';

      await execAsync(command);
      return true;
    } catch {
      // npm list exits with code 1 if packages not found
      return false;
    }
  }

  /**
   * Install packages globally via npm
   * Platform-specific command execution
   */
  private async installPackages(): Promise<void> {
    const packages = '@schnick371/devsteps-cli @schnick371/devsteps-mcp-server';
    
    const command = this.isWSL
      ? `wsl.exe -e bash -c "npm install -g ${packages}"`
      : `npm install -g ${packages}`;

    console.log('[DevSteps] Installing packages:', command);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('npm warn')) {
      console.warn('[DevSteps] Installation warnings:', stderr);
    }
    
    console.log('[DevSteps] Installation output:', stdout);
  }

  /**
   * Configure MCP server in VS Code settings
   * 
   * Updates global mcp.json with devsteps server configuration
   * Platform-specific path handling for WSL2
   */
  private async configureMCP(): Promise<void> {
    try {
      // Get MCP server path
      const mcpPath = await this.getMCPServerPath();
      if (!mcpPath) {
        throw new Error('MCP server executable not found after installation');
      }

      // Read existing mcp.json
      const mcpConfigUri = vscode.Uri.file(
        this.isWindows
          ? `${process.env.APPDATA}\\Code\\User\\mcp.json`
          : `${process.env.HOME}/.config/Code/User/mcp.json`
      );

      let config: any = { servers: {} };
      try {
        const configData = await vscode.workspace.fs.readFile(mcpConfigUri);
        config = JSON.parse(Buffer.from(configData).toString('utf8'));
      } catch {
        // mcp.json doesn't exist yet, create new
        console.log('[DevSteps] Creating new mcp.json');
      }

      // Get workspace folder path for DEVSTEPS_WORKSPACE env var
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspacePath = workspaceFolders && workspaceFolders.length > 0
        ? workspaceFolders[0].uri.fsPath
        : undefined;

      // Add devsteps server configuration
      if (this.isWSL) {
        // WSL2: Use wsl.exe with absolute Linux path
        // Convert Windows path to WSL2 path if needed
        const wslWorkspacePath = workspacePath
          ? workspacePath.replace(/^([A-Z]):\\/, (_, drive) => `/mnt/${drive.toLowerCase()}/`).replace(/\\/g, '/')
          : undefined;

        config.servers.devsteps = {
          type: 'stdio',
          command: 'wsl.exe',
          args: ['-e', mcpPath],
          env: wslWorkspacePath ? { DEVSTEPS_WORKSPACE: wslWorkspacePath } : {},
        };
      } else {
        // Windows/Linux: Use node with absolute path
        config.servers.devsteps = {
          type: 'stdio',
          command: 'node',
          args: [mcpPath],
          env: workspacePath ? { DEVSTEPS_WORKSPACE: workspacePath } : {},
        };
      }

      // Write updated config
      const configJson = JSON.stringify(config, null, '\t');
      await vscode.workspace.fs.writeFile(
        mcpConfigUri,
        Buffer.from(configJson, 'utf8')
      );

      console.log('[DevSteps] MCP configuration updated');
    } catch (error) {
      console.error('[DevSteps] Failed to configure MCP:', error);
      throw error;
    }
  }

  /**
   * Get absolute path to MCP server executable
   * Platform-specific path resolution
   */
  private async getMCPServerPath(): Promise<string | null> {
    try {
      if (this.isWSL) {
        // WSL2: Get Linux path to global npm bin
        const { stdout } = await execAsync(
          'wsl.exe -e bash -c "npm bin -g"'
        );
        const binPath = stdout.trim();
        return `${binPath}/devsteps-mcp`;
      } else {
        // Windows/Linux: Get native path to global npm bin
        const { stdout } = await execAsync('npm bin -g');
        const binPath = stdout.trim();
        return this.isWindows
          ? `${binPath}\\devsteps-mcp.cmd`
          : `${binPath}/devsteps-mcp`;
      }
    } catch (error) {
      console.error('[DevSteps] Failed to get MCP path:', error);
      return null;
    }
  }
}
