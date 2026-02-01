/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Statistics Data Provider - Project metrics aggregation
 */

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
export function getProjectStats(items: any[]): ProjectStats {
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
    byPriority: groupBy(items, 'priority'),
    byEisenhower: groupBy(items, 'eisenhower'),
  };
}

function groupBy(items: any[], key: string): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
