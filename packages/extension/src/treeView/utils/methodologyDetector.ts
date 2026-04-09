/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Methodology detector - Determine Scrum vs Waterfall for work items
 */

import type { WorkItem } from '../types.js';

/**
 * Detect methodology for a work item based on its type and parent relationships.
 * The `visited` set guards against cycles in linked_items (e.g. self-implements loops).
 */
export function getItemMethodology(
  item: WorkItem,
  allItems: Map<string, WorkItem>,
  visited: Set<string> = new Set()
): 'scrum' | 'waterfall' | 'cross-cutting' {
  // Cycle guard: if we have already visited this item, stop recursion
  if (visited.has(item.id)) {
    return 'scrum';
  }
  visited.add(item.id);

  // Cross-cutting types: doc is always cross-cutting
  if (item.type === 'doc') {
    return 'cross-cutting';
  }

  // Scrum-only types
  if (['epic', 'story', 'spike'].includes(item.type)) {
    return 'scrum';
  }

  // Waterfall-only types
  if (['requirement', 'feature'].includes(item.type)) {
    return 'waterfall';
  }

  // Shared types (task, bug, test) - check parent
  const parent = item.linked_items?.implements?.[0];
  if (parent) {
    const parentItem = allItems.get(parent);
    if (parentItem) {
      // Recursive check parent's methodology
      return getItemMethodology(parentItem, allItems, visited);
    }
  }

  // Bug-specific: check relates-to or affects for context
  if (item.type === 'bug') {
    const relatedItem = item.linked_items?.['relates-to']?.[0];
    if (relatedItem) {
      const relatedItemData = allItems.get(relatedItem);
      if (relatedItemData) {
        return getItemMethodology(relatedItemData, allItems, visited);
      }
    }
  }

  // test with no parent → cross-cutting
  if (item.type === 'test') {
    return 'cross-cutting';
  }

  // Default to scrum if no parent found
  return 'scrum';
}
