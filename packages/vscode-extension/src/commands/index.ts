/**
 * Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)
 * Licensed under the Apache License, Version 2.0
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { addItem, getItem, updateItem, listItems } from '@devcrumbs/shared';
import type { DevCrumbsTreeDataProvider } from '../treeView/devcrumbsTreeDataProvider.js';
import { DashboardPanel } from '../webview/dashboardPanel.js';
import { logger } from '../outputChannel.js';

/**
 * Check if DevCrumbs is initialized in workspace
 */
function checkDevCrumbsInitialized(treeDataProvider: DevCrumbsTreeDataProvider | null): boolean {
  if (!treeDataProvider) {
    logger.warn('Command invoked but DevCrumbs not initialized (treeDataProvider is null)');
    vscode.window.showWarningMessage(
      'DevCrumbs not initialized. Please run "DevCrumbs: Initialize Project" first.'
    );
    return false;
  }
  return true;
}

/**
 * Register all extension commands
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevCrumbsTreeDataProvider | null,
): void {
  const initialSubscriptionsCount = context.subscriptions.length;
  logger.info(`Registering commands (treeDataProvider: ${treeDataProvider ? 'initialized' : 'null'})...`);
  
  // Show Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.showDashboard', () => {
      DashboardPanel.createOrShow(context.extensionUri);
    }),
  );

  // Refresh work items
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.refreshItems', () => {
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.refresh();
      vscode.window.showInformationMessage('DevCrumbs work items refreshed');
    }),
  );

  // View mode switching
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.viewMode.flat', () => {
      logger.debug('Command: devcrumbs.viewMode.flat invoked');
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('flat');
      vscode.window.showInformationMessage('Switched to Flat View');
      logger.info('View mode switched to flat');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.viewMode.hierarchical', () => {
      logger.debug('Command: devcrumbs.viewMode.hierarchical invoked');
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('hierarchical');
      vscode.window.showInformationMessage('Switched to Hierarchical View');
      logger.info('View mode switched to hierarchical');
    }),
  );

  // Hierarchy type switching
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.hierarchy.scrum', () => {
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('scrum');
      vscode.window.showInformationMessage('Showing Scrum Hierarchy');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.hierarchy.waterfall', () => {
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('waterfall');
      vscode.window.showInformationMessage('Showing Waterfall Hierarchy');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.hierarchy.both', () => {
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('both');
      vscode.window.showInformationMessage('Showing Both Hierarchies');
    }),
  );

  // Add work item
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.addItem', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      // Step 1: Select item type
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
        {
          placeHolder: 'Select work item type',
          title: 'Create New Work Item',
        },
      );

      if (!itemType) return;

      // Step 2: Enter title
      const title = await vscode.window.showInputBox({
        prompt: 'Enter work item title',
        placeHolder: 'e.g., Implement user authentication',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Title cannot be empty';
          }
          if (value.length > 200) {
            return 'Title must be 200 characters or less';
          }
          return null;
        },
      });

      if (!title) return;

      // Step 3: Enter description (optional)
      const description = await vscode.window.showInputBox({
        prompt: 'Enter description (optional, press Enter to skip)',
        placeHolder: 'Detailed description in Markdown format',
        value: '',
      });

      // Step 4: Select priority
      const priority = await vscode.window.showQuickPick(
        [
          { label: '🔴 Critical', value: 'critical', description: 'Must be done immediately' },
          { label: '🟠 High', value: 'high', description: 'Important, should be done soon' },
          { label: '🟡 Medium', value: 'medium', description: 'Normal priority' },
          { label: '⚪ Low', value: 'low', description: 'Nice to have' },
        ],
        {
          placeHolder: 'Select priority',
        },
      );

      if (!priority) return;

      try {
        // Create the work item
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const result = await addItem(devcrumbsPath, {
          type: itemType.value as any,
          title: title.trim(),
          description: description?.trim() || '',
          priority: priority.value as any,
        });

        if (treeDataProvider) {
          treeDataProvider.refresh();
        }
        vscode.window.showInformationMessage(`✅ Created ${itemType.label}: ${title}`);
        
        // Optionally open the created item
        const openItem = await vscode.window.showInformationMessage(
          `Open ${result.itemId}?`,
          'Open',
          'Later',
        );
        
        if (openItem === 'Open') {
          await vscode.commands.executeCommand('devcrumbs.openItem', result.itemId);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
  );

  // Open work item (markdown file)
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.openItem', async (node?: any) => {
      // Extract ID from different possible structures
      let itemId: string | undefined;
      
      if (typeof node === 'string') {
        itemId = node;
      } else if (node?.item?.id) {
        // WorkItemNode has item property
        itemId = node.item.id;
      } else if (node?.label) {
        // TreeItem has label property
        itemId = node.label.split(':')[0]?.trim();
      }
      
      if (!itemId) {
        vscode.window.showErrorMessage('No item ID provided');
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        // Get item metadata to determine type
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const itemResult = await getItem(devcrumbsPath, itemId);
        if (!itemResult.metadata) {
          vscode.window.showErrorMessage(`Item ${itemId} not found`);
          return;
        }

        const item = itemResult.metadata;
        const itemTypeFolder = `${item.type}s`; // e.g., 'tasks', 'stories'
        const mdPath = path.join(
          workspaceFolder.uri.fsPath,
          '.devcrumbs',
          itemTypeFolder,
          `${itemId}.md`,
        );

        // Open markdown file
        const mdUri = vscode.Uri.file(mdPath);
        const doc = await vscode.workspace.openTextDocument(mdUri);
        await vscode.window.showTextDocument(doc, {
          preview: true,
          viewColumn: vscode.ViewColumn.One,
        });
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error opening item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Update status
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.updateStatus', async (node?: any) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      // Extract ID from different possible structures
      let itemId: string | undefined;
      
      if (typeof node === 'string') {
        itemId = node;
      } else if (node?.item?.id) {
        // WorkItemNode has item property
        itemId = node.item.id;
      } else if (node?.label) {
        // TreeItem has label property
        itemId = node.label.split(':')[0]?.trim();
      }

      // If no itemId provided, let user search/select
      let targetItemId = itemId;
      if (!targetItemId) {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const allItems = await listItems(devcrumbsPath);

        if (!allItems.items || allItems.items.length === 0) {
          vscode.window.showErrorMessage('No work items found');
          return;
        }

        const selectedItem = await vscode.window.showQuickPick(
          allItems.items.map((item) => ({
            label: item.id,
            description: item.title,
            detail: `${item.type} | ${item.status} | ${item.priority}`,
            value: item.id,
          })),
          {
            placeHolder: 'Select work item to update',
          },
        );

        if (!selectedItem) return;
        targetItemId = selectedItem.value;
      }

      // Get current item status
      const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
      const itemResult = await getItem(devcrumbsPath, targetItemId);
      if (!itemResult.metadata) {
        vscode.window.showErrorMessage(`Item ${targetItemId} not found`);
        return;
      }

      const currentStatus = itemResult.metadata.status;

      // Select new status
      const newStatus = await vscode.window.showQuickPick(
        [
          { label: '📝 Draft', value: 'draft', description: 'Initial planning stage', current: currentStatus === 'draft' },
          { label: '📅 Planned', value: 'planned', description: 'Scheduled for implementation', current: currentStatus === 'planned' },
          { label: '🚧 In Progress', value: 'in-progress', description: 'Currently being worked on', current: currentStatus === 'in-progress' },
          { label: '👀 Review', value: 'review', description: 'Under review', current: currentStatus === 'review' },
          { label: '✅ Done', value: 'done', description: 'Completed', current: currentStatus === 'done' },
          { label: '🚫 Blocked', value: 'blocked', description: 'Blocked by dependencies', current: currentStatus === 'blocked' },
          { label: '❌ Cancelled', value: 'cancelled', description: 'Work cancelled', current: currentStatus === 'cancelled' },
          { label: '🗑️ Obsolete', value: 'obsolete', description: 'No longer relevant', current: currentStatus === 'obsolete' },
        ].map((status) => ({
          ...status,
          label: status.current ? `${status.label} (current)` : status.label,
        })),
        {
          placeHolder: `Update status for ${targetItemId}`,
        },
      );

      if (!newStatus || newStatus.value === currentStatus) {
        return; // No change or cancelled
      }

      try {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        await updateItem(devcrumbsPath, {
          id: targetItemId,
          status: newStatus.value as any,
        });

        treeDataProvider.refresh();
        vscode.window.showInformationMessage(
          `✅ Updated ${targetItemId} status: ${currentStatus} → ${newStatus.value}`,
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Search work items
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.searchItems', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      const searchQuery = await vscode.window.showInputBox({
        prompt: 'Search work items by title or ID',
        placeHolder: 'Enter search query...',
      });

      if (!searchQuery) return;

      try {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const allItems = await listItems(devcrumbsPath);

        if (!allItems.items || allItems.items.length === 0) {
          vscode.window.showInformationMessage('No work items found');
          return;
        }

        // Simple fuzzy search
        const query = searchQuery.toLowerCase();
        const matches = allItems.items.filter(
          (item) =>
            item.id.toLowerCase().includes(query) ||
            item.title.toLowerCase().includes(query),
        );

        if (matches.length === 0) {
          vscode.window.showInformationMessage(`No matches found for "${searchQuery}"`);
          return;
        }

        const selectedItem = await vscode.window.showQuickPick(
          matches.map((item) => ({
            label: `$(file) ${item.id}`,
            description: item.title,
            detail: `${item.type} | ${item.status} | ${item.priority}`,
            value: item.id,
          })),
          {
            placeHolder: `Found ${matches.length} match(es)`,
            title: 'Search Results',
          },
        );

        if (selectedItem) {
          await vscode.commands.executeCommand('devcrumbs.openItem', selectedItem.value);
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error searching items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Show project status
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.showStatus', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const allItems = await listItems(devcrumbsPath);

        if (!allItems.items) {
          vscode.window.showErrorMessage('Failed to load project status');
          return;
        }

        const items = allItems.items;
        const total = items.length;
        const byStatus = items.reduce(
          (acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        const byType = items.reduce(
          (acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const statusReport = `
📊 **DevCrumbs Project Status**

**Total Items:** ${total}

**By Status:**
- Draft: ${byStatus.draft || 0}
- Planned: ${byStatus.planned || 0}
- In Progress: ${byStatus['in-progress'] || 0}
- Review: ${byStatus.review || 0}
- Done: ${byStatus.done || 0}
- Blocked: ${byStatus.blocked || 0}
- Cancelled: ${byStatus.cancelled || 0}
- Obsolete: ${byStatus.obsolete || 0}

**By Type:**
${Object.entries(byType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}
        `.trim();

        vscode.window.showInformationMessage(statusReport, { modal: true });
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error loading status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Copy item ID to clipboard
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.copyId', async (node?: any) => {
      logger.debug('copyId command invoked', {
        nodeType: typeof node,
        constructor: node?.constructor?.name,
        hasItem: !!node?.item,
        hasLabel: !!node?.label,
        label: node?.label,
        itemId: node?.item?.id
      });
      
      // Extract ID from different possible structures
      let itemId: string | undefined;
      
      if (typeof node === 'string') {
        itemId = node;
      } else if (node?.item?.id) {
        // WorkItemNode has item property
        itemId = node.item.id;
      } else if (node?.label) {
        // TreeItem has label property
        itemId = node.label.split(':')[0]?.trim();
      }
      
      if (!itemId) {
        logger.error('copyId: Could not extract item ID from node', node);
        vscode.window.showErrorMessage('No item ID provided');
        return;
      }

      logger.info(`Copied item ID to clipboard: ${itemId}`);
      vscode.env.clipboard.writeText(itemId);
      vscode.window.showInformationMessage(`📋 Copied ${itemId} to clipboard`);
    }),
  );

  // Show item in file explorer
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.revealInExplorer', async (node?: any) => {
      // Extract ID from different possible structures
      let itemId: string | undefined;
      
      if (typeof node === 'string') {
        itemId = node;
      } else if (node?.item?.id) {
        // WorkItemNode has item property
        itemId = node.item.id;
      } else if (node?.label) {
        // TreeItem has label property
        itemId = node.label.split(':')[0]?.trim();
      }
      
      if (!itemId) {
        vscode.window.showErrorMessage('No item ID provided');
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const itemResult = await getItem(devcrumbsPath, itemId);
        if (!itemResult.metadata) {
          vscode.window.showErrorMessage(`Item ${itemId} not found`);
          return;
        }

        const item = itemResult.metadata;
        const itemTypeFolder = `${item.type}s`;
        const mdPath = path.join(
          workspaceFolder.uri.fsPath,
          '.devcrumbs',
          itemTypeFolder,
          `${itemId}.md`,
        );

        const mdUri = vscode.Uri.file(mdPath);
        await vscode.commands.executeCommand('revealInExplorer', mdUri);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error revealing item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Edit item properties (quick edit)
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.editProperties', async (node?: any) => {
      // Extract ID from different possible structures
      let itemId: string | undefined;
      
      if (typeof node === 'string') {
        itemId = node;
      } else if (node?.item?.id) {
        // WorkItemNode has item property
        itemId = node.item.id;
      } else if (node?.label) {
        // TreeItem has label property
        itemId = node.label.split(':')[0]?.trim();
      }
      
      if (!itemId) {
        vscode.window.showErrorMessage('No item ID provided');
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
        const itemResult = await getItem(devcrumbsPath, itemId);
        if (!itemResult.metadata) {
          vscode.window.showErrorMessage(`Item ${itemId} not found`);
          return;
        }

        const item = itemResult.metadata;

        // Select property to edit
        const property = await vscode.window.showQuickPick(
          [
            { label: '📝 Title', value: 'title', description: item.title },
            { label: '🎯 Priority', value: 'priority', description: item.priority },
            { label: '📊 Status', value: 'status', description: item.status },
            { label: '🏷️ Tags', value: 'tags', description: item.tags?.join(', ') || 'None' },
            { label: '👤 Assignee', value: 'assignee', description: item.assignee || 'Unassigned' },
          ],
          {
            placeHolder: `Edit properties for ${itemId}`,
          },
        );

        if (!property) return;

        let updatePayload: any = { id: itemId };

        switch (property.value) {
          case 'title': {
            const newTitle = await vscode.window.showInputBox({
              prompt: 'Enter new title',
              value: item.title,
              validateInput: (value) => {
                if (!value || value.trim().length === 0) return 'Title cannot be empty';
                if (value.length > 200) return 'Title must be 200 characters or less';
                return null;
              },
            });
            if (newTitle) updatePayload.title = newTitle.trim();
            break;
          }
          case 'priority': {
            const newPriority = await vscode.window.showQuickPick(
              [
                { label: '🔴 Critical', value: 'critical' },
                { label: '🟠 High', value: 'high' },
                { label: '🟡 Medium', value: 'medium' },
                { label: '⚪ Low', value: 'low' },
              ],
              { placeHolder: 'Select priority' },
            );
            if (newPriority) updatePayload.priority = newPriority.value;
            break;
          }
          case 'status': {
            await vscode.commands.executeCommand('devcrumbs.updateStatus', itemId);
            return; // Status update handled by separate command
          }
          case 'tags': {
            const newTags = await vscode.window.showInputBox({
              prompt: 'Enter tags (comma-separated)',
              value: item.tags?.join(', ') || '',
              placeHolder: 'frontend, typescript, bug',
            });
            if (newTags !== undefined) {
              updatePayload.tags =
                newTags.trim().length > 0 ? newTags.split(',').map((t) => t.trim()) : [];
            }
            break;
          }
          case 'assignee': {
            const newAssignee = await vscode.window.showInputBox({
              prompt: 'Enter assignee email',
              value: item.assignee || '',
              placeHolder: 'user@example.com',
            });
            if (newAssignee !== undefined) {
              updatePayload.assignee = newAssignee.trim();
            }
            break;
          }
        }

        // Only update if we have changes
        if (Object.keys(updatePayload).length > 1) {
          const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
          await updateItem(devcrumbsPath, updatePayload);
          if (treeDataProvider) {
            treeDataProvider.refresh();
          }
          vscode.window.showInformationMessage(`✅ Updated ${itemId}`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error editing item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // Filter by status
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.filterByStatus', async () => {
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
        {
          canPickMany: true,
          placeHolder: 'Select statuses to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevCrumbsInitialized(treeDataProvider)) return;
        treeDataProvider.setStatusFilter(selected.map((s) => s.value));
        vscode.window.showInformationMessage(`Filtered by status: ${selected.map((s) => s.label).join(', ')}`);
      }
    }),
  );

  // Filter by priority
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.filterByPriority', async () => {
      const selected = await vscode.window.showQuickPick(
        [
          { label: '🔴 Critical', value: 'critical' },
          { label: '🟠 High', value: 'high' },
          { label: '🟡 Medium', value: 'medium' },
          { label: '⚪ Low', value: 'low' },
        ],
        {
          canPickMany: true,
          placeHolder: 'Select priorities to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevCrumbsInitialized(treeDataProvider)) return;
        treeDataProvider.setPriorityFilter(selected.map((s) => s.value));
        vscode.window.showInformationMessage(`Filtered by priority: ${selected.map((s) => s.label).join(', ')}`);
      }
    }),
  );

  // Filter by type
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.filterByType', async () => {
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
        ],
        {
          canPickMany: true,
          placeHolder: 'Select types to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevCrumbsInitialized(treeDataProvider)) return;
        treeDataProvider.setTypeFilter(selected.map((s) => s.value));
        vscode.window.showInformationMessage(`Filtered by type: ${selected.map((s) => s.label).join(', ')}`);
      }
    }),
  );

  // Clear all filters
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.clearFilters', () => {
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.clearFilters();
      vscode.window.showInformationMessage('✨ All filters cleared');
    }),
  );

  // Toggle Hide Done Items
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.toggleHideDone', () => {
      logger.debug('Command: devcrumbs.toggleHideDone invoked');
      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.toggleHideDone();
      const isHidden = treeDataProvider.getHideDoneState();
      logger.info(`Hide done toggled: ${isHidden ? 'hidden' : 'visible'}`);
      vscode.window.showInformationMessage(
        isHidden ? '👁️ Completed items hidden' : '👁️ Completed items visible'
      );
    }),
  );

  // Sort options
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.sort', async () => {
      const sortBy = await vscode.window.showQuickPick(
        [
          { label: '🔢 ID', value: 'id' },
          { label: '📝 Title', value: 'title' },
          { label: '📅 Created Date', value: 'created' },
          { label: '🕐 Updated Date', value: 'updated' },
          { label: '⚡ Priority', value: 'priority' },
          { label: '📊 Status', value: 'status' },
        ],
        {
          placeHolder: 'Sort work items by...',
        },
      );

      if (!sortBy) return;

      const sortOrder = await vscode.window.showQuickPick(
        [
          { label: '⬆️ Ascending', value: 'asc' },
          { label: '⬇️ Descending', value: 'desc' },
        ],
        {
          placeHolder: 'Sort order',
        },
      );

      if (!sortOrder) return;

      if (!checkDevCrumbsInitialized(treeDataProvider)) return;
      treeDataProvider.setSortOptions(
        sortBy.value as any,
        sortOrder.value as 'asc' | 'desc',
      );
      vscode.window.showInformationMessage(`Sorted by ${sortBy.label} (${sortOrder.label})`);
    }),
  );

  // Output Channel Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.showOutput', () => {
      logger.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.clearOutput', () => {
      logger.clear();
    }),
  );
  
  const commandsRegistered = context.subscriptions.length - initialSubscriptionsCount;
  logger.info(`✓ Successfully registered ${commandsRegistered} commands`);
}
