/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Epic Burndown Renderer — SVG sparkline accordion for per-epic progress
 */

import type { EpicProgress } from '../dataProviders/epicBurndownProvider.js';

/**
 * Render an SVG progress bar for a single epic.
 * Uses a simple horizontal bar rather than a time-series sparkline,
 * since most epics lack granular daily completion data.
 */
function renderProgressBar(epic: EpicProgress): string {
  const width = 300;
  const height = 24;
  const pct = epic.total > 0 ? epic.done / epic.total : 0;
  const fillWidth = Math.round(pct * width);

  return `<svg width="${width}" height="${height}" class="epic-progress-bar" role="img" aria-label="${epic.id}: ${epic.done} of ${epic.total} done">
    <rect x="0" y="4" width="${width}" height="16" rx="3" fill="var(--vscode-editorWidget-border, #3c3c3c)" />
    <rect x="0" y="4" width="${fillWidth}" height="16" rx="3" fill="var(--vscode-charts-green, #22c55e)" />
    <text x="${width + 8}" y="17" fill="var(--text-secondary)" font-size="11" font-family="var(--vscode-font-family)">${Math.round(pct * 100)}%</text>
  </svg>`;
}

/**
 * Render the full epic accordion HTML for the Progress tab.
 */
export function renderEpicAccordion(epics: EpicProgress[]): string {
  if (epics.length === 0) {
    return '<p class="placeholder-text">No epics found.</p>';
  }

  const items = epics
    .map((epic) => {
      const childList =
        epic.children.length > 0
          ? `<ul class="epic-children">${epic.children
              .map(
                (c) =>
                  `<li class="epic-child" data-item-id="${c.id}"><span class="wi-id">${c.id}</span> <span class="wi-badge wi-status-${c.status}">${c.status}</span></li>`
              )
              .join('')}</ul>`
          : '<p class="placeholder-text">No tasks linked to this epic.</p>';

      return `<details class="epic-burndown">
        <summary>
          <span class="epic-summary-id">${epic.id}</span>
          <span class="epic-summary-title">${epic.title}</span>
          <span class="epic-summary-count">${epic.done}/${epic.total}</span>
        </summary>
        <div class="epic-detail">
          ${renderProgressBar(epic)}
          ${childList}
        </div>
      </details>`;
    })
    .join('\n');

  return `<div class="epic-accordion">${items}</div>`;
}
