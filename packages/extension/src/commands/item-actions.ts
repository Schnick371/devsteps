/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — item actions: updateStatus, copyId, revealInExplorer, editProperties
 */

import * as path from 'node:path';
import {
  getItem,
  type ItemStatus,
  listItems,
  STATUS,
  TYPE_TO_DIRECTORY,
  type UpdateItemArgs,
  updateItem,
} from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import { logger } from '../outputChannel.js';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { checkDevStepsInitialized, extractItemId } from './helpers.js';

export function registerItemActionCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevStepsTreeDataProvider | null
): void {
  // Update status
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.updateStatus',
      async (node?: string | { item?: { id: string }; label?: string }) => {
        if (!checkDevStepsInitialized(treeDataProvider)) return;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) { vscode.window.showErrorMessage('No workspace folder open'); return; }

        let targetItemId = extractItemId(node);

        if (!targetItemId) {
          let allItems: Awaited<ReturnType<typeof listItems>>;
          try {
            allItems = await listItems(path.join(workspaceFolder.uri.fsPath, '.devsteps'));
          } catch (error) {
            vscode.window.showErrorMessage(`DevSteps: Failed to load items — ${error instanceof Error ? error.message : 'Unknown error'}`);
            return;
          }
          if (!allItems.items || allItems.items.length === 0) { vscode.window.showErrorMessage('No work items found'); return; }

          const selectedItem = await vscode.window.showQuickPick(
            allItems.items.map((item) => ({ label: item.id, description: item.title, detail: `${item.type} | ${item.status}`, value: item.id })),
            { placeHolder: 'Select work item to update' }
          );
          if (!selectedItem) return;
          targetItemId = selectedItem.value;
        }

        let itemResult: Awaited<ReturnType<typeof getItem>>;
        try {
          itemResult = await getItem(path.join(workspaceFolder.uri.fsPath, '.devsteps'), targetItemId);
        } catch (error) {
          vscode.window.showErrorMessage(`DevSteps: Failed to load item ${targetItemId} — ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
        if (!itemResult.metadata) { vscode.window.showErrorMessage(`Item ${targetItemId} not found`); return; }

        const currentStatus = itemResult.metadata.status;
        const STATUSES = [
          { label: '📝 Draft', value: STATUS.DRAFT, description: 'Initial planning stage' },
          { label: '📅 Planned', value: STATUS.PLANNED, description: 'Scheduled' },
          { label: '🚧 In Progress', value: STATUS.IN_PROGRESS, description: 'Currently being worked on' },
          { label: '👀 Review', value: STATUS.REVIEW, description: 'Under review' },
          { label: '✅ Done', value: STATUS.DONE, description: 'Completed' },
          { label: '🚫 Blocked', value: STATUS.BLOCKED, description: 'Blocked by dependencies' },
          { label: '❌ Cancelled', value: STATUS.CANCELLED, description: 'Work cancelled' },
          { label: '🗑️ Obsolete', value: STATUS.OBSOLETE, description: 'No longer relevant' },
        ];

        const newStatus = await vscode.window.showQuickPick(
          STATUSES.map((s) => ({ ...s, label: s.value === currentStatus ? `${s.label} (current)` : s.label })),
          { placeHolder: `Update status for ${targetItemId}` }
        );
        if (!newStatus || newStatus.value === currentStatus) return;

        try {
          await updateItem(path.join(workspaceFolder.uri.fsPath, '.devsteps'), { id: targetItemId, status: newStatus.value as ItemStatus });
          treeDataProvider.refresh();
          vscode.window.showInformationMessage(`✅ Updated ${targetItemId}: ${currentStatus} → ${newStatus.value}`);
        } catch (error) {
          vscode.window.showErrorMessage(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    )
  );

  // Copy item ID to clipboard
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.copyId',
      async (node?: string | { item?: { id: string }; label?: string }) => {
        const itemId = extractItemId(node);
        if (!itemId) { vscode.window.showErrorMessage('No item ID provided'); return; }
        vscode.env.clipboard.writeText(itemId);
        logger.info(`Copied ${itemId} to clipboard`);
      }
    )
  );

  // Reveal item in explorer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.revealInExplorer',
      async (node?: string | { item?: { id: string }; label?: string }) => {
        const itemId = extractItemId(node);
        if (!itemId) { vscode.window.showErrorMessage('No item ID provided'); return; }
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) { vscode.window.showErrorMessage('No workspace folder open'); return; }

        try {
          const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
          const itemResult = await getItem(devstepsPath, itemId);
          if (!itemResult.metadata) { vscode.window.showErrorMessage(`Item ${itemId} not found`); return; }
          const folder = TYPE_TO_DIRECTORY[itemResult.metadata.type as keyof typeof TYPE_TO_DIRECTORY];
          const mdPath = path.join(workspaceFolder.uri.fsPath, '.devsteps', folder, `${itemId}.md`);
          await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(mdPath));
        } catch (error) {
          vscode.window.showErrorMessage(`Error revealing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    )
  );

  // Edit item properties
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.editProperties',
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

          const property = await vscode.window.showQuickPick(
            [
              { label: '📝 Title', value: 'title', description: item.title },
              { label: '🎯 Priority', value: 'priority', description: item.priority },
              { label: '📊 Status', value: 'status', description: item.status },
              { label: '🏷️ Tags', value: 'tags', description: item.tags?.join(', ') || 'None' },
              { label: '👤 Assignee', value: 'assignee', description: item.assignee || 'Unassigned' },
            ],
            { placeHolder: `Edit properties for ${itemId}` }
          );
          if (!property) return;

          const updatePayload: Partial<UpdateItemArgs> & { id: string } = { id: itemId };

          if (property.value === 'status') {
            await vscode.commands.executeCommand('devsteps.updateStatus', itemId);
            return;
          } else if (property.value === 'title') {
            const newTitle = await vscode.window.showInputBox({ prompt: 'Enter new title', value: item.title, validateInput: (v) => (!v?.trim() ? 'Title cannot be empty' : v.length > 200 ? 'Max 200 chars' : null) });
            if (newTitle) updatePayload.title = newTitle.trim();
          } else if (property.value === 'priority') {
            const np = await vscode.window.showQuickPick(
              [{ label: '🔴 Urgent & Important', value: 'urgent-important' }, { label: '🟠 Not urgent, important', value: 'not-urgent-important' }, { label: '🟡 Urgent, not important', value: 'urgent-not-important' }, { label: '⚪ Neither', value: 'not-urgent-not-important' }],
              { placeHolder: 'Select priority' }
            );
            if (np) updatePayload.priority = np.value;
          } else if (property.value === 'tags') {
            const newTags = await vscode.window.showInputBox({ prompt: 'Tags (comma-separated)', value: item.tags?.join(', ') || '', placeHolder: 'frontend, typescript' });
            if (newTags !== undefined) updatePayload.tags = newTags.trim().length > 0 ? newTags.split(',').map((t) => t.trim()) : [];
          } else if (property.value === 'assignee') {
            const newAssignee = await vscode.window.showInputBox({ prompt: 'Enter assignee email', value: item.assignee || '', placeHolder: 'user@example.com' });
            if (newAssignee !== undefined) updatePayload.assignee = newAssignee.trim();
          }

          if (Object.keys(updatePayload).length > 1) {
            await updateItem(devstepsPath, updatePayload);
            if (treeDataProvider) treeDataProvider.refresh();
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error editing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    )
  );
}
