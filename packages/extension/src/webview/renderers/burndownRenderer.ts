/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Burndown Chart Renderer - Canvas visualization script
 */

import type { BurndownData } from '../dataProviders/burndownProvider.js';

/**
 * Generate inline JavaScript for burndown chart rendering
 */
export function getBurndownChartScript(burndown: BurndownData): string {
  const labels = burndown.dataPoints.map((p) => p.date.substring(5)); // Show MM-DD
  const idealData = burndown.dataPoints.map((p) => p.ideal);
  const actualData = burndown.dataPoints.map((p) => p.actual);

  return `
    // Simple canvas-based chart (Chart.js alternative for now)
    (function() {
      const canvas = document.getElementById('burndownChart');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      const labels = ${JSON.stringify(labels)};
      const ideal = ${JSON.stringify(idealData)};
      const actual = ${JSON.stringify(actualData)};
      
      const maxValue = Math.max(...ideal, ...actual);
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      // Clear canvas
      ctx.fillStyle = 'var(--vscode-editor-background, #1e1e1e)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw axes
      ctx.strokeStyle = 'var(--vscode-panel-border, #444)';
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
      ctx.setLineDash([2, 2]);
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Helper function to plot line
      function plotLine(data, color, dashed = false) {
        if (data.length === 0) return;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (dashed) ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        data.forEach((value, index) => {
          const x = padding + (chartWidth * index) / (data.length - 1 || 1);
          const y = height - padding - (chartHeight * value) / (maxValue || 1);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Draw ideal line (dashed)
      plotLine(ideal, '#4caf50', true);
      
      // Draw actual line (solid)
      plotLine(actual, '#2196f3', false);
      
      // Draw legend
      ctx.fillStyle = 'var(--vscode-editor-foreground, #ccc)';
      ctx.font = '12px sans-serif';
      ctx.fillText('— Ideal', width - 100, 20);
      ctx.fillText('— Actual', width - 100, 35);
      
      ctx.strokeStyle = '#4caf50';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(width - 120, 16);
      ctx.lineTo(width - 105, 16);
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.strokeStyle = '#2196f3';
      ctx.beginPath();
      ctx.moveTo(width - 120, 31);
      ctx.lineTo(width - 105, 31);
      ctx.stroke();
    })();
  `;
}
