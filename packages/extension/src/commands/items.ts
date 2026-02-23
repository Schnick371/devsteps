/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — item operations: addItem, openItem, searchItems
 */

import * as path from 'node:path';
import {
  addItem,
  type EisenhowerQuadrant,
  getItem,
  type ItemType,
  listItems,
  TYPE_TO_DIRECTORY,
} from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { extractItemId } from './helpers.js';

export function registerItemCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevStepsTreeDataProvider | null
): void {
  // Add work item
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.addItem', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) { vscode.window.showErrorMessage('No workspace folder open'); return; }

      const itemType = await vscode.window.showQuickPick(
        [
          { label: 'Epic', value: 'epic', description: 'Large initiative spanning multiple stories' },
          { label: 'Story', value: 'story', description: 'User story or feature requirement' },
          { label: 'Task', value: 'task', description: 'Technical task or implementation work' },
          { label: 'Bug', value: 'bug', description: 'Bug fix or defect' },
          { label: 'Feature', value: 'feature', description: 'New feature implementation' },
          { label: 'Requirement', value: 'requirement', description: 'Business requirement' },
          { label: 'Spike', value: 'spike', description: 'Research or investigation task' },
          { label: 'Test', value: 'test', description: 'Test case or testing task' },
        ],
        { placeHolder: 'Select work item type', title: 'Create New Work Item' }
      );
      if (!itemType) return;

      const title = await vscode.window.showInputBox({
        prompt: 'Enter work item title',
        placeHolder: 'e.g., Implement user authentication',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) return 'Title cannot be empty';
          if (value.length > 200) return 'Title must be 200 characters or less';
          return null;
        },
      });
      if (!title) return;

      const description = await vscode.window.showInputBox({
        prompt: 'Enter description (optional, press Enter to skip)',
        placeHolder: 'Detailed description in Markdown format',
        value: '',
      });

      const priority = await vscode.window.showQuickPick(
        [
          { label: '🔴 Urgent & Important', value: 'urgent-important', description: 'Do first (Q1)' },
          { label: '🟠 Important, not urgent', value: 'not-urgent-important', description: 'Schedule (Q2)' },
          { label: '🟡 Urgent, not important', value: 'urgent-not-important', description: 'Delegate (Q3)' },
          { label: '⚪ Neither', value: 'not-urgent-not-important', description: 'Eliminate (Q4)' },
        ],
        { placeHolder: 'Select priority (Eisenhower Matrix)' }
      );
      if (!priority) return;

      try {
        const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const result = await addItem(devstepsPath, {
          type: itemType.value as ItemType,
          title: title.trim(),
          description: description?.trim() || '',
          priority: priority.value as EisenhowerQuadrant,
        });
        if (treeDataProvider) treeDataProvider.refresh();

        const openChoice = await vscode.window.showInformationMessage(`Open ${result.itemId}?`, 'Open', 'Later');
        if (openChoice === 'Open') {
          await vscode.commands.executeCommand('devsteps.openItem', result.itemId);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
  );

  // Open work item (markdown file)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.openItem',
      async (node?: string | { item?: { id: string }; label?: string }) => {
        const itemId = extractItemId(node);
        if (!itemId) { vscode.window.showErrorMessage('No item ID provided'); return; }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) { vscode.window.showErrorMessage('No workspace folder open'); return; }

        try {
          const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
          const itemResult = await getItem(devstepsPath, itemId);
          if (!itemResult.metadata) { vscode.window.showErrorMessage(`Item ${itemId} not found`); return; }

          const item = itemResult.metadata;
          const folder = TYPE_TO_DIRECTORY[item.type as keyof typeof TYPE_TO_DIRECTORY];
          const mdPath = path.join(workspaceFolder.uri.fsPath, '.devsteps', folder, `${itemId}.md`);
          const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mdPath));
          await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.One });
        } catch (error) {
          vscode.window.showErrorMessage(`Error opening item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    )
  );

  // Search work items
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.searchItems', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) { vscode.window.showErrorMessage('No workspace folder open'); return; }

      const searchQuery = await vscode.window.showInputBox({
        prompt: 'Search work items by title or ID',
        placeHolder: 'Enter search query...',
      });
      if (!searchQuery) return;

      try {
        const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const allItems = await listItems(devstepsPath);
        if (!allItems.items || allItems.items.length === 0) {
          vscode.window.showInformationMessage('No work items found');
          return;
        }

        const query = searchQuery.toLowerCase();
        const matches = allItems.items.filter(
          (item) => item.id.toLowerCase().includes(query) || item.title.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          vscode.window.showInformationMessage(`No matches found for "${searchQuery}"`);
          return;
        }

        const selectedItem = await vscode.window.showQuickPick(
          matches.map((item) => ({ label: `$(file) ${item.id}`, description: item.title, detail: `${item.type} | ${item.status}`, value: item.id })),
          { placeHolder: `Found ${matches.length} match(es)`, title: 'Search Results' }
        );
        if (selectedItem) {
          await vscode.commands.executeCommand('devsteps.openItem', selectedItem.value);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
  );
}
