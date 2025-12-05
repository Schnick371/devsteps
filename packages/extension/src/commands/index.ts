/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { addItem, getItem, updateItem, listItems, TYPE_TO_DIRECTORY } from '@schnick371/devsteps-shared';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { DashboardPanel } from '../webview/dashboardPanel.js';
import { logger } from '../outputChannel.js';
import { detectMcpRuntime, formatDiagnostics } from '../utils/runtimeDetector.js';

/**
 * Check if DevSteps is initialized in workspace
 */
function checkDevStepsInitialized(treeDataProvider: DevStepsTreeDataProvider | null): treeDataProvider is DevStepsTreeDataProvider {
  if (!treeDataProvider) {
    logger.warn('Command invoked but DevSteps not initialized (treeDataProvider is null)');
    vscode.window.showWarningMessage(
      'DevSteps not initialized. Please run "DevSteps: Initialize Project" first.'
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
  treeDataProvider: DevStepsTreeDataProvider | null,
): void {
  // Initialize DevSteps Project
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.initProject', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
        return;
      }

      const projectName = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        value: path.basename(workspaceFolders[0].uri.fsPath),
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Project name cannot be empty';
          }
          return undefined;
        },
      });

      if (!projectName) return;

      const methodology = await vscode.window.showQuickPick(
        [
          { label: 'Scrum', value: 'scrum', description: 'Epics → Stories → Tasks' },
          { label: 'Waterfall', value: 'waterfall', description: 'Requirements → Features → Tasks' },
          { label: 'Hybrid', value: 'hybrid', description: 'Both Scrum and Waterfall' },
        ],
        {
          placeHolder: 'Select project methodology',
        },
      );

      if (!methodology) return;

      // Show initialization options
      const choice = await vscode.window.showInformationMessage(
        `Initialize DevSteps project "${projectName}" with ${methodology.label} methodology?`,
        { modal: true },
        'Use Copilot Chat',
        'Use CLI'
      );

      if (choice === 'Use Copilot Chat') {
        // Open Copilot Chat with init command
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: `@devsteps #mcp_devsteps_devsteps-init ${projectName} --methodology ${methodology.value}`,
        });
      } else if (choice === 'Use CLI') {
        // Check if CLI is installed
        const terminal = vscode.window.createTerminal('DevSteps Init');
        terminal.show();
        
        // Use npx for zero-configuration CLI execution (no installation needed!)
        terminal.sendText('echo "🚀 Running DevSteps CLI via npx (zero-configuration)..."');
        terminal.sendText(`npx @schnick371/devsteps-cli init ${projectName} --methodology ${methodology.value}`);
      }
    }),
  );

  // Show Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showDashboard', () => {
      DashboardPanel.createOrShow(context.extensionUri);
    }),
  );

  // Check Prerequisites
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.checkPrerequisites', async () => {
      logger.info('=== DevSteps Prerequisites Check ===');
      logger.info('');
      
      // Show progress indicator
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Checking DevSteps prerequisites...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0, message: 'Detecting Node.js runtime...' });
          
          // Detect runtime
          const bundledServerPath = path.join(context.extensionPath, 'dist', 'mcp-server.js');
          const runtimeConfig = await detectMcpRuntime(bundledServerPath);
          
          progress.report({ increment: 50, message: 'Analyzing results...' });
          
          // Log full diagnostics
          logger.info(formatDiagnostics(runtimeConfig.diagnostics));
          
          // Determine overall status
          const { node, npm, npx } = runtimeConfig.diagnostics;
          const allAvailable = node.available && npm.available && npx.available;
          const partialAvailable = node.available || npm.available;
          
          // Build result message
          const resultLines: string[] = [];
          resultLines.push('**Prerequisites Check Results:**');
          resultLines.push('');
          
          // Node.js
          if (node.available) {
            resultLines.push(`✅ Node.js: ${node.version}`);
            resultLines.push(`   Path: ${node.path}`);
          } else {
            resultLines.push('❌ Node.js: Not found');
          }
          
          // npm
          if (npm.available) {
            resultLines.push(`✅ npm: ${npm.version}`);
          } else {
            resultLines.push('❌ npm: Not found');
          }
          
          // npx
          if (npx.available) {
            resultLines.push(`✅ npx: ${npx.version}`);
          } else {
            resultLines.push('❌ npx: Not found');
          }
          
          resultLines.push('');
          
          // MCP Runtime Strategy
          resultLines.push('**MCP Server Strategy:**');
          if (runtimeConfig.strategy === 'npx') {
            resultLines.push('✅ Will use npx (auto-install from npm registry)');
          } else if (runtimeConfig.strategy === 'node') {
            resultLines.push('⚠️  Will use node + bundled server (npx unavailable)');
          } else {
            resultLines.push('❌ No compatible runtime available');
          }
          
          progress.report({ increment: 100 });
          
          // Show results
          logger.info(resultLines.join('\n'));
          logger.info('');
          logger.info('Check complete!');
          logger.show();
          
          // Show appropriate message
          if (allAvailable) {
            vscode.window.showInformationMessage(
              '✅ All prerequisites satisfied! DevSteps MCP Server will use npx.',
              'OK'
            );
          } else if (partialAvailable) {
            vscode.window.showWarningMessage(
              '⚠️ Some prerequisites missing. Check output for details.',
              'Show Output',
              'Install Node.js'
            ).then((selection) => {
              if (selection === 'Show Output') {
                logger.show();
              } else if (selection === 'Install Node.js') {
                vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/'));
              }
            });
          } else {
            vscode.window.showErrorMessage(
              '❌ Node.js not found. DevSteps MCP Server requires Node.js.',
              'Install Node.js',
              'Show Output'
            ).then((selection) => {
              if (selection === 'Install Node.js') {
                vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/'));
              } else if (selection === 'Show Output') {
                logger.show();
              }
            });
          }
        }
      );
    }),
  );

  // Refresh work items
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.refreshItems', () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.refresh();
    }),
  );

  // View mode switching - Active commands (no-op, already active)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.flat.active', () => {
      // No-op - already active
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.hierarchical.active', () => {
      // No-op - already active
    }),
  );

  // View mode switching - Inactive commands (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.flat.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('flat');
      await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'flat');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.viewMode.hierarchical.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setViewMode('hierarchical');
      await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'hierarchical');
    }),
  );

  // Hierarchy type switching - Active commands (no-op, already active)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.scrum.active', () => {
      // No-op - already active
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.waterfall.active', () => {
      // No-op - already active
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.both.active', () => {
      // No-op - already active
    }),
  );

  // Hierarchy type switching - Inactive commands (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.scrum.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('scrum');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'scrum');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.waterfall.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('waterfall');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'waterfall');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hierarchy.both.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setHierarchyType('both');
      await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', 'both');
    }),
  );

  // Add work item
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.addItem', async () => {
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const result = await addItem(devstepsath, {
          type: itemType.value as any,
          title: title.trim(),
          description: description?.trim() || '',
          priority: priority.value as any,
        });

        if (treeDataProvider) {
          treeDataProvider.refresh();
        }
        
        // Optionally open the created item
        const openItem = await vscode.window.showInformationMessage(
          `Open ${result.itemId}?`,
          'Open',
          'Later',
        );
        
        if (openItem === 'Open') {
          await vscode.commands.executeCommand('devsteps.openItem', result.itemId);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
  );

  // Open work item (markdown file)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.openItem', async (node?: any) => {
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const itemResult = await getItem(devstepsath, itemId);
        if (!itemResult.metadata) {
          vscode.window.showErrorMessage(`Item ${itemId} not found`);
          return;
        }

        const item = itemResult.metadata;
        const itemTypeFolder = TYPE_TO_DIRECTORY[item.type as keyof typeof TYPE_TO_DIRECTORY];
        const mdPath = path.join(
          workspaceFolder.uri.fsPath,
          '.devsteps',
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
    vscode.commands.registerCommand('devsteps.updateStatus', async (node?: any) => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const allItems = await listItems(devstepsath);

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
      const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
      const itemResult = await getItem(devstepsath, targetItemId);
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        await updateItem(devstepsath, {
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
    vscode.commands.registerCommand('devsteps.searchItems', async () => {
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const allItems = await listItems(devstepsath);

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
          await vscode.commands.executeCommand('devsteps.openItem', selectedItem.value);
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
    vscode.commands.registerCommand('devsteps.showStatus', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const allItems = await listItems(devstepsath);

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
📊 **DevSteps Project Status**

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
    vscode.commands.registerCommand('devsteps.copyId', async (node?: any) => {
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

      vscode.env.clipboard.writeText(itemId);
      logger.info(`Copied ${itemId} to clipboard`);
    }),
  );

  // Show item in file explorer
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.revealInExplorer', async (node?: any) => {
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const itemResult = await getItem(devstepsath, itemId);
        if (!itemResult.metadata) {
          vscode.window.showErrorMessage(`Item ${itemId} not found`);
          return;
        }

        const item = itemResult.metadata;
        const itemTypeFolder = TYPE_TO_DIRECTORY[item.type as keyof typeof TYPE_TO_DIRECTORY];
        const mdPath = path.join(
          workspaceFolder.uri.fsPath,
          '.devsteps',
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
    vscode.commands.registerCommand('devsteps.editProperties', async (node?: any) => {
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
        const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const itemResult = await getItem(devstepsath, itemId);
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
            await vscode.commands.executeCommand('devsteps.updateStatus', itemId);
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
          const devstepsath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
          await updateItem(devstepsath, updatePayload);
          if (treeDataProvider) {
            treeDataProvider.refresh();
          }
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
        {
          canPickMany: true,
          placeHolder: 'Select statuses to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevStepsInitialized(treeDataProvider)) return;
        treeDataProvider.setStatusFilter(selected.map((s) => s.value));
      }
    }),
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
        {
          canPickMany: true,
          placeHolder: 'Select priorities to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevStepsInitialized(treeDataProvider)) return;
        treeDataProvider.setPriorityFilter(selected.map((s) => s.value));
      }
    }),
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
        ],
        {
          canPickMany: true,
          placeHolder: 'Select types to show (multiple selection)',
        },
      );

      if (selected) {
        if (!checkDevStepsInitialized(treeDataProvider)) return;
        treeDataProvider.setTypeFilter(selected.map((s) => s.value));
      }
    }),
  );

  // Clear all filters
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.clearFilters', () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.clearFilters();
    }),
  );

  // Toggle Hide Done Items - Active command (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideDone.active', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.toggleHideDone();
      const isHidden = treeDataProvider.getHideDoneState();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', isHidden);
    }),
  );

  // Toggle Hide Done Items - Inactive command (perform action)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideDone.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.toggleHideDone();
      const isHidden = treeDataProvider.getHideDoneState();
      await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', isHidden);
    }),
  );

  // Show RelatesTo - Active command (no-op, already showing)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showRelatesTo.active', () => {
      // No-op - already active
    }),
  );

  // Show RelatesTo - Inactive command (perform action to show)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showRelatesTo.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      // Only toggle if currently hidden
      if (treeDataProvider.getHideRelatesToState()) {
        treeDataProvider.toggleHideRelatesTo();
      }
      await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', false);
    }),
  );

  // Hide RelatesTo - Active command (no-op, already hiding)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideRelatesTo.active', () => {
      // No-op - already active
    }),
  );

  // Hide RelatesTo - Inactive command (perform action to hide)
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.hideRelatesTo.inactive', async () => {
      if (!checkDevStepsInitialized(treeDataProvider)) return;
      // Only toggle if currently showing
      if (!treeDataProvider.getHideRelatesToState()) {
        treeDataProvider.toggleHideRelatesTo();
      }
      await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', true);
    }),
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

      if (!checkDevStepsInitialized(treeDataProvider)) return;
      treeDataProvider.setSortOptions(
        sortBy.value as any,
        sortOrder.value as 'asc' | 'desc',
      );
    }),
  );

  // Output Channel Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showOutput', () => {
      logger.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.clearOutput', () => {
      logger.clear();
    }),
  );
}
