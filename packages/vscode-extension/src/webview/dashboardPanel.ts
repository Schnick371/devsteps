import * as vscode from 'vscode';
import { listItems } from '@devcrumbs/shared';
import * as path from 'path';

interface ProjectStats {
  totalItems: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byEisenhower: Record<string, number>;
}

interface EisenhowerData {
  Q1: any[];
  Q2: any[];
  Q3: any[];
  Q4: any[];
}

interface BurndownData {
  total: number;
  remaining: number;
  dataPoints: Array<{ date: string; ideal: number; actual: number }>;
}

interface TraceabilityData {
  nodes: Array<{ id: string; type: string; title: string; status: string }>;
  edges: Array<{ source: string; target: string; relation: string }>;
  totalItems?: number;
  displayedNodes?: number;
}

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
      'devcrumbsDashboard',
      'DevCrumbs Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'dist')
        ],
        retainContextWhenHidden: true
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  private async _update() {
    const webview = this._panel.webview;

    try {
      // PERFORMANCE OPTIMIZATION: Load data once, share across all methods
      const { allItems, tasks } = await this.loadAllData();

      // Pass preloaded data to methods (now synchronous)
      const stats = this.getProjectStats(allItems);
      const eisenhowerData = this.getEisenhowerData(allItems);
      const burndownData = this.getBurndownData(tasks);
      const traceabilityData = this.getTraceabilityData(allItems);
      const timelineData = this.getTimelineData(allItems);

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
   * Load all DevCrumbs data once for dashboard rendering.
   * PERFORMANCE: Eliminates 5× redundant listItems() calls.
   */
  private async loadAllData(): Promise<{ allItems: any[]; tasks: any[] }> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return { allItems: [], tasks: [] };
    }

    const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
    const result = await listItems(devcrumbsPath);
    const allItems = result.items;
    const tasks = allItems.filter((item: any) => item.type === 'task');

    return { allItems, tasks };
  }

  private getProjectStats(items: any[]): ProjectStats {
    if (items.length === 0) {
      return {
        totalItems: 0,
        byType: {},
        byStatus: {},
        byPriority: {},
        byEisenhower: {}
      };
    }

    return {
      totalItems: items.length,
      byType: this.groupBy(items, 'type'),
      byStatus: this.groupBy(items, 'status'),
      byPriority: this.groupBy(items, 'priority'),
      byEisenhower: this.groupBy(items, 'eisenhower')
    };
  }

  private getEisenhowerData(items: any[]): EisenhowerData {
    if (items.length === 0) {
      return { Q1: [], Q2: [], Q3: [], Q4: [] };
    }

    return {
      Q1: items.filter((i: any) => i.eisenhower === 'urgent-important'),
      Q2: items.filter((i: any) => i.eisenhower === 'not-urgent-important'),
      Q3: items.filter((i: any) => i.eisenhower === 'urgent-not-important'),
      Q4: items.filter((i: any) => i.eisenhower === 'not-urgent-not-important')
    };
  }

  private getBurndownData(tasks: any[]): BurndownData {
    if (tasks.length === 0) {
      return { total: 0, remaining: 0, dataPoints: [] };
    }

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((i: any) => i.status === 'done').length;

    // Calculate burndown points (simplified - could use story points in future)
    const dataPoints = this.calculateBurndownPoints(tasks);

    return {
      total: totalTasks,
      remaining: totalTasks - doneTasks,
      dataPoints
    };
  }

  private calculateBurndownPoints(items: any[]): Array<{ date: string; ideal: number; actual: number }> {
    if (items.length === 0) {
      return [];
    }

    // Group tasks by completion date
    const tasksByDate: Record<string, number> = {};
    const total = items.length;

    items.forEach((item) => {
      if (item.status === 'done' && item.updated) {
        const date = new Date(item.updated).toISOString().split('T')[0];
        tasksByDate[date] = (tasksByDate[date] || 0) + 1;
      }
    });

    // Get date range
    const dates = Object.keys(tasksByDate).sort();
    if (dates.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return [{ date: today, ideal: total, actual: total }];
    }

    const startDate = new Date(dates[0]);
    const endDate = new Date();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate ideal and actual burndown
    const dataPoints: Array<{ date: string; ideal: number; actual: number }> = [];
    let remaining = total;

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const ideal = Math.max(0, total - (total / daysDiff) * i);
      const completed = tasksByDate[dateStr] || 0;
      remaining = Math.max(0, remaining - completed);

      dataPoints.push({
        date: dateStr,
        ideal: Math.round(ideal),
        actual: remaining
      });
    }

    return dataPoints;
  }

  /**
   * Get traceability graph data with intelligent node limiting.
   * PERFORMANCE: Limits to top N most-connected items to avoid O(n²) force simulation lag.
   * 
   * @param items - All DevCrumbs items
   * @returns Traceability data with nodes, edges, and metadata
   */
  private getTraceabilityData(items: any[]): TraceabilityData {
    if (items.length === 0) {
      return { nodes: [], edges: [] };
    }

    // PERFORMANCE OPTIMIZATION: Limit nodes for large projects
    const MAX_NODES = 50; // Configurable in settings (future: devcrumbs.dashboard.traceabilityMaxNodes)
    
    // Calculate connection score for each item (total # of links)
    const itemsWithScores = items.map((item: any) => {
      const linkCount = item.linked_items 
        ? Object.values(item.linked_items).reduce((acc: number, targets: any) => 
            acc + (Array.isArray(targets) ? targets.length : 0), 0)
        : 0;
      
      return { item, score: linkCount };
    });

    // Sort by connection score descending
    const sortedItems = itemsWithScores.sort((a, b) => b.score - a.score);

    // Get top N most-connected items
    const topItems = sortedItems.slice(0, Math.min(MAX_NODES, items.length));
    const topIds = new Set(topItems.map(i => i.item.id));

    // Include items directly connected to top items (expand neighborhood)
    const connectedIds = new Set(topIds);
    topItems.forEach(({ item }) => {
      if (item.linked_items) {
        Object.values(item.linked_items).forEach((targets: any) => {
          if (Array.isArray(targets)) {
            targets.forEach((targetId: string) => connectedIds.add(targetId));
          }
        });
      }
    });

    // Build nodes from selected items
    const selectedItems = items.filter((item: any) => connectedIds.has(item.id));
    const nodes = selectedItems.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      status: item.status
    }));

    // Build edges only between selected nodes
    const edges: Array<{ source: string; target: string; relation: string }> = [];
    selectedItems.forEach((item: any) => {
      if (item.linked_items) {
        Object.entries(item.linked_items).forEach(([relation, targets]) => {
          if (Array.isArray(targets)) {
            targets.forEach((targetId: string) => {
              // Only include edge if target is also in selected nodes
              if (connectedIds.has(targetId)) {
                edges.push({ source: item.id, target: targetId, relation });
              }
            });
          }
        });
      }
    });

    return { 
      nodes, 
      edges,
      totalItems: items.length,
      displayedNodes: nodes.length
    };
  }

  private getTimelineData(items: any[]): any[] {
    if (items.length === 0) {
      return [];
    }

    const sorted = items.sort(
      (a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return sorted.slice(0, 20);
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private _getHtmlForWebview(
    webview: vscode.Webview,
    stats: ProjectStats,
    eisenhower: EisenhowerData,
    burndown: BurndownData,
    traceability: TraceabilityData,
    timeline: any[]
  ): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'dashboard.css')
    );

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
      <link href="${styleUri}" rel="stylesheet">
      <title>DevCrumbs Dashboard</title>
    </head>
    <body>
      <div class="dashboard">
        <header>
          <h1>📊 DevCrumbs Dashboard</h1>
        </header>

        <!-- Statistics Cards -->
        <section class="stats-grid">
          ${this.renderStatsCards(stats)}
        </section>

        <!-- Eisenhower Matrix -->
        <section class="eisenhower-section">
          ${this.renderEisenhowerMatrix(eisenhower)}
        </section>

        <!-- Burndown Chart -->
        <section class="burndown-section">
          <h2>📉 Sprint Burndown</h2>
          <canvas id="burndownChart" width="800" height="300"></canvas>
        </section>

        <!-- Traceability Graph -->
        <section class="traceability-section">
          <h2>🕸️ Traceability Graph</h2>
          ${traceability.displayedNodes && traceability.totalItems && traceability.displayedNodes < traceability.totalItems
            ? `<div class="info-banner">
                 <span class="info-icon">ℹ️</span>
                 Showing ${traceability.displayedNodes} of ${traceability.totalItems} items (top connections only).
                 <span class="info-hint">For performance, large projects display most-connected items.</span>
               </div>`
            : ''}
          <div id="traceabilityGraph"></div>
        </section>

        <!-- Timeline -->
        <section class="timeline-section">
          ${this.renderTimeline(timeline)}
        </section>
      </div>

      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        // Chart.js and D3.js will be bundled separately and loaded here
        ${this.getBurndownChartScript(burndown)}
        ${this.getTraceabilityGraphScript(traceability)}

        // Click handlers
        document.querySelectorAll('[data-item-id]').forEach(el => {
          el.addEventListener('click', () => {
            vscode.postMessage({
              command: 'openItem',
              itemId: el.dataset.itemId
            });
          });
        });
      </script>
    </body>
    </html>`;
  }

  private renderStatsCards(stats: ProjectStats): string {
    return `
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Total Items</div>
        <div class="stat-value">${stats.totalItems}</div>
      </div>
      <div class="stat-card status-in-progress">
        <div class="stat-icon">🔄</div>
        <div class="stat-label">In Progress</div>
        <div class="stat-value">${stats.byStatus['in-progress'] || 0}</div>
      </div>
      <div class="stat-card status-done">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Done</div>
        <div class="stat-value">${stats.byStatus.done || 0}</div>
      </div>
      <div class="stat-card status-blocked">
        <div class="stat-icon">🚫</div>
        <div class="stat-label">Blocked</div>
        <div class="stat-value">${stats.byStatus.blocked || 0}</div>
      </div>
    `;
  }

  private renderEisenhowerMatrix(eisenhower: EisenhowerData): string {
    const renderQuadrant = (quadrant: string, label: string, items: any[]) => `
      <div class="quadrant ${quadrant.toLowerCase()}">
        <div class="quadrant-header">
          <span class="quadrant-label">${label}</span>
          <span class="quadrant-count">${items.length}</span>
        </div>
        <ul class="quadrant-items">
          ${items
            .slice(0, 10)
            .map(
              (item) => `
            <li data-item-id="${item.id}">
              <span class="item-icon">${this.getIconForType(item.type)}</span>
              <span class="item-title">${this.escapeHtml(item.title)}</span>
            </li>
          `
            )
            .join('')}
          ${items.length > 10 ? `<li class="more-items">+${items.length - 10} more</li>` : ''}
        </ul>
      </div>
    `;

    return `
      <h2>🔥 Eisenhower Priority Matrix</h2>
      <div class="matrix-grid">
        ${renderQuadrant('Q1', 'Do First (Urgent & Important)', eisenhower.Q1)}
        ${renderQuadrant('Q2', 'Schedule (Important)', eisenhower.Q2)}
        ${renderQuadrant('Q3', 'Delegate (Urgent)', eisenhower.Q3)}
        ${renderQuadrant('Q4', 'Eliminate', eisenhower.Q4)}
      </div>
    `;
  }

  private renderTimeline(timeline: any[]): string {
    return `
      <h2>📅 Recent Activity</h2>
      <div class="timeline">
        ${timeline
          .map(
            (item) => `
          <div class="timeline-item" data-item-id="${item.id}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-item-id">${item.id}</span>
                <span class="timeline-time">${this.formatRelativeTime(item.updated)}</span>
              </div>
              <div class="timeline-title">${this.escapeHtml(item.title)}</div>
              <div class="timeline-details">Status: ${item.status}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private getBurndownChartScript(burndown: BurndownData): string {
    // Inline minimal Chart.js implementation for burndown
    // In production, we'd bundle Chart.js properly with esbuild
    const labels = burndown.dataPoints.map((p) => p.date.substring(5)); // Show MM-DD
    const idealData = burndown.dataPoints.map((p) => p.ideal);
    const actualData = burndown.dataPoints.map((p) => p.actual);

    return `
      // Simple canvas-based chart (Chart.js alternative for now)
      (function() {
        const canvas = document.getElementById('burndownChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const labels = ${JSON.stringify(labels)};
        const ideal = ${JSON.stringify(idealData)};
        const actual = ${JSON.stringify(actualData)};
        
        const maxValue = Math.max(...ideal, ...actual);
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Clear canvas
        ctx.fillStyle = 'var(--vscode-editor-background, #1e1e1e)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = 'var(--vscode-panel-border, #444)';
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.setLineDash([2, 2]);
        for (let i = 0; i <= 5; i++) {
          const y = padding + (chartHeight * i) / 5;
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(width - padding, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // Helper function to plot line
        function plotLine(data, color, dashed = false) {
          if (data.length === 0) return;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          if (dashed) ctx.setLineDash([5, 5]);
          
          ctx.beginPath();
          data.forEach((value, index) => {
            const x = padding + (chartWidth * index) / (data.length - 1 || 1);
            const y = height - padding - (chartHeight * value) / (maxValue || 1);
            
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw ideal line (dashed)
        plotLine(ideal, '#4caf50', true);
        
        // Draw actual line (solid)
        plotLine(actual, '#2196f3', false);
        
        // Draw legend
        ctx.fillStyle = 'var(--vscode-editor-foreground, #ccc)';
        ctx.font = '12px sans-serif';
        ctx.fillText('— Ideal', width - 100, 20);
        ctx.fillText('— Actual', width - 100, 35);
        
        ctx.strokeStyle = '#4caf50';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width - 120, 16);
        ctx.lineTo(width - 105, 16);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2196f3';
        ctx.beginPath();
        ctx.moveTo(width - 120, 31);
        ctx.lineTo(width - 105, 31);
        ctx.stroke();
      })();
    `;
  }

  private getTraceabilityGraphScript(traceability: TraceabilityData): string {
    // Simple SVG-based graph (D3.js alternative for now)
    const nodes = JSON.stringify(traceability.nodes);
    const edges = JSON.stringify(traceability.edges);

    return `
      // Simple SVG force-directed graph
      (function() {
        const container = document.getElementById('traceabilityGraph');
        if (!container) return;
        
        const nodes = ${nodes};
        const edges = ${edges};
        
        if (nodes.length === 0) {
          container.innerHTML = '<p style="text-align: center; color: var(--vscode-descriptionForeground);">No relationships found</p>';
          return;
        }
        
        const width = container.clientWidth || 800;
        const height = 400;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.backgroundColor = 'var(--vscode-editor-background)';
        container.appendChild(svg);
        
        // Simple layout - circular arrangement
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI;
          const radius = Math.min(width, height) / 3;
          node.x = width / 2 + radius * Math.cos(angle);
          node.y = height / 2 + radius * Math.sin(angle);
        });
        
        // Draw edges
        edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return;
          
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', source.x);
          line.setAttribute('y1', source.y);
          line.setAttribute('x2', target.x);
          line.setAttribute('y2', target.y);
          line.setAttribute('stroke', 'var(--vscode-panel-border)');
          line.setAttribute('stroke-width', '1');
          svg.appendChild(line);
        });
        
        // Draw nodes
        nodes.forEach(node => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', node.x);
          circle.setAttribute('cy', node.y);
          circle.setAttribute('r', '15');
          circle.setAttribute('fill', node.status === 'done' ? '#4caf50' : '#2196f3');
          circle.setAttribute('data-item-id', node.id);
          circle.style.cursor = 'pointer';
          svg.appendChild(circle);
          
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', node.x);
          text.setAttribute('y', node.y - 20);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', 'var(--vscode-editor-foreground)');
          text.setAttribute('font-size', '10');
          text.textContent = node.id;
          svg.appendChild(text);
        });
      })();
    `;
  }

  private getIconForType(type: string): string {
    const icons: Record<string, string> = {
      epic: '🚀',
      story: '📖',
      task: '☑️',
      bug: '🐛',
      feature: '💡',
      requirement: '📝',
      spike: '🧪'
    };
    return icons[type] || '●';
  }

  private formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private escapeHtml(text: string): string {
    const div = { textContent: text } as any;
    return div.textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async handleMessage(message: any) {
    switch (message.command) {
      case 'openItem':
        vscode.commands.executeCommand('devcrumbs.openItem', message.itemId);
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
