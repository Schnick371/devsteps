/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI setup command
 * devsteps setup — interactive project configuration wizard
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

interface MCPConfig {
  servers: {
    [key: string]: {
      type: string;
      command: string;
      args: string[];
      env?: Record<string, string>;
    };
  };
}

/**
 * Detect which IDE is being used
 */
function detectIDE(): 'vscode' | 'cursor' | 'unknown' {
  const vscodePath = join(homedir(), '.vscode');
  const cursorPath = join(homedir(), '.cursor');

  if (existsSync(cursorPath)) {
    return 'cursor';
  }
  if (existsSync(vscodePath)) {
    return 'vscode';
  }
  return 'unknown';
}

/**
 * Get the MCP config path for the IDE
 */
function getMCPConfigPath(ide: string, isGlobal: boolean): string {
  if (isGlobal) {
    const home = homedir();
    if (ide === 'cursor') {
      return join(home, '.cursor', 'mcp.json');
    }
    return join(home, '.vscode', 'mcp.json');
  }

  return join(process.cwd(), '.vscode', 'mcp.json');
}

/**
 * Create MCP configuration for devsteps
 */
function createMCPConfig(projectRoot: string): MCPConfig {
  const distPath = join(projectRoot, 'packages', 'mcp-server', 'dist', 'index.js');

  return {
    servers: {
      devsteps: {
        type: 'stdio',
        command: 'node',
        args: [distPath],
        env: {
          NODE_ENV: 'development',
        },
      },
    },
  };
}

/**
 * Merge with existing MCP config
 */
function mergeWithExisting(existingPath: string, newConfig: MCPConfig): MCPConfig {
  if (!existsSync(existingPath)) {
    return newConfig;
  }

  try {
    const existing = JSON.parse(readFileSync(existingPath, 'utf-8'));
    return {
      servers: {
        ...existing.servers,
        ...newConfig.servers,
      },
    };
  } catch {
    return newConfig;
  }
}

/**
 * Setup command - Configure MCP for IDE
 */
export async function setupCommand(options: { tool?: string; global?: boolean }) {
  const spinner = ora('Setting up devstepsMCP server...').start();

  try {
    // Detect IDE if not specified
    let ide = options.tool || detectIDE();
    if (ide === 'unknown' && !options.tool) {
      spinner.warn('Could not detect IDE. Defaulting to VS Code.');
      ide = 'vscode';
    }

    spinner.text = `Setting up for ${ide}...`;

    // Get project root (where packages/ is)
    const projectRoot = process.cwd();
    const distPath = join(projectRoot, 'packages', 'mcp-server', 'dist', 'index.js');

    // Check if built
    if (!existsSync(distPath)) {
      spinner.fail('MCP server not built');
      console.log();
      console.log(chalk.yellow('Build the project first:'));
      console.log(chalk.cyan('  pnpm build'));
      console.log();
      process.exit(1);
    }

    // Get config path
    const isGlobal = options.global || false;
    const configPath = getMCPConfigPath(ide, isGlobal);
    const configDir = join(configPath, '..');

    // Create directory if needed
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Backup existing config
    if (existsSync(configPath)) {
      const backupPath = `${configPath}.backup`;
      writeFileSync(backupPath, readFileSync(configPath));
      spinner.text = 'Backed up existing config...';
    }

    // Create new config
    const newConfig = createMCPConfig(projectRoot);
    const finalConfig = mergeWithExisting(configPath, newConfig);

    // Write config
    writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));

    spinner.succeed('MCP server configured successfully!');
    console.log();
    console.log(chalk.green('✓'), 'IDE:', chalk.cyan(ide));
    console.log(chalk.green('✓'), 'Config:', chalk.cyan(configPath));
    console.log(chalk.green('✓'), 'Scope:', chalk.cyan(isGlobal ? 'global' : 'workspace'));

    if (existsSync(`${configPath}.backup`)) {
      console.log(chalk.gray('  Backup:'), `${configPath}.backup`);
    }

    console.log();
    console.log(chalk.yellow('Next steps:'));

    if (ide === 'vscode') {
      console.log('  1. Restart VS Code completely (Cmd/Ctrl+Q, then reopen)');
      console.log('  2. Open Copilot Chat (Cmd/Ctrl+Shift+I)');
      console.log('  3. Use devstepstools: @workspace #devsteps-init');
    } else if (ide === 'cursor') {
      console.log('  1. Restart Cursor completely');
      console.log('  2. Open AI Chat');
      console.log('  3. Use devstepstools');
    }

    console.log();
    console.log(chalk.gray('Test the setup:'));
    console.log(chalk.cyan('  devstepsinit test-project'));
    console.log(chalk.cyan('  devstepsstatus'));
  } catch (error: unknown) {
    spinner.fail('Setup failed');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}
