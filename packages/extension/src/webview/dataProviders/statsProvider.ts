/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Statistics Data Provider - Project metrics aggregation
 */

import type { DevStepsIndex } from '@schnick371/devsteps-shared';

// Type alias for list items
type ListItem = DevStepsIndex['items'][number];

export interface ProjectStats {
  totalItems: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byEisenhower: Record<string, number>;
}

/**
 * Aggregate project statistics from items
 */
export function getProjectStats(items: ListItem[]): ProjectStats {
  if (items.length === 0) {
    return {
      totalItems: 0,
      byType: {},
      byStatus: {},
      byPriority: {},
      byEisenhower: {},
    };
  }

  return {
    totalItems: items.length,
    byType: groupBy(items, 'type'),
    byStatus: groupBy(items, 'status'),
    byPriority: groupBy(items, 'eisenhower'), // Using eisenhower as priority
    byEisenhower: groupBy(items, 'eisenhower'),
  };
}

function groupBy(items: ListItem[], key: keyof ListItem): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]) || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
