/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * See LICENSE.md for full license text
 */

import * as vscode from 'vscode';
import { DevStepsTreeDataProvider } from './treeView/devstepsTreeDataProvider.js';
import { TreeViewStateManager } from './utils/stateManager.js';
import { registerCommands } from './commands/index.js';
import { McpServerManager } from './mcpServerManager.js';
import { DevStepsDecorationProvider } from './decorationProvider.js';
import { logger } from './outputChannel.js';

/**
 * Extension activation - called when extension is activated
 * Activation event: "*" (activates immediately on VS Code startup)
 * 
 * This prevents Welcome View flash by ensuring extension loads before view renders.
 * We check for .devsteps directory and set context accordingly.
 */
export async function activate(context: vscode.ExtensionContext) {
  logger.info('DevSteps extension activating...');

  // Check for workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    logger.warn('No workspace folder open');
    // Set context keys IMMEDIATELY to prevent Welcome View flash
    await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', true);
    await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', false);
    await vscode.commands.executeCommand('setContext', 'devsteps.initialized', false);
    // Still register commands even without workspace to avoid "command not found" errors
    registerCommands(context, null);
    logger.info('Commands registered (no workspace mode)');
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri;
  
  // Check if .devsteps directory exists
  const devstepsPath = vscode.Uri.joinPath(workspaceRoot, '.devsteps');
  let hasDevSteps = false;
  try {
    await vscode.workspace.fs.stat(devstepsPath);
    hasDevSteps = true;
  } catch {
    hasDevSteps = false;
  }
  
  // CRITICAL: Set context keys IMMEDIATELY - BEFORE any UI operations!
  // This prevents Welcome View from appearing even briefly
  // devsteps.showWelcome controls viewsWelcome visibility in package.json
  await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', !hasDevSteps);
  await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', hasDevSteps);
  await vscode.commands.executeCommand('setContext', 'devsteps.initialized', hasDevSteps);
  
  // Initialize and start MCP server ALWAYS (even without .devsteps)
  // MCP tools work globally and can initialize projects
  try {
    const mcpManager = new McpServerManager(context);
    mcpManager.registerCommands();
    await mcpManager.start();
    logger.info('MCP Server initialized');
  } catch (error) {
    logger.error('Failed to initialize MCP Server', error);
  }

  // Watch for .devsteps directory creation BEFORE early return
  // This ensures MCP init triggers smooth activation even when project doesn't exist yet
  const devstepsWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devsteps')
  );
  
  devstepsWatcher.onDidCreate(async () => {
    logger.info('.devsteps directory created - initializing TreeView');
    
    // Update context keys to hide Welcome View and show TreeView
    await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', false);
    await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', true);
    await vscode.commands.executeCommand('setContext', 'devsteps.initialized', true);
    
    // Create and initialize TreeDataProvider
    const stateManager = new TreeViewStateManager(context.workspaceState);
    const treeDataProvider = new DevStepsTreeDataProvider(workspaceRoot, stateManager);
    await treeDataProvider.initialize();
    
    // Create TreeView
    const treeView = vscode.window.createTreeView('devsteps.itemsView', {
      treeDataProvider,
      showCollapseAll: true,
    });
    context.subscriptions.push(treeView);
    
    // Register FileDecorationProvider
    const decorationProvider = new DevStepsDecorationProvider();
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(decorationProvider)
    );
    
    // Connect providers
    treeDataProvider.setDecorationProvider(decorationProvider);
    treeDataProvider.setTreeView(treeView);
    
    // Register FileSystemWatcher for TreeView refresh
    const itemsWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, '.devsteps/**/*.json')
    );
    itemsWatcher.onDidCreate(() => treeDataProvider.refresh());
    itemsWatcher.onDidChange(() => treeDataProvider.refresh());
    itemsWatcher.onDidDelete(() => treeDataProvider.refresh());
    context.subscriptions.push(itemsWatcher);
    
    // Register commands with TreeDataProvider
    registerCommands(context, treeDataProvider);
    
    // Sync context keys
    const actualViewMode = treeDataProvider.getViewMode();
    const actualHierarchy = treeDataProvider.getHierarchyType();
    const actualHideDone = treeDataProvider.getHideDoneState();
    await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', actualViewMode);
    await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', actualHierarchy);
    await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', actualHideDone);
    
    logger.info('DevSteps project initialized successfully');
  });
  
  context.subscriptions.push(devstepsWatcher);

  if (!hasDevSteps) {
    logger.info('No .devsteps directory found - showing welcome view');
    // Still register commands so "Initialize Project" button works
    registerCommands(context, null);
    return;
  }

  // Create TreeDataProvider with StateManager and pre-initialize to avoid "no data provider" flash
  const stateManager = new TreeViewStateManager(context.workspaceState);
  const treeDataProvider = new DevStepsTreeDataProvider(workspaceRoot, stateManager);
  logger.info('TreeDataProvider created with state persistence, initializing...');
  
  // CRITICAL: Initialize BEFORE creating TreeView to populate data cache
  await treeDataProvider.initialize();
  logger.info('TreeDataProvider initialized with data');

  // Create TreeView AFTER initialization - data is ready, no flash
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

  // Always register commands to avoid "command not found" errors
  registerCommands(context, treeDataProvider);

  // Sync context keys with actual persisted state (not static defaults)
  const actualViewMode = treeDataProvider.getViewMode();
  const actualHierarchy = treeDataProvider.getHierarchyType();
  const actualHideDone = treeDataProvider.getHideDoneState();
  
  await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', actualViewMode);
  await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', actualHierarchy);
  await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', actualHideDone);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('devstepslogging')) {
        logger.updateLoggingLevel();
      }
    })
  );

  logger.info('DevSteps extension activated successfully');
}

/**
 * Extension deactivation - cleanup resources
 */
export function deactivate() {
  logger.info('DevSteps extension deactivating...');
  logger.dispose();
}
