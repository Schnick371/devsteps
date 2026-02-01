/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Timeline Renderer - Recent activity visualization
 */

import type { DevStepsIndex } from '@schnick371/devsteps-shared';
import { escapeHtml, formatRelativeTime } from '../utils/htmlHelpers.js';

// Type alias for list items
type ListItem = DevStepsIndex['items'][number];

/**
 * Render recent activity timeline HTML
 */
export function renderTimeline(timeline: ListItem[]): string {
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
              <span class="timeline-time">${formatRelativeTime(item.updated)}</span>
            </div>
            <div class="timeline-title">${escapeHtml(item.title)}</div>
            <div class="timeline-details">Status: ${item.status}</div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}
