/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * BOM Rollup — assemble DOC items into a composite document (CCMS single-source rollup).
 * Supports Markdown, HTML, and structured JSON output targets.
 *
 * @see TASK-437
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractFrontmatter } from './frontmatter.js';
import { getItem } from './get.js';
import { listItems } from './list.js';
import { adjustHeadingLevels } from '../utils/heading-shift.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Controls how heading levels are normalised during assembly. */
export type HeadingOffsetMode = 'auto' | 'manual' | 'none';

/** Output format for the rollup document. */
export type RollupFormat = 'markdown' | 'html' | 'json';

export interface RollupOptions {
  /** Output file path. Defaults to `devsteps-rollup.{md|html|json}` in the working directory. */
  output?: string;
  /**
   * `'none'`   — no heading adjustment (raw strip-only)
   * `'auto'`   — compute offset from BOM hierarchy depth (H1 authors → depth 0 = offset 0)
   * `'manual'` — caller provides explicit per-item offsets via `item_offsets`
   */
  heading_offset_mode?: HeadingOffsetMode;
  /** Restrict rollup to a specific list of item IDs (in order). */
  item_ids?: string[];
  /**
   * Required for `heading_offset_mode: 'manual'` — maps item ID → heading offset.
   * Items not in the map receive offset 0.
   */
  item_offsets?: Record<string, number>;
  /**
   * Only include DOC items that carry ALL of these tags (AND semantics).
   * Ignored when `item_ids` is provided.
   */
  include_tags?: string[];
  /**
   * Exclude DOC items that carry ANY of these tags.
   * Applied after `include_tags` filter. Ignored when `item_ids` is provided.
   */
  exclude_tags?: string[];
  /**
   * Output format.
   *  `'markdown'` (default) — concatenated Markdown with `---` separators
   *  `'html'`               — single HTML document wrapping all fragments
   *  `'json'`               — structured JSON: `{ fragments: [{id, title, content}] }`
   */
  format?: RollupFormat;
  /**
   * When `true`, resolve `{{ref:ITEM-ID}}` transclusion markers in item
   * descriptions before assembly. Circular references are detected and
   * replaced with a comment. Defaults to `false` for backward compatibility.
   */
  enable_transclusion?: boolean;
}

export interface RollupResult {
  output: string;
  format: RollupFormat;
  item_count: number;
}

