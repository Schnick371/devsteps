/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — view: refreshItems, viewMode, hierarchy, sort, collapseAll
 */

import * as vscode from 'vscode';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { checkDevStepsInitialized } from './helpers.js';

export function registerViewCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevStepsTreeDataProvider | null
): void {
  // Refresh work items
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.refreshItems', () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.refresh();
    })
  );

  // View mode — no-ops (already active)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.flat.active', () => { /* no-op */ })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.hierarchical.active', () => { /* no-op */ })
  );

  // View mode — inactive (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.flat.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('flat');
      await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'flat');
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.hierarchical.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('hierarchical');
      await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'hierarchical');
    })
  );

  // Hierarchy type — no-ops (already active)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.scrum.active', () => { /* no-op */ })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.waterfall.active', () => { /* no-op */ })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.both.active', () => { /* no-op */ })
  );

  // Hierarchy type — inactive (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.scrum.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('scrum');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'scrum');
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.waterfall.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('waterfall');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'waterfall');
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.both.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('both');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'both');
    })
  );

  // Collapse all items in the tree view
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.collapseAll', async () => {
      await vscode.commands.executeCommand(
        'workbench.actions.treeView.devsteps.itemsView.collapseAll'
      );
    })
  );

  // Toggle Hide Done Items
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideDone.active', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.toggleHideDone();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', treeDataProvider.getHideDoneState());
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideDone.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.toggleHideDone();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', treeDataProvider.getHideDoneState());
    })
  );

  // Show/Hide RelatesTo
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showRelatesTo.active', () => { /* no-op */ })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showRelatesTo.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      if (treeDataProvider.getHideRelatesToState()) treeDataProvider.toggleHideRelatesTo();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideRelatesTo.active', () => { /* no-op */ })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideRelatesTo.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      if (!treeDataProvider.getHideRelatesToState()) treeDataProvider.toggleHideRelatesTo();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', true);
    })
  );

  // Sort options
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.sort', async () => {
      const sortBy = await vscode.window.showQuickPick(
        [
          { label: '🔢 ID', value: 'id' },
          { label: '📝 Title', value: 'title' },
          { label: '📅 Created Date', value: 'created' },
          { label: '🕐 Updated Date', value: 'updated' },
          { label: '⚡ Priority', value: 'priority' },
          { label: '📊 Status', value: 'status' },
        ],
        { placeHolder: 'Sort work items by...' }
      );
      if (!sortBy) return;

      const sortOrder = await vscode.window.showQuickPick(
        [{ label: '⬆️ Ascending', value: 'asc' }, { label: '⬇️ Descending', value: 'desc' }],
        { placeHolder: 'Sort order' }
      );
      if (!sortOrder) return;

      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setSortOptions(
        sortBy.value as 'id' | 'title' | 'status' | 'priority' | 'updated',
        sortOrder.value as 'asc' | 'desc'
      );
    })
  );
}
