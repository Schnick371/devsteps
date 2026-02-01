/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Timeline Data Provider - Recent activity tracking
 */

import type { DevStepsIndex } from '@schnick371/devsteps-shared';

// Type alias for list items
type ListItem = DevStepsIndex['items'][number];

/**
 * Get recent timeline activity (most recent 20 items)
 */
export function getTimelineData(items: ListItem[]): ListItem[] {
  if (items.length === 0) {
    return [];
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

  return sorted.slice(0, 20);
}
