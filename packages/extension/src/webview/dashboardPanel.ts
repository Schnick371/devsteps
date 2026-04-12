/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Dashboard Panel - Main WebView orchestrator for DevSteps Dashboard
 * Refactored: 740 lines → 150 lines (80% reduction)
 */

import * as path from 'node:path';
import { type ListItemEntry, listItems } from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';

import type { SpiderEvent } from '@schnick371/devsteps-shared';
import { type BurndownData, getBurndownData } from './dataProviders/burndownProvider.js';
import { type EisenhowerData, getEisenhowerData } from './dataProviders/eisenhowerProvider.js';
// Data Providers
import { getProjectStats, type ProjectStats } from './dataProviders/statsProvider.js';
import { getTimelineData } from './dataProviders/timelineProvider.js';
import {
  getTraceabilityData,
  type TraceabilityData,
} from './dataProviders/traceabilityProvider.js';
import { getBurndownChartScript } from './renderers/burndownRenderer.js';
import { renderEisenhowerMatrix } from './renderers/eisenhowerRenderer.js';
// Renderers
import { renderStatsCards } from './renderers/statsRenderer.js';
import { renderTimeline } from './renderers/timelineRenderer.js';
import { getTraceabilityGraphScript } from './renderers/traceabilityRenderer.js';

// Utils
import { getNonce } from './utils/htmlHelpers.js';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      null,
      this._disposables
    );
  }

  public static async createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'devstepsashboard',
      'DevSteps Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'dist'),
        ],
        retainContextWhenHidden: true,
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  private async _update() {
    const webview = this._panel.webview;

    try {
      // PERFORMANCE: Load data once, share across all providers
      const { allItems, tasks } = await this.loadAllData();

      // Use extracted data providers
      const stats = getProjectStats(allItems);
      const eisenhowerData = getEisenhowerData(allItems);
      const burndownData = getBurndownData(tasks);
      const traceabilityData = getTraceabilityData(allItems);
      const timelineData = getTimelineData(allItems);

      this._panel.webview.html = this._getHtmlForWebview(
        webview,
        stats,
        eisenhowerData,
        burndownData,
        traceabilityData,
        timelineData
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load all DevSteps data once for dashboard rendering.
   * PERFORMANCE: Eliminates 5× redundant listItems() calls.
   */
  private async loadAllData(): Promise<{ allItems: ListItemEntry[]; tasks: ListItemEntry[] }> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return { allItems: [], tasks: [] };
    }

    const devstepsPath = path.join(workspaceFolder.uri.fsPath, '.devsteps');
    const result = await listItems(devstepsPath, { includeLinkedItems: true });
    const allItems = result.items;
    const tasks = allItems.filter((item) => item.type === 'task');

    return { allItems, tasks };
  }

  private _getHtmlForWebview(
    webview: vscode.Webview,
    stats: ProjectStats,
    eisenhower: EisenhowerData,
    burndown: BurndownData,
    traceability: TraceabilityData,
    timeline: ListItemEntry[]
  ): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'dashboard.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
      <link href="${styleUri}" rel="stylesheet">
      <title>DevSteps Dashboard</title>
    </head>
    <body data-active-view="overview">
      <div class="dashboard">
        <header>
          <h1>DevSteps Dashboard</h1>
          <nav class="tab-bar" role="tablist">
            <button class="tab-btn" data-view="overview" role="tab" aria-selected="true">Overview</button>
            <button class="tab-btn" data-view="work-items" role="tab" aria-selected="false">Work Items</button>
            <button class="tab-btn" data-view="progress" role="tab" aria-selected="false">Progress</button>
            <button class="tab-btn" data-view="traceability" role="tab" aria-selected="false">Traceability</button>
            <button class="tab-btn" data-view="timeline" role="tab" aria-selected="false">Timeline</button>
          </nav>
        </header>

        <!-- Tab: Overview -->
        <div class="view-panel" data-view="overview" role="tabpanel">
          <section class="stats-grid">
            ${renderStatsCards(stats)}
          </section>
          <section class="eisenhower-section">
            ${renderEisenhowerMatrix(eisenhower)}
          </section>
        </div>

        <!-- Tab: Work Items (placeholder — STORY-264) -->
        <div class="view-panel" data-view="work-items" role="tabpanel">
          <section class="work-items-section">
            <h2>Work Items</h2>
            <p class="placeholder-text">Work Items view coming soon (STORY-264).</p>
          </section>
        </div>

        <!-- Tab: Progress -->
        <div class="view-panel" data-view="progress" role="tabpanel">
          <section class="burndown-section">
            <h2>Project Burndown</h2>
            <canvas id="burndownChart" width="800" height="300"></canvas>
          </section>
        </div>

        <!-- Tab: Traceability -->
        <div class="view-panel" data-view="traceability" role="tabpanel">
          <section class="traceability-section">
            <h2>Traceability Graph</h2>
            ${
              traceability.displayedNodes &&
              traceability.totalItems &&
              traceability.displayedNodes < traceability.totalItems
                ? `<div class="info-banner">
                   <span class="info-icon">ℹ️</span>
                   Showing ${traceability.displayedNodes} of ${traceability.totalItems} items (top connections only).
                   <span class="info-hint">For performance, large projects display most-connected items.</span>
                 </div>`
                : ''
            }
            <div id="traceabilityGraph"></div>
          </section>
        </div>

        <!-- Tab: Timeline -->
        <div class="view-panel" data-view="timeline" role="tabpanel">
          <section class="timeline-section">
            ${renderTimeline(timeline)}
          </section>
        </div>
      </div>

      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        // Tab navigation — CSS view-toggle via data-active-view attribute
        (function() {
          const tabBtns = document.querySelectorAll('.tab-btn');
          const savedState = vscode.getState();
          const initialView = savedState && savedState.activeView ? savedState.activeView : 'overview';

          function switchTab(viewId) {
            document.body.setAttribute('data-active-view', viewId);
            tabBtns.forEach(btn => {
              btn.setAttribute('aria-selected', btn.dataset.view === viewId ? 'true' : 'false');
            });
            vscode.setState({ ...vscode.getState(), activeView: viewId });
          }

          tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.view));
          });

          // Restore saved tab
          switchTab(initialView);
        })();

        ${getBurndownChartScript(burndown)}
        ${getTraceabilityGraphScript(traceability)}

        // Click handlers
        document.querySelectorAll('[data-item-id]').forEach(el => {
          el.addEventListener('click', () => {
            vscode.postMessage({
              command: 'openItem',
              itemId: el.dataset.itemId
            });
          });
        });

        // Listen for spider events from extension host (STORY-206 contract)
        window.addEventListener('message', (event) => {
          const message = event.data;
          if (message.command === 'spiderEvent') {
            console.log('[DevSteps] Spider event received:', message.event);
          }
        });
      </script>
    </body>
    </html>`;
  }

  /**
   * Forward a spider event from hooks to the webview for live ring updates.
   */
  public postSpiderEvent(event: SpiderEvent): void {
    this._panel.webview.postMessage({ command: 'spiderEvent', event });
  }

  private async handleMessage(message: { command: string; itemId?: string }) {
    switch (message.command) {
      case 'openItem':
        vscode.commands.executeCommand('devsteps.openItem', message.itemId);
        break;
    }
  }

  public dispose() {
    DashboardPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) disposable.dispose();
    }
  }
}
