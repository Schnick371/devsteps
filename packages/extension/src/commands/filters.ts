/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — filters: filterByStatus/Priority/Type, clearFilters, filterStatus toggles
 */

import * as vscode from 'vscode';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { checkDevStepsInitialized } from './helpers.js';

export function registerFilterCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevStepsTreeDataProvider | null
): void {
  // Filter by status
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterByStatus', async () => {
      const selected = await vscode.window.showQuickPick(
        [
          { label: '📝 Draft', value: 'draft' },
          { label: '📅 Planned', value: 'planned' },
          { label: '🚧 In Progress', value: 'in-progress' },
          { label: '👀 Review', value: 'review' },
          { label: '✅ Done', value: 'done' },
          { label: '🚫 Blocked', value: 'blocked' },
          { label: '❌ Cancelled', value: 'cancelled' },
          { label: '🗑️ Obsolete', value: 'obsolete' },
        ],
        { canPickMany: true, placeHolder: 'Select statuses to show (multiple selection)' }
      );
      if (!selected || !checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setStatusFilter(selected.map((s) => s.value));
      await vscode.commands.executeCommand(
        'setContext',
        'devsteps.filtersActive',
        treeDataProvider.isFiltersActive()
      );
    })
  );

  // Filter by priority
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterByPriority', async () => {
      const selected = await vscode.window.showQuickPick(
        [
          { label: '🔴 Critical', value: 'critical' },
          { label: '🟠 High', value: 'high' },
          { label: '🟡 Medium', value: 'medium' },
          { label: '⚪ Low', value: 'low' },
        ],
        { canPickMany: true, placeHolder: 'Select priorities to show (multiple selection)' }
      );
      if (!selected || !checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setPriorityFilter(selected.map((s) => s.value));
      await vscode.commands.executeCommand(
        'setContext',
        'devsteps.filtersActive',
        treeDataProvider.isFiltersActive()
      );
    })
  );

  // Filter by type
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterByType', async () => {
      const selected = await vscode.window.showQuickPick(
        [
          { label: 'Epic', value: 'epic' },
          { label: 'Story', value: 'story' },
          { label: 'Task', value: 'task' },
          { label: 'Bug', value: 'bug' },
          { label: 'Feature', value: 'feature' },
          { label: 'Requirement', value: 'requirement' },
          { label: 'Spike', value: 'spike' },
          { label: 'Test', value: 'test' },
          { label: 'Doc', value: 'doc' },
        ],
        { canPickMany: true, placeHolder: 'Select types to show (multiple selection)' }
      );
      if (!selected || !checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setTypeFilter(selected.map((s) => s.value));
      await vscode.commands.executeCommand(
        'setContext',
        'devsteps.filtersActive',
        treeDataProvider.isFiltersActive()
      );
    })
  );

  // Filter by eisenhower quadrant
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterByEisenhower', async () => {
      const selected = await vscode.window.showQuickPick(
        [
          { label: '🔥 Q1 — Urgent & Important (Do First)', value: 'urgent-important' },
          { label: '📅 Q2 — Not Urgent & Important (Schedule)', value: 'not-urgent-important' },
          { label: '📤 Q3 — Urgent & Not Important (Delegate)', value: 'urgent-not-important' },
          {
            label: '🗑️ Q4 — Not Urgent & Not Important (Eliminate)',
            value: 'not-urgent-not-important',
          },
        ],
        { canPickMany: true, placeHolder: 'Select Eisenhower quadrants to show (multiple selection)' }
      );
      if (!selected || !checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setEisenhowerFilter(selected.map((s) => s.value));
      await vscode.commands.executeCommand(
        'setContext',
        'devsteps.filtersActive',
        treeDataProvider.isFiltersActive()
      );
    })
  );

  // Filter by assignee
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterByAssignee', async () => {
      const input = await vscode.window.showInputBox({
        placeHolder: 'Enter assignee email (or leave blank to clear filter)',
        prompt: 'Filter items by assignee email address',
      });
      if (input === undefined || !checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setAssigneeFilter(input.trim() ? [input.trim()] : []);
      await vscode.commands.executeCommand(
        'setContext',
        'devsteps.filtersActive',
        treeDataProvider.isFiltersActive()
      );
    })
  );

  // Clear all filters
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.clearFilters', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.clearFilters();
      await vscode.commands.executeCommand('setContext', 'devsteps.filtersActive', false);
    })
  );

  // Filter status button — active (clear filters on click)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterStatus.active', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.clearFilters();
      await vscode.commands.executeCommand('setContext', 'devsteps.filtersActive', false);
      vscode.window.showInformationMessage('DevSteps: All filters cleared');
    })
  );

  // Filter status button — inactive (no active filters — registered to avoid VS Code errors)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.filterStatus.inactive', () => {
      /* no-op */
    })
  );
}
