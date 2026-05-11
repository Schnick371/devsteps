/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Epic Burndown Data Provider — per-epic progress data for accordion SVG charts
 */

import type { ListItemEntry } from '@schnick371/devsteps-shared';

export interface EpicProgress {
  id: string;
  title: string;
  total: number;
  done: number;
  children: Array<{ id: string; status: string; updated: string }>;
}

/**
 * Extract per-epic progress from all items.
 * Uses linked_items.implements to find children of each epic.
 */
export function getEpicProgressData(items: ListItemEntry[]): EpicProgress[] {
  const epics = items.filter((i) => i.type === 'epic');
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return epics
    .map((epic) => {
      // Find all items that implement this epic
      const childIds = items
        .filter(
          (i) =>
            i.linked_items?.implements?.includes(epic.id) ||
            i.linked_items?.['implemented-by']?.includes(epic.id)
        )
        .map((i) => i.id);

      // Also check epic's own implemented-by links
      const epicImplBy = epic.linked_items?.['implemented-by'] ?? [];
      const allChildIds = [...new Set([...childIds, ...epicImplBy])];

      const children = allChildIds
        .map((id) => itemMap.get(id))
        .filter((i): i is ListItemEntry => i !== undefined)
        .map((i) => ({ id: i.id, status: i.status, updated: i.updated }));

      return {
        id: epic.id,
        title: epic.title,
        total: children.length,
        done: children.filter((c) => c.status === 'done').length,
        children,
      };
    })
    .sort((a, b) => {
      // Sort by completion percentage descending, then by ID
      const pctA = a.total > 0 ? a.done / a.total : 0;
      const pctB = b.total > 0 ? b.done / b.total : 0;
      return pctB - pctA || a.id.localeCompare(b.id);
    });
}
