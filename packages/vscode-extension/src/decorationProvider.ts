/**
 * Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)
 * Licensed under the Apache License, Version 2.0
 */

import * as vscode from 'vscode';

/**
 * DevCrumbs File Decoration Provider
 * 
 * Adds status badges and colors to work items in TreeView using VS Code's
 * native FileDecorationProvider API. Uses custom URI scheme (devcrumbs://)
 * to identify work items.
 */
export class DevCrumbsDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  /**
   * Refresh decorations for all items or specific URIs
   */
  refresh(uris?: vscode.Uri | vscode.Uri[]): void {
    this._onDidChangeFileDecorations.fire(uris);
  }

  provideFileDecoration(
    uri: vscode.Uri,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.FileDecoration> {
    // Only handle devcrumbs:// scheme
    if (uri.scheme !== 'devcrumbs') {
      return undefined;
    }

    try {
      // Parse URI: devcrumbs://item/<ID>?status=<status>&priority=<priority>
      const params = new URLSearchParams(uri.query);
      const status = params.get('status');
      const priority = params.get('priority');

      if (!status) return undefined;

      return this.getDecorationForStatus(status, priority);
    } catch (error) {
      console.error('Error providing file decoration:', error);
      return undefined;
    }
  }

  /**
   * Get decoration based on status and priority
   */
  private getDecorationForStatus(
    status: string,
    priority: string | null,
  ): vscode.FileDecoration {
    // Status-based decorations
    const statusDecorations: Record<string, vscode.FileDecoration> = {
      draft: {
        badge: '○',
        tooltip: 'Draft - Not Started',
        color: new vscode.ThemeColor('charts.gray'),
      },
      planned: {
        badge: '◷',
        tooltip: 'Planned - Scheduled',
        color: new vscode.ThemeColor('charts.blue'),
      },
      'in-progress': {
        badge: '●',
        tooltip: 'In Progress - Active Work',
        color: new vscode.ThemeColor('charts.orange'),
      },
      review: {
        badge: '◎',
        tooltip: 'In Review',
        color: new vscode.ThemeColor('charts.purple'),
      },
      done: {
        badge: '✓',
        tooltip: 'Done - Completed',
        color: new vscode.ThemeColor('charts.green'),
      },
      blocked: {
        badge: '✖',
        tooltip: 'Blocked - Cannot Proceed',
        color: new vscode.ThemeColor('charts.red'),
      },
      cancelled: {
        badge: '−',
        tooltip: 'Cancelled',
        color: new vscode.ThemeColor('charts.gray'),
      },
      obsolete: {
        badge: '⊗',
        tooltip: 'Obsolete - No Longer Relevant',
        color: new vscode.ThemeColor('disabledForeground'),
      },
    };

    const decoration = statusDecorations[status] || {
      badge: '?',
      tooltip: `Unknown Status: ${status}`,
      color: new vscode.ThemeColor('foreground'),
    };

    // Override color based on critical priority
    if (priority === 'critical') {
      decoration.color = new vscode.ThemeColor('errorForeground');
      decoration.tooltip += ' [CRITICAL]';
    }

    return decoration;
  }
}

/**
 * Create devcrumbs:// URI for work item decoration
 */
export function createItemUri(itemId: string, status: string, priority: string): vscode.Uri {
  return vscode.Uri.parse(`devcrumbs://item/${itemId}?status=${status}&priority=${priority}`);
}
