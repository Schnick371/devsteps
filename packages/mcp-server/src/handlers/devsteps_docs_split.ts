/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_split
 * Splits a Markdown file (or inline content) into fragments at ATX heading boundaries.
 * Returns FragmentBlock[] so the agent can loop mcp_devsteps_add per fragment (Mode B/C).
 *
 * @see STORY-274 TASK-537
 */

import { readFile } from 'node:fs/promises';
import { parseDocumentFragments, validateWorkspacePath } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

export default async function devstepsDocsSplitHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();

  // Exactly one of file | content_markdown must be supplied
  const filePath = typeof args.file === 'string' ? args.file : undefined;
  const inlineContent =
    typeof args.content_markdown === 'string' ? args.content_markdown : undefined;

  if (!filePath && !inlineContent) {
    return {
      success: false,
      error:
        'Either "file" (path to a .md file) or "content_markdown" (inline Markdown) is required.',
    };
  }
  if (filePath && inlineContent) {
    return {
      success: false,
      error: '"file" and "content_markdown" are mutually exclusive — provide only one.',
    };
  }

  // Validate split_at_level
  const raw = args.split_at_level;
  const splitAtLevel: 1 | 2 | 3 = raw === 1 || raw === 2 || raw === 3 ? raw : 1;

  let content: string;

  if (filePath) {
    // Path-traversal guard — returns absolute safe path or null
    const safePath = validateWorkspacePath(filePath, workspaceRoot);
    if (!safePath) {
      return {
        success: false,
        error: `Path traversal detected: "${filePath}" resolves outside the workspace root.`,
      };
    }

    try {
      content = await readFile(safePath, 'utf-8');
    } catch (err) {
      return {
        success: false,
        error: `Could not read file "${filePath}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else {
    content = inlineContent as string;
  }

  const fragments = parseDocumentFragments(content, splitAtLevel);

  return {
    success: true,
    split_at_level: splitAtLevel,
    fragment_count: fragments.length,
    fragments,
    next_steps: [
      `Split into ${fragments.length} fragment(s) at H${splitAtLevel} boundaries.`,
      'For each fragment: call mcp_devsteps_add with type="doc", title=fragment.title, description=fragment.description.',
    ],
  };
}
