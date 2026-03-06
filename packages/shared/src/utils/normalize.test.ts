/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit Tests for normalizeMarkdown utility
 *
 * Context: MCP clients (GitHub Copilot ≥ v1.0.0, Claude Code, etc.) transmit
 * multiline strings as literal escape sequences rather than real Unicode control
 * characters. normalizeMarkdown converts these safely at the ingestion boundary.
 *
 * @see BUG-056
 * @see TASK-270
 */

import { describe, expect, it } from 'vitest';
import { normalizeMarkdown } from './index.js';

describe('normalizeMarkdown', () => {
  // ── Core conversion ─────────────────────────────────────────────────────────

  it('converts literal \\n sequences to real newlines', () => {
    const input = 'line one\\nline two\\nline three';
    const result = normalizeMarkdown(input);
    expect(result).toBe('line one\nline two\nline three');
    expect(result).toContain('\n');
    expect(result).not.toContain('\\n');
  });

  it('converts literal \\t sequences to real tabs', () => {
    const input = 'column1\\tcolumn2\\tcolumn3';
    const result = normalizeMarkdown(input);
    expect(result).toBe('column1\tcolumn2\tcolumn3');
    expect(result).toContain('\t');
    expect(result).not.toContain('\\t');
  });

  it('removes literal \\r sequences (stray CR from Windows \\r\\n literals)', () => {
    const input = 'line one\\r\\nline two';
    const result = normalizeMarkdown(input);
    expect(result).toBe('line one\nline two');
    expect(result).not.toContain('\\r');
    expect(result).not.toContain('\r');
  });

  it('handles all escape sequences together', () => {
    const input = 'Title\\n\\nParagraph one.\\n\\n- Item 1\\n- Item 2\\n\\n\\tIndented';
    const result = normalizeMarkdown(input);
    expect(result).toBe('Title\n\nParagraph one.\n\n- Item 1\n- Item 2\n\n\tIndented');
  });

  // ── Idempotency (fast path) ──────────────────────────────────────────────────

  it('leaves strings with real newlines unchanged (fast path)', () => {
    const input = 'line one\nline two\nline three';
    const result = normalizeMarkdown(input);
    expect(result).toBe(input);
  });

  it('is idempotent: calling twice on already-converted string returns same result', () => {
    const original = 'line one\\nline two';
    const once = normalizeMarkdown(original);
    const twice = normalizeMarkdown(once);
    expect(twice).toBe(once);
  });

  it('leaves strings with mixed real newlines and literal \\t unchanged (fast path)', () => {
    const input = 'line one\nline two\\t still here';
    const result = normalizeMarkdown(input);
    // Real newline present → fast path, backslash-t preserved
    expect(result).toBe(input);
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  it('returns empty string unchanged', () => {
    expect(normalizeMarkdown('')).toBe('');
  });

  it('returns plain single-line string unchanged', () => {
    const input = 'No escape sequences here.';
    expect(normalizeMarkdown(input)).toBe(input);
  });

  it('handles markdown description with heading and list (typical MCP input)', () => {
    // This is the real-world input that triggered BUG-056
    const mcpInput =
      '## Implemented\\n\\n### Show-ServerLayoutEditor\\n- Build `nameToRoles` map before rendering table\\n- Rows with shared hostname → ForegroundColor Yellow + ⚠️ indicator\\n\\n### environment.ps1\\n- After saving: rebuild `$env.Nodes` PSCustomObject';

    const result = normalizeMarkdown(mcpInput);

    expect(result).toContain('## Implemented\n');
    expect(result).toContain('### Show-ServerLayoutEditor\n');
    expect(result).toContain('- Build `nameToRoles`');
    expect(result).not.toContain('\\n');
  });

  it('handles default description template with real newlines (CLI usage)', () => {
    // CLI users provide real newlines — must NOT be double-converted
    const cliInput = '# My Story\n\n<!-- Add detailed description here -->\n';
    const result = normalizeMarkdown(cliInput);
    expect(result).toBe(cliInput);
  });

  it('handles string with only whitespace', () => {
    expect(normalizeMarkdown('   ')).toBe('   ');
    expect(normalizeMarkdown('\n')).toBe('\n'); // real newline → fast path
  });

  it('preserves Unicode characters correctly', () => {
    const input = 'Emoji: ⚠️\\nArrow: →\\nUmlaut: äöü';
    const result = normalizeMarkdown(input);
    expect(result).toBe('Emoji: ⚠️\nArrow: →\nUmlaut: äöü');
  });

  // ── append_description use case ──────────────────────────────────────────────

  it('normalizes text intended for append_description correctly', () => {
    const appendContent = '\\n\\n## Added in v2\\n- New feature X\\n- Fixed issue Y';
    const result = normalizeMarkdown(appendContent);
    expect(result).toBe('\n\n## Added in v2\n- New feature X\n- Fixed issue Y');
  });
});
