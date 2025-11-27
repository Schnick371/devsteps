/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * See LICENSE.md for full license text
 */

import * as vscode from 'vscode';
import { DevStepsTreeDataProvider } from './treeView/devstepsTreeDataProvider.js';
import { registerCommands } from './commands/index.js';
import { McpServerManager } from './mcpServerManager.js';
import { DevStepsDecorationProvider } from './decorationProvider.js';
import { logger } from './outputChannel.js';

/**
 * Check if .devsteps directory exists in workspace
 */
async function checkDevStepsDirectory(workspaceRoot: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(vscode.Uri.joinPath(workspaceRoot, '.devsteps'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Extension activation - called when extension is activated
 * Activation event: onStartupFinished (activates after VS Code fully loaded)
 */
export async function activate(context: vscode.ExtensionContext) {
  // CRITICAL: Set default context IMMEDIATELY before ANY other code
  // VS Code loads views from package.json BEFORE activate() runs
  // We must set context synchronously to prevent Welcome View flash
  await vscode.commands.executeCommand('setContext', 'devsteps.initialized', false);
  
  logger.info('DevSteps extension activating...');

  // Check for workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    logger.warn('No workspace folder open');
    // Still register commands even without workspace to avoid "command not found" errors
    registerCommands(context, null);
    logger.info('Commands registered (no workspace mode)');
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri;

  // Check for .devsteps directory and update context
  const hasDevSteps = await checkDevStepsDirectory(workspaceRoot);
  
  if (hasDevSteps) {
    logger.info('.devsteps directory found in workspace');
    // Update context to TRUE immediately
    await vscode.commands.executeCommand('setContext', 'devsteps.initialized', true);
  } else {
    logger.warn('No .devsteps directory found in workspace - TreeView will show welcome view');
    // Context already false from above
  }

  // Initialize TreeView - always create provider to avoid "no data provider" error
  // Provider will show empty state if .devsteps doesn't exist
  const treeDataProvider = new DevStepsTreeDataProvider(workspaceRoot);
  
  const treeView = vscode.window.createTreeView('devsteps.itemsView', {
    treeDataProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);
  
  // Register FileDecorationProvider for colored status badges
  const decorationProvider = new DevStepsDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );
  
  // Connect providers - tree refresh triggers decoration refresh
  treeDataProvider.setDecorationProvider(decorationProvider);
  treeDataProvider.setTreeView(treeView);

  // Register FileSystemWatcher for automatic TreeView refresh
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devsteps/**/*.json')
  );
  
  watcher.onDidCreate(() => treeDataProvider.refresh());
  watcher.onDidChange(() => treeDataProvider.refresh());
  watcher.onDidDelete(() => treeDataProvider.refresh());
  
  context.subscriptions.push(watcher);
  
  // Watch for .devsteps directory creation to initialize TreeView
  const devstepsirWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devsteps')
  );
  
  devstepsirWatcher.onDidCreate(async () => {
    logger.info('.devsteps directory created - refreshing TreeView and updating context');
    await vscode.commands.executeCommand('setContext', 'devsteps.initialized', true);
    treeDataProvider.refresh();
  });
  
  context.subscriptions.push(devstepsirWatcher);

  // Always register commands to avoid "command not found" errors
  registerCommands(context, treeDataProvider);

  // Initialize context keys for menu checkmarks
  await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'flat');
  await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'both');
  await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', false);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('devstepslogging')) {
        logger.updateLoggingLevel();
      }
    })
  );

  // Initialize and start MCP server
  try {
    const mcpManager = new McpServerManager(context);
    mcpManager.registerCommands();
    await mcpManager.start();
    logger.info('MCP Server initialized');
  } catch (error) {
    logger.error('Failed to initialize MCP Server', error);
  }

  // Show welcome message
  vscode.window.showInformationMessage('DevSteps extension activated');
  logger.info('DevSteps extension activated successfully');
}

/**
 * Extension deactivation - cleanup resources
 */
export function deactivate() {
  logger.info('DevSteps extension deactivating...');
  logger.dispose();
}
