/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Document splitting — parse Markdown into fragment blocks for doc-import pipeline.
 * Pure functions: no filesystem access, no side-effects.
 *
 * @see TASK-537 STORY-274
 */

const FENCE_BACKTICK = '```';
const FENCE_TILDE = '~~~';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single content fragment extracted from a Markdown document. */
export interface FragmentBlock {
  /** Text content of the heading line that starts this fragment (without leading `#`). */
  title: string;
  /** Full content of the fragment including the heading line itself. */
  description: string;
  /** [startLine, endLine] 1-based, inclusive — position in original document. */
  headingRange: [number, number];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the ATX heading prefix for a given level (1–6). */
function headingPrefix(level: number): string {
  return `${'#'.repeat(level)} `;
}

/**
 * Determine if a line is an ATX heading at exactly the requested level.
 * Only called for non-fenced lines.
 */
function isHeadingAt(line: string, level: number): boolean {
  return line.startsWith(headingPrefix(level)) || line === '#'.repeat(level);
}

/** Extract the heading title from an ATX heading line. */
function _extractTitle(line: string, level: number): string {
  return line.startsWith(headingPrefix(level)) ? line.slice(level + 1).trimEnd() : '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split a Markdown document into fragments at ATX headings of `splitLevel`.
 *
 * Rules:
 * - Headings inside fenced code blocks (``` or ~~~) are NOT split boundaries
 * - Content before the first split-level heading is prepended to the first fragment
 * - If no heading at `splitLevel` exists, the entire document is returned as one fragment
 * - Empty document → []
 *
 * @param content     Raw Markdown string (may include YAML frontmatter)
 * @param splitLevel  ATX heading level to split at (1, 2, or 3)
 */
export function parseDocumentFragments(content: string, splitLevel: 1 | 2 | 3): FragmentBlock[] {
  if (!content.trim()) return [];

  // Strip leading frontmatter for splitting purposes, but keep original lines
  const lines = content.split('\n');
  let startLine = 0; // 0-based index of first non-frontmatter line

  // Skip frontmatter block
  if (lines[0] === '---') {
    let i = 1;
    while (i < lines.length && lines[i] !== '---') i++;
    if (i < lines.length) startLine = i + 1; // line after closing ---
  }

  const prefix = headingPrefix(splitLevel);
  const fragments: FragmentBlock[] = [];
  let inFence = false;
  let fenceMarker = '';

  /** Accumulator for the current fragment's lines. */
  let currentLines: string[] = [];
  /** 1-based start line of the current fragment's heading. */
  let currentStart = startLine + 1;
  /** True once the first split-level heading has been encountered. */
  let foundFirstHeading = false;
  /** Lines before the first split-level heading (prepended to first fragment). */
  const preambleLines: string[] = [];

  const flushFragment = (endIdx: number) => {
    if (currentLines.length === 0) return;
    // The heading line is the first line that matches the split level
    const headingLine = currentLines.find((l) => isHeadingAt(l, splitLevel)) ?? currentLines[0];
    const title = headingLine.startsWith(prefix)
      ? headingLine.slice(splitLevel + 1).trimEnd()
      : headingLine.replace(/^#+\s*/, '').trimEnd();
    fragments.push({
      title,
      description: currentLines.join('\n'),
      headingRange: [currentStart, endIdx],
    });
    currentLines = [];
  };

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1; // 1-based

    if (inFence) {
      currentLines.push(line);
      if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }

    if (line.startsWith(FENCE_BACKTICK)) {
      inFence = true;
      fenceMarker = FENCE_BACKTICK;
      currentLines.push(line);
      continue;
    }
    if (line.startsWith(FENCE_TILDE)) {
      inFence = true;
      fenceMarker = FENCE_TILDE;
      currentLines.push(line);
      continue;
    }

    // Check for split boundary
    if (isHeadingAt(line, splitLevel)) {
      if (foundFirstHeading) {
        flushFragment(lineNo - 1);
      } else {
        // First real heading found — merge preamble into this fragment
        foundFirstHeading = true;
        currentLines = [...preambleLines];
      }
      currentStart = lineNo;
    } else if (!foundFirstHeading) {
      preambleLines.push(line);
      continue;
    }

    currentLines.push(line);
  }

  // Flush the last fragment
  flushFragment(lines.length);

  // If no split-level heading was found, return whole content (minus frontmatter) as single fragment
  if (fragments.length === 0) {
    const body = lines.slice(startLine).join('\n');
    const h1Match = body.match(/^#\s+(.+)$/m);
    const fmMatch = FRONTMATTER_RE.exec(content);
    const fmTitle = fmMatch ? fmMatch[1].match(/^title:\s*(.+)$/m)?.[1]?.trim() : undefined;
    return [
      {
        title: h1Match ? h1Match[1].trim() : (fmTitle ?? ''),
        description: body,
        headingRange: [startLine + 1, lines.length],
      },
    ];
  }

  // If first fragment has no preamble prefix yet (preamble was empty), nothing to do.
  // If preamble exists and was already merged, also nothing to do.

  return fragments;
}
