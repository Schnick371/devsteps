/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Eisenhower Matrix Renderer - Priority quadrant visualization
 */

import type { EisenhowerData } from '../dataProviders/eisenhowerProvider.js';
import { escapeHtml, getIconForType } from '../utils/htmlHelpers.js';

/**
 * Render Eisenhower Matrix HTML with 4 quadrants
 */
export function renderEisenhowerMatrix(eisenhower: EisenhowerData): string {
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
            <span class="item-icon">${getIconForType(item.type)}</span>
            <span class="item-title">${escapeHtml(item.title)}</span>
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
