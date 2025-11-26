/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Eisenhower Matrix Data Provider - Priority quadrants
 */

export interface EisenhowerData {
  Q1: any[];
  Q2: any[];
  Q3: any[];
  Q4: any[];
}

/**
 * Categorize items into Eisenhower Matrix quadrants
 */
export function getEisenhowerData(items: any[]): EisenhowerData {
  if (items.length === 0) {
    return { Q1: [], Q2: [], Q3: [], Q4: [] };
  }

  return {
    Q1: items.filter((i: any) => i.eisenhower === 'urgent-important'),
    Q2: items.filter((i: any) => i.eisenhower === 'not-urgent-important'),
    Q3: items.filter((i: any) => i.eisenhower === 'urgent-not-important'),
    Q4: items.filter((i: any) => i.eisenhower === 'not-urgent-not-important')
  };
}
