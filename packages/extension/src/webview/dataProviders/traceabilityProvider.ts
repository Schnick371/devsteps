/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Traceability Graph Data Provider - Relationship visualization
 */

export interface TraceabilityData {
  nodes: Array<{ id: string; type: string; title: string; status: string }>;
  edges: Array<{ source: string; target: string; relation: string }>;
  totalItems?: number;
  displayedNodes?: number;
}

/**
 * Get traceability graph data with intelligent node limiting.
 * PERFORMANCE: Limits to top N most-connected items to avoid O(n²) force simulation lag.
 */
export function getTraceabilityData(items: any[]): TraceabilityData {
  if (items.length === 0) {
    return { nodes: [], edges: [] };
  }

  // PERFORMANCE OPTIMIZATION: Limit nodes for large projects
  const MAX_NODES = 50;
  
  // Calculate connection score for each item (total # of links)
  const itemsWithScores = items.map((item: any) => {
    const linkCount = item.linked_items 
      ? Object.values(item.linked_items).reduce((acc: number, targets: any) => 
          acc + (Array.isArray(targets) ? targets.length : 0), 0)
      : 0;
    
    return { item, score: linkCount };
  });

  // Sort by connection score descending
  const sortedItems = itemsWithScores.sort((a, b) => b.score - a.score);

  // Get top N most-connected items
  const topItems = sortedItems.slice(0, Math.min(MAX_NODES, items.length));
  const topIds = new Set(topItems.map(i => i.item.id));

  // Include items directly connected to top items (expand neighborhood)
  const connectedIds = new Set(topIds);
  topItems.forEach(({ item }) => {
    if (item.linked_items) {
      Object.values(item.linked_items).forEach((targets: any) => {
        if (Array.isArray(targets)) {
          targets.forEach((targetId: string) => connectedIds.add(targetId));
        }
      });
    }
  });

  // Build nodes from selected items
  const selectedItems = items.filter((item: any) => connectedIds.has(item.id));
  const nodes = selectedItems.map((item: any) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    status: item.status
  }));

  // Build edges only between selected nodes
  const edges: Array<{ source: string; target: string; relation: string }> = [];
  selectedItems.forEach((item: any) => {
    if (item.linked_items) {
      Object.entries(item.linked_items).forEach(([relation, targets]) => {
        if (Array.isArray(targets)) {
          targets.forEach((targetId: string) => {
            if (connectedIds.has(targetId)) {
              edges.push({ source: item.id, target: targetId, relation });
            }
          });
        }
      });
    }
  });

  return { 
    nodes, 
    edges,
    totalItems: items.length,
    displayedNodes: nodes.length
  };
}
