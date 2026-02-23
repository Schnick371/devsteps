/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * TreeView utilities — pure filter and sort functions for work items
 */

import type { FilterState, SortState, WorkItem } from '../types.js';

/**
 * Apply filter state to a list of work items
 */
export function applyFilters(items: WorkItem[], filterState: FilterState): WorkItem[] {
  let filtered = items;

  if (filterState.hideDone) {
    filtered = filtered.filter((item) => item.status !== 'done');
  }

  if (filterState.statuses.length > 0) {
    filtered = filtered.filter((item) => filterState.statuses.includes(item.status));
  }

  if (filterState.priorities.length > 0) {
    filtered = filtered.filter((item) => filterState.priorities.includes(item.priority));
  }

  if (filterState.types.length > 0) {
    filtered = filtered.filter((item) => filterState.types.includes(item.type));
  }

  if (filterState.tags.length > 0) {
    filtered = filtered.filter((item) =>
      item.tags?.some((tag) => filterState.tags.includes(tag))
    );
  }

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

/**
 * Apply sort state to a list of work items
 */
export function applySorting(items: WorkItem[], sortState: SortState): WorkItem[] {
  const sorted = [...items];
  const { by, order } = sortState;

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (by) {
      case 'id':
        comparison = a.id.localeCompare(b.id);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created':
        comparison = new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime();
        break;
      case 'updated':
        comparison = new Date(a.updated || 0).getTime() - new Date(b.updated || 0).getTime();
        break;
      case 'priority': {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison =
          (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4);
        break;
      }
      case 'status': {
        const statusOrder = {
          'in-progress': 0, planned: 1, draft: 2, review: 3,
          blocked: 4, done: 5, cancelled: 6, obsolete: 7,
        };
        comparison =
          (statusOrder[a.status as keyof typeof statusOrder] ?? 8) -
          (statusOrder[b.status as keyof typeof statusOrder] ?? 8);
        break;
      }
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
