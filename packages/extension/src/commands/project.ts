/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — project-level: initProject, showDashboard,
 * checkPrerequisites, showStatus, showOutput, clearOutput
 */

import * as path from 'node:path';
import { listItems } from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import { logger } from '../outputChannel.js';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { detectMcpRuntime, formatDiagnostics } from '../utils/runtimeDetector.js';
import { DashboardPanel } from '../webview/dashboardPanel.js';

export function registerProjectCommands(
  context: vscode.ExtensionContext,
  _treeDataProvider: DevStepsTreeDataProvider | null
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
          if (!value || value.trim().length === 0) return 'Project name cannot be empty';
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
        { placeHolder: 'Select project methodology' }
      );
      if (!methodology) return;

      const choice = await vscode.window.showInformationMessage(
        `Initialize DevSteps project "${projectName}" with ${methodology.label} methodology?`,
        { modal: true },
        'Use Copilot Chat',
        'Use CLI'
      );

      if (choice === 'Use Copilot Chat') {
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: `@devsteps #mcp_devsteps_devsteps-init ${projectName} --methodology ${methodology.value}`,
        });
      } else if (choice === 'Use CLI') {
        const terminal = vscode.window.createTerminal('DevSteps Init');
        terminal.show();
        terminal.sendText('echo "🚀 Running DevSteps CLI via npx (zero-configuration)..."');
        terminal.sendText(
          `npx @schnick371/devsteps-cli init ${projectName} --methodology ${methodology.value}`
        );
      }
    })
  );

  // Show Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showDashboard', () => {
      DashboardPanel.createOrShow(context.extensionUri);
    })
  );

  // Check Prerequisites
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.checkPrerequisites', async () => {
      logger.info('=== DevSteps Prerequisites Check ===');
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Checking prerequisites...', cancellable: false },
        async (progress) => {
          progress.report({ increment: 0, message: 'Detecting Node.js runtime...' });
          const bundledServerPath = path.join(context.extensionPath, 'dist', 'mcp-server.js');
          const runtimeConfig = await detectMcpRuntime(bundledServerPath);
          progress.report({ increment: 50, message: 'Analyzing results...' });
          logger.info(formatDiagnostics(runtimeConfig.diagnostics));

          const { node, npm, npx } = runtimeConfig.diagnostics;
          const allAvailable = node.available && npm.available && npx.available;
          const partialAvailable = node.available || npm.available;
          const lines: string[] = ['**Prerequisites Check Results:**', ''];
          lines.push(node.available ? `✅ Node.js: ${node.version}\n   Path: ${node.path}` : '❌ Node.js: Not found');
          lines.push(npm.available ? `✅ npm: ${npm.version}` : '❌ npm: Not found');
          lines.push(npx.available ? `✅ npx: ${npx.version}` : '❌ npx: Not found');
          lines.push('', '**MCP Server Strategy:**');
          if (runtimeConfig.strategy === 'npx') lines.push('✅ Will use npx (auto-install from npm registry)');
          else if (runtimeConfig.strategy === 'node') lines.push('⚠️  Will use node + bundled server');
          else lines.push('❌ No compatible runtime available');
          progress.report({ increment: 100 });
          logger.info(lines.join('\n'));
          logger.show();

          if (allAvailable) {
            vscode.window.showInformationMessage('✅ All prerequisites satisfied!', 'OK');
          } else if (partialAvailable) {
            const sel = await vscode.window.showWarningMessage(
              '⚠️ Some prerequisites missing.', 'Show Output', 'Install Node.js'
            );
            if (sel === 'Show Output') logger.show();
            else if (sel === 'Install Node.js') vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/'));
          } else {
            const sel = await vscode.window.showErrorMessage(
              '❌ Node.js not found.', 'Install Node.js', 'Show Output'
            );
            if (sel === 'Install Node.js') vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/'));
            else if (sel === 'Show Output') logger.show();
          }
        }
      );
    })
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
        const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
        const allItems = await listItems(devstepsPath);
        if (!allItems.items) { vscode.window.showErrorMessage('Failed to load project status'); return; }
        const items = allItems.items;
        const total = items.length;
        const byStatus = items.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {} as Record<string, number>);
        const byType = items.reduce((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {} as Record<string, number>);
        const report = [
          `📊 **DevSteps Project Status**`, ``, `**Total Items:** ${total}`, ``,
          `**By Status:**`,
          `- Draft: ${byStatus.draft || 0}`, `- Planned: ${byStatus.planned || 0}`,
          `- In Progress: ${byStatus['in-progress'] || 0}`, `- Review: ${byStatus.review || 0}`,
          `- Done: ${byStatus.done || 0}`, `- Blocked: ${byStatus.blocked || 0}`,
          `- Cancelled: ${byStatus.cancelled || 0}`, `- Obsolete: ${byStatus.obsolete || 0}`,
          ``, `**By Type:**`,
          ...Object.entries(byType).map(([type, count]) => `- ${type}: ${count}`),
        ].join('\n');
        vscode.window.showInformationMessage(report, { modal: true });
      } catch (error) {
        vscode.window.showErrorMessage(`Error loading status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
  );

  // Output channel commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.showOutput', () => { logger.show(); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.clearOutput', () => { logger.clear(); })
  );
}
