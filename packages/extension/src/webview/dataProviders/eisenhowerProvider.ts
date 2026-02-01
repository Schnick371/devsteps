/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Eisenhower Matrix Data Provider - Priority quadrants
 */

import type { DevStepsIndex } from '@schnick371/devsteps-shared';

// Type alias for list items
type ListItem = DevStepsIndex['items'][number];

export interface EisenhowerData {
  Q1: ListItem[];
  Q2: ListItem[];
  Q3: ListItem[];
  Q4: ListItem[];
}

/**
 * Categorize items into Eisenhower Matrix quadrants
 */
export function getEisenhowerData(items: ListItem[]): EisenhowerData {
  if (items.length === 0) {
    return { Q1: [], Q2: [], Q3: [], Q4: [] };
  }

  return {
    Q1: items.filter((i) => i.eisenhower === 'urgent-important'),
    Q2: items.filter((i) => i.eisenhower === 'not-urgent-important'),
    Q3: items.filter((i) => i.eisenhower === 'urgent-not-important'),
    Q4: items.filter((i) => i.eisenhower === 'not-urgent-not-important'),
  };
}