/** Internal fragment representation (after heading shift). */
interface ResolvedFragment {
  id: string;
  title: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MD_SEPARATOR = '\n\n---\n\n';

/** Pattern for transclusion markers: `{{ref:ITEM-ID}}` */
const TRANSCLUSION_RE = /\{\{ref:([A-Z]+-\d+)\}\}/g;

/**
 * Recursively resolve `{{ref:ITEM-ID}}` transclusion markers.
 * Prevents infinite loops via `visited` set (circular refs → inline comment).
 */
async function resolveTransclusions(
  content: string,
  devstepsDir: string,
  visited: Set<string>
): Promise<string> {
  const matches = [...content.matchAll(TRANSCLUSION_RE)];
  if (matches.length === 0) return content;

  let result = content;
  for (const match of matches) {
    const refId = match[1];
    if (visited.has(refId)) {
      // Circular reference guard — replace with a comment
      result = result.replace(match[0], `<!-- transclusion cycle: ${refId} -->`);
      continue;
    }
    try {
      const got = await getItem(devstepsDir, refId);
      const body = stripBody(got.description);
      const nextVisited = new Set(visited);
      nextVisited.add(refId);
      const resolved = await resolveTransclusions(body, devstepsDir, nextVisited);
      result = result.replace(match[0], resolved);
    } catch {
      // Item not found — leave original marker as-is
    }
  }
  return result;
}

/** Strip YAML frontmatter and return the body text. Never throws. */
function stripBody(description: string): string {
  try {
    return extractFrontmatter(description).body;
  } catch {
    return description;
  }
}

/**
 * Minimal Markdown → HTML renderer for Diataxis doc fragments.
 * Handles: ATX headings (H1–H6), fenced code blocks, paragraphs,
 * unordered/ordered lists, bold, italic, inline code, horizontal rules.
 * Does NOT handle: tables, block-quotes, HTML passthrough, nested lists.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let inList: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };

  const flushCode = () => {
    const escaped = codeLines
      .join('\n')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const langAttr = codeLang ? ` class="language-${codeLang}"` : '';
    out.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
    codeLines = [];
    codeLang = '';
    inCodeBlock = false;
  };

  const renderInline = (text: string): string => {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  };

  for (const line of lines) {
    // Fenced code block toggle
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)/);
    if (fenceMatch) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = fenceMatch[2].trim().split(' ')[0];
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // ATX headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      out.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      flushList();
      out.push('<hr>');
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-\*\+]\s+(.*)/);
    if (ulMatch) {
      if (inList !== 'ul') {
        flushList();
        out.push('<ul>');
        inList = 'ul';
      }
      out.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (inList !== 'ol') {
        flushList();
        out.push('<ol>');
        inList = 'ol';
      }
      out.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Empty line — flush list and paragraph break
    if (line.trim() === '') {
      flushList();
      out.push('');
      continue;
    }

    // Paragraph
    flushList();
    out.push(`<p>${renderInline(line)}</p>`);
  }

  if (inCodeBlock) flushCode();
  flushList();

  return out.join('\n');
}

/** Wrap fragment HTML sections in a full HTML document. */
function buildHtmlDocument(title: string, fragmentsHtml: string[]): string {
  const body = fragmentsHtml.join('\n<hr>\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
${body}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Assemble DOC items into a composite document (CCMS BOM rollup).
 *
 * @param devstepsDir  Absolute path to the `.devsteps` directory
 * @param options      Rollup configuration
 */
export async function rollupHandler(
  devstepsDir: string,
  options: RollupOptions = {}
): Promise<RollupResult> {
  const {
    heading_offset_mode = 'none',
    item_ids,
    item_offsets = {},
    include_tags,
    exclude_tags,
    format = 'markdown',
    enable_transclusion = false,
  } = options;

  const defaultExt = format === 'html' ? 'html' : format === 'json' ? 'json' : 'md';
  const output = options.output ?? join(process.cwd(), `devsteps-rollup.${defaultExt}`);

  // Resolve the ordered list of item IDs to rollup
  let ids: string[];
  if (item_ids && item_ids.length > 0) {
    ids = item_ids;
  } else {
    const result = await listItems(devstepsDir, {
      type: 'doc',
      ...(include_tags && include_tags.length > 0 ? { tags: include_tags } : {}),
    });
    ids = result.items.map((i) => i.id);
  }

  // Build resolved fragments
  const resolved: ResolvedFragment[] = [];
  let outputDepth = 0; // BOM position counter (only for items that pass filters)
  for (const id of ids) {
    const got = await getItem(devstepsDir, id);

    // Apply exclude_tags: skip items that carry ANY excluded tag
    if (exclude_tags && exclude_tags.length > 0) {
      const itemTags = got.metadata.tags ?? [];
      if (exclude_tags.some((tag) => itemTags.includes(tag))) continue;
    }

    const depth = outputDepth;
    outputDepth++;
    let body = stripBody(got.description);
    if (enable_transclusion) {
      body = await resolveTransclusions(body, devstepsDir, new Set([id]));
    }

    let offset = 0;
    if (heading_offset_mode === 'auto') {
      offset = depth;
    } else if (heading_offset_mode === 'manual') {
      offset = item_offsets[id] ?? 0;
    }

    const shifted = adjustHeadingLevels(body, offset);
    // Extract title from first H1 line of shifted content
    const firstHeading = shifted.match(/^#\s+(.+)/m);
    const title = firstHeading ? firstHeading[1].trim() : got.metadata.title;
    resolved.push({ id, title, content: shifted });
  }

  // Render to target format
  let fileContent: string;
  if (format === 'json') {
    fileContent = JSON.stringify(
      { fragments: resolved.map(({ id, title, content }) => ({ id, title, content })) },
      null,
      2
    );
  } else if (format === 'html') {
    const fragmentsHtml = resolved.map(({ content }) => markdownToHtml(content));
    const docTitle = resolved[0]?.title ?? 'DevSteps Document';
    fileContent = buildHtmlDocument(docTitle, fragmentsHtml);
  } else {
    fileContent = resolved.map(({ content }) => content).join(MD_SEPARATOR);
  }

  writeFileSync(output, fileContent, 'utf-8');

  return { output, format, item_count: resolved.length };
}
