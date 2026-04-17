/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Heading level shift utility for BOM assembly.
 * Adjusts Markdown heading depths while preserving fenced code blocks.
 *
 * @see TASK-436
 */

/** Fenced code block delimiters recognised by the state machine. */
const FENCE_BACKTICK = '```';
const FENCE_TILDE = '~~~';

/** Regex for ATX headings (# … ######). */
const HEADING_RE = /^(#{1,6})(\s|$)/;

/**
 * Shift all ATX heading levels in `content` by `offset`.
 *
 * Rules:
 * - `offset === 0` → identity (no allocations, early return)
 * - Heading at level N becomes `Math.min(N + offset, 6)` (hard cap H6)
 * - Lines inside fenced code blocks (``` or ~~~) are never touched
 * - Only first-level fence nesting is tracked (``` inside ~~~ block is content)
 *
 * @param content  Raw Markdown string
 * @param offset   Positive integer shift amount (0 = identity)
 */
export function adjustHeadingLevels(content: string, offset: number): string {
  if (offset === 0) return content;

  const lines = content.split('\n');
  const result: string[] = [];
  let inFence = false;
  let fenceMarker = '';

  for (const line of lines) {
    if (inFence) {
      result.push(line);
      // Close fence only when the same marker appears at line start
      if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }

    // Detect opening fence
    if (line.startsWith(FENCE_BACKTICK)) {
      inFence = true;
      fenceMarker = FENCE_BACKTICK;
      result.push(line);
      continue;
    }
    if (line.startsWith(FENCE_TILDE)) {
      inFence = true;
      fenceMarker = FENCE_TILDE;
      result.push(line);
      continue;
    }

    // Shift ATX heading
    const match = HEADING_RE.exec(line);
    if (match) {
      const hashes = match[1];
      const currentLevel = hashes.length;
      const newLevel = Math.min(currentLevel + offset, 6);
      result.push('#'.repeat(newLevel) + line.slice(currentLevel));
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}
