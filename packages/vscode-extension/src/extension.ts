/**
 * Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)
 * Licensed under the Apache License, Version 2.0
 * See LICENSE.md for full license text
 */

import * as vscode from 'vscode';
import { DevCrumbsTreeDataProvider } from './treeView/devcrumbsTreeDataProvider.js';
import { registerCommands } from './commands/index.js';
import { McpServerManager } from './mcpServerManager.js';
import { DevCrumbsDecorationProvider } from './decorationProvider.js';
import { logger } from './outputChannel.js';

/**
 * Extension activation - called when extension is activated
 * Activation events: onStartupFinished, workspaceContains:.devcrumbs
 */
export async function activate(context: vscode.ExtensionContext) {
  logger.info('DevCrumbs extension activating...');

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

  // Check for .devcrumbs directory
  try {
    await vscode.workspace.fs.stat(vscode.Uri.joinPath(workspaceRoot, '.devcrumbs'));
    logger.info('.devcrumbs directory found in workspace');
  } catch (error) {
    logger.warn('No .devcrumbs directory found in workspace - TreeView will show empty state');
  }

  // Initialize TreeView - always create provider to avoid "no data provider" error
  // Provider will show empty state if .devcrumbs doesn't exist
  const treeDataProvider = new DevCrumbsTreeDataProvider(workspaceRoot);
  
  const treeView = vscode.window.createTreeView('devcrumbs.itemsView', {
    treeDataProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);
  
  // Pass TreeView to provider for description badge updates
  treeDataProvider.setTreeView(treeView);
  
  // Register FileDecorationProvider for status badges
  const decorationProvider = new DevCrumbsDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );

  // Register FileSystemWatcher for automatic TreeView refresh
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devcrumbs/**/*.json')
  );
  
  watcher.onDidCreate(() => treeDataProvider.refresh());
  watcher.onDidChange(() => treeDataProvider.refresh());
  watcher.onDidDelete(() => treeDataProvider.refresh());
  
  context.subscriptions.push(watcher);
  
  // Watch for .devcrumbs directory creation to initialize TreeView
  const devcrumbsDirWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devcrumbs')
  );
  
  devcrumbsDirWatcher.onDidCreate(() => {
    logger.info('.devcrumbs directory created - refreshing TreeView');
    treeDataProvider.refresh();
  });
  
  context.subscriptions.push(devcrumbsDirWatcher);

  // Always register commands to avoid "command not found" errors
  registerCommands(context, treeDataProvider);

  // Initialize context keys for menu checkmarks
  await vscode.commands.executeCommand('setContext', 'devcrumbs.viewMode', 'flat');
  await vscode.commands.executeCommand('setContext', 'devcrumbs.hierarchy', 'both');
  await vscode.commands.executeCommand('setContext', 'devcrumbs.hideDone', false);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('devcrumbs.logging')) {
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
  vscode.window.showInformationMessage('DevCrumbs extension activated');
  logger.info('DevCrumbs extension activated successfully');
}

/**
 * Extension deactivation - cleanup resources
 */
export function deactivate() {
  logger.info('DevCrumbs extension deactivating...');
  logger.dispose();
}
