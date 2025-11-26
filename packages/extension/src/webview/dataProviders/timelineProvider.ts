/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Timeline Data Provider - Recent activity tracking
 */

/**
 * Get recent timeline activity (most recent 20 items)
 */
export function getTimelineData(items: any[]): any[] {
  if (items.length === 0) {
    return [];
  }

  const sorted = items.sort(
    (a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

  return sorted.slice(0, 20);
}
