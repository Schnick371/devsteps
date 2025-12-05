/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Runtime Detector - Node.js and NPX Detection Utility
 * 
 * Detects available JavaScript runtimes for MCP server execution.
 * Implements fallback chain: npx → node → error with guidance.
 */

import { spawn } from 'node:child_process';
import * as os from 'node:os';

/**
 * Result of runtime detection
 */
export interface RuntimeInfo {
  /** Whether the runtime is available */
  available: boolean;
  /** Command name (e.g., 'npx', 'node') */
  command?: string;
  /** Full path to executable */
  path?: string;
  /** Version string (e.g., 'v22.15.1') */
  version?: string;
  /** Error message if unavailable */
  error?: string;
}

/**
 * Result of MCP runtime selection
 */
export interface McpRuntimeConfig {
  /** Selected runtime strategy */
  strategy: 'npx' | 'node' | 'none';
  /** Command to execute */
  command?: string;
  /** Command arguments */
  args?: string[];
  /** Error message if no runtime available */
  error?: string;
  /** Detailed diagnostics */
  diagnostics: {
    npx: RuntimeInfo;
    node: RuntimeInfo;
    npm: RuntimeInfo;
  };
}

/**
 * Check if a command exists in PATH
 * 
 * @param command Command name to check (e.g., 'npx', 'node')
 * @returns RuntimeInfo with availability and version
 */
export async function checkCommand(command: string): Promise<RuntimeInfo> {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    const checkCmd = isWindows ? 'where' : 'which';
    
    const child = spawn(checkCmd, [command], {
      shell: true,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', async (code) => {
      if (code === 0 && stdout.trim()) {
        // Command found, get version
        const version = await getCommandVersion(command);
        resolve({
          available: true,
          command,
          path: stdout.trim().split('\n')[0], // First path on Windows
          version,
        });
      } else {
        resolve({
          available: false,
          command,
          error: `Command '${command}' not found in PATH`,
        });
      }
    });

    child.on('error', (error) => {
      resolve({
        available: false,
        command,
        error: error.message,
      });
    });
  });
}

/**
 * Get version of a command
 * 
 * @param command Command name
 * @returns Version string or undefined
 */
async function getCommandVersion(command: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const child = spawn(command, ['--version'], {
      shell: true,
      env: process.env,
    });

    let stdout = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim().split('\n')[0]); // First line
      } else {
        resolve(undefined);
      }
    });

    child.on('error', () => {
      resolve(undefined);
    });
  });
}

/**
 * Detect best available MCP server runtime
 * 
 * Implements fallback chain:
 * 1. npx (preferred - auto-downloads from npm registry)
 * 2. node (fallback - requires bundled server)
 * 3. none (error - show installation guide)
 * 
 * @param bundledServerPath Optional path to bundled MCP server for node fallback
 * @returns MCP runtime configuration
 */
export async function detectMcpRuntime(bundledServerPath?: string): Promise<McpRuntimeConfig> {
  // Check all runtimes in parallel
  const [npxInfo, nodeInfo, npmInfo] = await Promise.all([
    checkCommand('npx'),
    checkCommand('node'),
    checkCommand('npm'),
  ]);

  // Strategy 1: npx (preferred)
  if (npxInfo.available) {
    return {
      strategy: 'npx',
      command: 'npx',
      args: ['-y', '--package=@schnick371/devsteps-mcp-server', 'devsteps-mcp'],
      diagnostics: { npx: npxInfo, node: nodeInfo, npm: npmInfo },
    };
  }

  // Strategy 2: node with bundled server
  if (nodeInfo.available && bundledServerPath) {
    return {
      strategy: 'node',
      command: 'node',
      args: [bundledServerPath],
      diagnostics: { npx: npxInfo, node: nodeInfo, npm: npmInfo },
    };
  }

  // Strategy 3: No runtime available
  return {
    strategy: 'none',
    error: buildErrorMessage(npxInfo, nodeInfo, npmInfo),
    diagnostics: { npx: npxInfo, node: nodeInfo, npm: npmInfo },
  };
}

/**
 * Build helpful error message when no runtime is available
 */
function buildErrorMessage(npx: RuntimeInfo, node: RuntimeInfo, npm: RuntimeInfo): string {
  const parts: string[] = [
    'DevSteps MCP Server requires Node.js to be installed.',
    '',
    '**Missing:**',
  ];

  if (!node.available) {
    parts.push('  • Node.js (required)');
  }
  if (!npm.available) {
    parts.push('  • npm (required)');
  }
  if (!npx.available) {
    parts.push('  • npx (recommended)');
  }

  parts.push('');
  parts.push('**Install Node.js:**');
  
  const platform = os.platform();
  if (platform === 'win32') {
    parts.push('  • Download: https://nodejs.org/');
    parts.push('  • Or via winget: `winget install OpenJS.NodeJS`');
  } else if (platform === 'darwin') {
    parts.push('  • Download: https://nodejs.org/');
    parts.push('  • Or via Homebrew: `brew install node`');
  } else {
    parts.push('  • Download: https://nodejs.org/');
    parts.push('  • Or via package manager: `sudo apt install nodejs npm` (Debian/Ubuntu)');
  }

  parts.push('');
  parts.push('**After installation:**');
  parts.push('  1. Restart VS Code');
  parts.push('  2. Run "DevSteps: Check Prerequisites" to verify');

  return parts.join('\n');
}

/**
 * Format diagnostics for logging
 */
export function formatDiagnostics(diagnostics: McpRuntimeConfig['diagnostics']): string {
  const lines: string[] = [
    '=== Runtime Diagnostics ===',
    '',
    `Node.js: ${diagnostics.node.available ? `✅ ${diagnostics.node.version} (${diagnostics.node.path})` : '❌ Not found'}`,
    `npm:     ${diagnostics.npm.available ? `✅ ${diagnostics.npm.version}` : '❌ Not found'}`,
    `npx:     ${diagnostics.npx.available ? `✅ ${diagnostics.npx.version}` : '❌ Not found'}`,
    '',
  ];

  return lines.join('\n');
}
