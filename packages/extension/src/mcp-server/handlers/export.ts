import { existsSync, writeFileSync } from 'node:fs';
import { getWorkspacePath } from '../workspace.js';
import { join } from 'node:path';
import type { ItemType } from '@schnick371/devsteps-shared';
import { listItems, getItem, getConfig } from '@schnick371/devsteps-shared';

/**
 * Export project data
 */
export default async function exportHandler(args: {
  format: 'markdown' | 'json' | 'html';
  output_path?: string;
  include_types?: ItemType[];
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    if (!existsSync(devstepsDir)) {
      throw new Error('Project not initialized. Run devsteps-init first.');
    }

    const config = await getConfig(devstepsDir);

    // Use listItems() with optional type filter
    const itemsResult = await listItems(devstepsDir, {});
    let items = itemsResult.items;

    // Filter items by type if specified
    if (args.include_types && args.include_types.length > 0) {
      items = items.filter((i: any) => args.include_types!.includes(i.type));
    }

    // Load full metadata and descriptions using shared getItem()
    const fullItems = await Promise.all(
      items.map(async (item: any) => {
        const { metadata, description } = await getItem(devstepsDir, item.id);
        return { ...metadata, description };
      })
    );

    // Calculate stats from items
    const stats = {
      total: fullItems.length,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };

    for (const item of fullItems) {
      stats.by_type[item.type] = (stats.by_type[item.type] || 0) + 1;
      stats.by_status[item.status] = (stats.by_status[item.status] || 0) + 1;
    }

    let output: string;
    let filename: string;

    if (args.format === 'markdown') {
      output = generateMarkdown(config, stats, fullItems);
      filename = args.output_path || 'devsteps-export.md';
    } else if (args.format === 'html') {
      output = generateHTML(config, stats, fullItems);
      filename = args.output_path || 'devsteps-export.html';
    } else {
      output = JSON.stringify({ config, stats, items: fullItems }, null, 2);
      filename = args.output_path || 'devsteps-export.json';
    }

    const outputPath = join(getWorkspacePath(), filename);
    writeFileSync(outputPath, output);

    return {
      success: true,
      message: `Exported ${fullItems.length} items to ${filename}`,
      format: args.format,
      path: outputPath,
      item_count: fullItems.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function generateMarkdown(config: any, stats: any, items: any[]): string {
  let md = `# ${config.project_name}\n\n`;
  md += `**Created:** ${new Date(config.created).toLocaleDateString()}\n`;
  md += `**Updated:** ${new Date(config.updated).toLocaleDateString()}\n\n`;

  md += `## Statistics\n\n`;
  md += `- **Total Items:** ${stats.total}\n`;
  md += `- **By Type:** ${Object.entries(stats.by_type)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')}\n`;
  md += `- **By Status:** ${Object.entries(stats.by_status)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')}\n\n`;

  // Group by type
  const byType: Record<string, any[]> = {};
  for (const item of items) {
    if (!byType[item.type]) byType[item.type] = [];
    byType[item.type].push(item);
  }

  for (const [type, typeItems] of Object.entries(byType)) {
    md += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;

    for (const item of typeItems) {
      md += `### ${item.id}: ${item.title}\n\n`;
      md += `- **Status:** ${item.status}\n`;
      md += `- **Priority:** ${item.priority}\n`;
      if (item.assignee) md += `- **Assignee:** ${item.assignee}\n`;
      if (item.tags.length > 0) md += `- **Tags:** ${item.tags.join(', ')}\n`;
      md += `\n${item.description}\n\n`;
      md += `---\n\n`;
    }
  }

  return md;
}

function generateHTML(config: any, stats: any, items: any[]): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${config.project_name} - DevSteps Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1a1a1a; }
    h2 { color: #2563eb; margin-top: 2rem; }
    h3 { color: #4b5563; }
    .item { border: 1px solid #e5e7eb; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem; }
    .status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; }
    .draft { background: #fef3c7; }
    .in-progress { background: #dbeafe; }
    .done { background: #d1fae5; }
  </style>
</head>
<body>
  <h1>${config.project_name}</h1>
  <p><strong>Created:</strong> ${new Date(config.created).toLocaleDateString()}</p>
  <p><strong>Updated:</strong> ${new Date(config.updated).toLocaleDateString()}</p>
  
  <h2>Statistics</h2>
  <ul>
    <li><strong>Total Items:</strong> ${stats.total}</li>
    <li><strong>By Type:</strong> ${Object.entries(stats.by_type)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}</li>
    <li><strong>By Status:</strong> ${Object.entries(stats.by_status)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}</li>
  </ul>
`;

  const byType: Record<string, any[]> = {};
  for (const item of items) {
    if (!byType[item.type]) byType[item.type] = [];
    byType[item.type].push(item);
  }

  for (const [type, typeItems] of Object.entries(byType)) {
    html += `<h2>${type.charAt(0).toUpperCase() + type.slice(1)}s</h2>`;

    for (const item of typeItems) {
      html += `<div class="item">`;
      html += `<h3>${item.id}: ${item.title}</h3>`;
      html += `<p><span class="status ${item.status}">${item.status}</span> | Priority: ${item.priority}</p>`;
      if (item.assignee) html += `<p><strong>Assignee:</strong> ${item.assignee}</p>`;
      if (item.tags.length > 0) html += `<p><strong>Tags:</strong> ${item.tags.join(', ')}</p>`;
      html += `<div>${item.description.replace(/\n/g, '<br>')}</div>`;
      html += `</div>`;
    }
  }

  html += `</body></html>`;
  return html;
}
