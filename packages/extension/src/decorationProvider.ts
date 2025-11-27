/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 */

import * as vscode from 'vscode';

/**
 * DevSteps File Decoration Provider
 * 
 * Adds status badges and colors to work items in TreeView using VS Code's
 * native FileDecorationProvider API. Uses custom URI scheme (devsteps//)
 * to identify work items.
 */
export class DevStepsDecorationProvider implements vscode.FileDecorationProvider {
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
    // DEBUG: Log every call
    console.log('🔍 provideFileDecoration called with URI:', uri.toString());
    console.log('  - scheme:', uri.scheme);
    console.log('  - path:', uri.path);
    console.log('  - query:', uri.query);
    
    // Only handle devsteps// scheme
    if (uri.scheme !== 'devsteps') {
      console.log('  ❌ Wrong scheme, returning undefined');
      return undefined;
    }

    try {
      // Parse URI: devsteps//item/<ID>?status=<status>&priority=<priority>
      const params = new URLSearchParams(uri.query);
      const status = params.get('status');
      const priority = params.get('priority');

      console.log('  - status:', status);
      console.log('  - priority:', priority);

      if (!status) {
        console.log('  ❌ No status, returning undefined');
        return undefined;
      }

      const decoration = this.getDecorationForStatus(status, priority);
      console.log('  ✅ Returning decoration:', decoration);
      return decoration;
    } catch (error) {
      console.error('  ❌ Error providing file decoration:', error);
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
    // Status-based decorations (badges only, no label coloring)
    // Icons are colored via ThemeIcon in TreeDataProvider (TASK-007)
    const statusDecorations: Record<string, vscode.FileDecoration> = {
      draft: {
        badge: '○',
        tooltip: 'Draft - Not Started',
      },
      planned: {
        badge: '◷',
        tooltip: 'Planned - Scheduled',
      },
      'in-progress': {
        badge: '●',
        tooltip: 'In Progress - Active Work',
      },
      review: {
        badge: '◎',
        tooltip: 'In Review',
      },
      done: {
        badge: '✓',
        tooltip: 'Done - Completed',
      },
      blocked: {
        badge: '✖',
        tooltip: 'Blocked - Cannot Proceed',
      },
      cancelled: {
        badge: '−',
        tooltip: 'Cancelled',
      },
      obsolete: {
        badge: '⊗',
        tooltip: 'Obsolete - No Longer Relevant',
      },
    };

    const decoration = statusDecorations[status] || {
      badge: '?',
      tooltip: `Unknown Status: ${status}`,
    };

    // Add priority indicator to tooltip (color already on icon)
    if (priority === 'critical') {
      decoration.tooltip += ' [CRITICAL]';
    }

    return decoration;
  }
}

/**
 * Create devsteps:// URI for work item decoration
 * Use Uri.from() to properly create custom scheme URIs
 */
export function createItemUri(itemId: string, status: string, priority: string): vscode.Uri {
  return vscode.Uri.from({
    scheme: 'devsteps',
    path: `/item/${itemId}`,
    query: `status=${status}&priority=${priority}`
  });
}
