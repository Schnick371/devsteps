/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_doc_read_content
 * Read full markdown content of a DOC item with structured metadata.
 *
 * 3-tier fallback:
 *   Tier 1 — read .md file from affected_paths
 *   Tier 2 — fall back to description field in item JSON
 *   Tier 3 — fail-fast (affected_paths empty → immediate error)
 *
 * @see STORY-252 TASK-503 TASK-494
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  DIATAXIS_TYPES,
  type DiataxisType,
  extractFrontmatter,
  getItem,
  validateWorkspacePath,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Extract top-level headings from markdown content.
 * Returns entries like "H1: Title", "H2: Section", etc.
 */
function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push(`H${match[1].length}: ${match[2].trim()}`);
    }
  }
  return headings;
}

/**
 * Count words in markdown content (whitespace-tokenised).
 */
function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extract the Diataxis type from an item's tags array.
 * Returns the first tag that matches a known Diataxis type, or null.
 */
function diataxisTypeFromTags(tags: string[]): DiataxisType | null {
  for (const tag of tags) {
    if ((DIATAXIS_TYPES as string[]).includes(tag)) {
      return tag as DiataxisType;
    }
  }
  return null;
}

export default async function devstepsDocReadContentHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');
  const id = args.id as string;

  if (!id) {
    return { success: false, error: 'id is required' };
  }

  // Load item
  let result: Awaited<ReturnType<typeof getItem>>;
  try {
    result = await getItem(devstepsDir, id);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }

  const { metadata, description } = result;

  // Guard: handler is doc-only
  if (metadata.type !== 'doc') {
    return {
      success: false,
      error: `Item ${id} is of type '${metadata.type}', not 'doc'. devsteps_doc_read_content only works with doc items.`,
    };
  }

  // Tier 3 — fail-fast: no affected_paths means file location unknown
  if (!metadata.affected_paths || metadata.affected_paths.length === 0) {
    return {
      success: false,
      error: `affected_paths not set on doc item ${id} — run devsteps update ${id} --paths <path-to-md-file> to set it first.`,
    };
  }

  // Tier 1 — read .md file from affected_paths
  const mdPath = metadata.affected_paths.find((p) => p.endsWith('.md'));
  let content: string | null = null;

  if (mdPath) {
    const safePath = validateWorkspacePath(mdPath, workspaceRoot);
    if (!safePath) {
      return {
        success: false,
        error: `Path traversal detected in affected_paths entry '${mdPath}' for item ${id}. Path rejected.`,
      };
    }
    try {
      content = await readFile(safePath, 'utf-8');
    } catch {
      // fall through to Tier 2
    }
  }

  // Tier 2 — fall back to description field in item JSON
  if (content === null) {
    if (description && description.trim().length > 0) {
      content = description;
    } else {
      return {
        success: false,
        error: `Could not read content for ${id}: .md file not accessible and description field is empty.`,
      };
    }
  }

  // Extract frontmatter if present (STORY-278)
  let frontmatter = null;
  let frontmatterWarnings: { field: string; message: string }[] = [];
  let bodyContent = content;
  try {
    const fm = extractFrontmatter(content);
    frontmatter = fm.frontmatter;
    frontmatterWarnings = fm.warnings;
    bodyContent = fm.body;
  } catch (err) {
    return {
      success: false,
      error: `Frontmatter error in ${id}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const headings = extractHeadings(bodyContent);
  const word_count = countWords(bodyContent);
  // Frontmatter diataxis overrides tag-based heuristic
  const diataxis_type = frontmatter?.diataxis ?? diataxisTypeFromTags(metadata.tags ?? []);

  return {
    success: true,
    id: metadata.id,
    title: metadata.title,
    diataxis_type,
    content: bodyContent,
    word_count,
    headings,
    frontmatter,
    frontmatter_warnings: frontmatterWarnings.length > 0 ? frontmatterWarnings : undefined,
  };
}
