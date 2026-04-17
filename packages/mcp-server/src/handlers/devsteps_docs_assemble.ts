/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_assemble
 * Assembles DOC items into a composite document (Markdown, HTML, or JSON).
 * CCMS BOM rollup — single-source with tag filtering and multi-format output.
 *
 * @see TASK-437 STORY-268
 */

import { join } from 'node:path';
import type { RollupFormat } from '@schnick371/devsteps-shared';
import { rollupHandler } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

const VALID_FORMATS: RollupFormat[] = ['markdown', 'html', 'json'];

export default async function devstepsDocsAssembleHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');

  const format: RollupFormat = VALID_FORMATS.includes(args.format as RollupFormat)
    ? (args.format as RollupFormat)
    : 'markdown';

  const defaultExt = format === 'html' ? 'html' : format === 'json' ? 'json' : 'md';
  const output =
    typeof args.output_path === 'string'
      ? args.output_path
      : join(workspaceRoot, `devsteps-rollup.${defaultExt}`);

  const heading_offset_mode =
    args.heading_offset_mode === 'auto' || args.heading_offset_mode === 'manual'
      ? (args.heading_offset_mode as 'auto' | 'manual')
      : 'none';

  const item_ids =
    Array.isArray(args.item_ids) && args.item_ids.every((x: unknown) => typeof x === 'string')
      ? (args.item_ids as string[])
      : undefined;

  const item_offsets =
    args.item_offsets !== null &&
    typeof args.item_offsets === 'object' &&
    !Array.isArray(args.item_offsets)
      ? (args.item_offsets as Record<string, number>)
      : {};

  const include_tags =
    Array.isArray(args.include_tags) &&
    args.include_tags.every((x: unknown) => typeof x === 'string')
      ? (args.include_tags as string[])
      : undefined;

  const exclude_tags =
    Array.isArray(args.exclude_tags) &&
    args.exclude_tags.every((x: unknown) => typeof x === 'string')
      ? (args.exclude_tags as string[])
      : undefined;

  const enable_transclusion = args.enable_transclusion === true;

  const result = await rollupHandler(devstepsDir, {
    output,
    format,
    heading_offset_mode,
    item_ids,
    item_offsets,
    include_tags,
    exclude_tags,
    enable_transclusion,
  });

  return {
    success: true,
    output_path: result.output,
    format: result.format,
    item_count: result.item_count,
    heading_offset_mode,
    next_steps: [
      `Rolled up ${result.item_count} DOC items → ${result.output} (${result.format})`,
      'Review the file: check heading levels, no H7+, no raw frontmatter blocks visible.',
    ],
  };
}
