/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Traceability Graph Renderer - SVG relationship visualization
 */

export interface TraceabilityNode {
  id: string;
  status: string;
  x?: number;
  y?: number;
}

export interface TraceabilityEdge {
  source: string;
  target: string;
  type?: string;
}

export interface TraceabilityData {
  nodes: TraceabilityNode[];
  edges: TraceabilityEdge[];
}

/**
 * Generate inline JavaScript for traceability graph rendering
 */
export function getTraceabilityGraphScript(traceability: TraceabilityData): string {
  const nodes = JSON.stringify(traceability.nodes);
  const edges = JSON.stringify(traceability.edges);

  return `
    // Simple SVG force-directed graph
    (function() {
      const container = document.getElementById('traceabilityGraph');
      if (!container) return;
      
      const nodes = ${nodes};
      const edges = ${edges};
      
      if (nodes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--vscode-descriptionForeground);">No relationships found</p>';
        return;
      }
      
      const width = container.clientWidth || 800;
      const height = 400;
      
      // Create SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.style.backgroundColor = 'var(--vscode-editor-background)';
      container.appendChild(svg);
      
      // Simple layout - circular arrangement
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = Math.min(width, height) / 3;
        node.x = width / 2 + radius * Math.cos(angle);
        node.y = height / 2 + radius * Math.sin(angle);
      });
      
      // Draw edges
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        line.setAttribute('stroke', 'var(--vscode-panel-border)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', node.status === STATUS.DONE ? '#4caf50' : '#2196f3');
        circle.setAttribute('data-item-id', node.id);
        circle.style.cursor = 'pointer';
        svg.appendChild(circle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y - 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--vscode-editor-foreground)');
        text.setAttribute('font-size', '10');
        text.textContent = node.id;
        svg.appendChild(text);
      });
    })();
  `;
}
