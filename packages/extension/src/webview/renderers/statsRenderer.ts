/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Statistics Cards Renderer - HTML generation for stat cards
 */

import type { ProjectStats } from '../dataProviders/statsProvider.js';

/**
 * Render statistics cards HTML
 */
export function renderStatsCards(stats: ProjectStats): string {
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
