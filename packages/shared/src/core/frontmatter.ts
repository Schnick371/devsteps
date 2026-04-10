/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * YAML Frontmatter extraction and validation for doc-item .md files.
 * Pure functions: no filesystem access, operates on string content.
 *
 * @see STORY-278
 */

import { z } from 'zod';
import { DIATAXIS_TYPES, type DiataxisType } from './heuristic-classify.js';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/** Pattern for valid DevSteps item IDs */
const ITEM_ID_PATTERN = /^(STORY|TASK|BUG|EPIC|SPIKE|FEATURE|DOC|REQUIREMENT|TEST)-\d+$/;

/** Zod schema for doc-item YAML frontmatter */
export const DocFrontmatterSchema = z
  .object({
    diataxis: z.enum(DIATAXIS_TYPES as [DiataxisType, ...DiataxisType[]]).optional(),
    related_items: z
      .array(z.string().regex(ITEM_ID_PATTERN, 'Invalid item ID format'))
      .optional()
      .default([]),
    status: z.enum(['draft', 'approved', 'review']).optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  })
  .strict();

export type DocFrontmatter = z.infer<typeof DocFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface FrontmatterWarning {
  field: string;
  message: string;
}

export interface FrontmatterResult {
  /** Parsed and validated frontmatter (null if none present) */
  frontmatter: DocFrontmatter | null;
  /** Markdown body without frontmatter block */
  body: string;
  /** Warnings for unknown fields (non-fatal) */
  warnings: FrontmatterWarning[];
}

// ---------------------------------------------------------------------------
// Known fields for warning detection
// ---------------------------------------------------------------------------

const KNOWN_FIELDS = new Set(['diataxis', 'related_items', 'status', 'author', 'tags']);

// ---------------------------------------------------------------------------
// Minimal YAML parser (covers flat scalars, simple arrays)
// ---------------------------------------------------------------------------

/**
 * Parse a minimal YAML frontmatter string into a key-value object.
 * Supports: scalar values, inline arrays `[a, b]`, and block arrays `- item`.
 * Does NOT support nested objects, multi-line strings, or anchors.
 *
 * @throws Error if the YAML is malformed
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    const keyMatch = line.match(/^(\w[\w_]*):\s*(.*)/);
    if (!keyMatch) {
      throw new Error(`Invalid YAML at line ${i + 1}: "${line.trim()}"`);
    }

    const key = keyMatch[1];
    const valuePart = keyMatch[2].trim();

    // Inline array: key: [a, b, c]
    if (valuePart.startsWith('[')) {
      const inner = valuePart.slice(1, valuePart.lastIndexOf(']')).trim();
      if (inner === '') {
        result[key] = [];
      } else {
        result[key] = inner.split(',').map((s) => unquote(s.trim()));
      }
      i++;
      continue;
    }

    // Block array: key:\n  - item\n  - item
    if (valuePart === '') {
      // Could be a block array or empty value
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].match(/^\s+-\s+/)) {
        const itemMatch = lines[j].match(/^\s+-\s+(.*)/);
        if (itemMatch) {
          items.push(unquote(itemMatch[1].trim()));
        }
        j++;
      }
      if (items.length > 0) {
        result[key] = items;
        i = j;
        continue;
      }
      // Empty value
      result[key] = undefined;
      i++;
      continue;
    }

    // Scalar value
    result[key] = unquote(valuePart);
    i++;
  }

  return result;
}

/** Remove surrounding quotes from a string value */
function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract and validate YAML frontmatter from doc-item markdown content.
 *
 * Rules:
 * - Frontmatter is optional — files without `---` delimiters return `frontmatter: null`
 * - All fields are optional
 * - Invalid YAML syntax → throws Error
 * - Invalid field values (e.g. unknown diataxis type) → throws Error with details
 * - Unknown fields → warning (non-fatal, for forward-compatibility)
 *
 * @param content  Full markdown content (may or may not have frontmatter)
 * @returns Parsed frontmatter, body text, and any warnings
 * @throws Error if frontmatter is present but contains invalid YAML or invalid values
 */
export function extractFrontmatter(content: string): FrontmatterResult {
  // Check for frontmatter delimiters
  if (!content.startsWith('---')) {
    return { frontmatter: null, body: content, warnings: [] };
  }

  // Find closing delimiter
  const closingIndex = content.indexOf('\n---', 3);
  if (closingIndex === -1) {
    throw new Error('Frontmatter opening "---" found but no closing "---" delimiter');
  }

  const yamlBlock = content.slice(4, closingIndex); // skip opening "---\n"
  const body = content.slice(closingIndex + 4).replace(/^\n/, ''); // skip closing "---\n"

  // Parse YAML
  let raw: Record<string, unknown>;
  try {
    raw = parseSimpleYaml(yamlBlock);
  } catch (err) {
    throw new Error(
      `Invalid YAML in frontmatter: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Detect unknown fields → warnings
  const warnings: FrontmatterWarning[] = [];
  for (const key of Object.keys(raw)) {
    if (!KNOWN_FIELDS.has(key)) {
      warnings.push({
        field: key,
        message: `Unknown frontmatter field "${key}" — will be ignored. Known fields: ${[...KNOWN_FIELDS].join(', ')}`,
      });
    }
  }

  // Validate with Zod (strict mode rejects unknown fields — strip them first)
  const knownOnly: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    if (KNOWN_FIELDS.has(key)) {
      knownOnly[key] = raw[key];
    }
  }

  const parsed = DocFrontmatterSchema.safeParse(knownOnly);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((iss) => `  ${iss.path.join('.')}: ${iss.message}`)
      .join('\n');
    throw new Error(`Invalid frontmatter values:\n${issues}`);
  }

  return {
    frontmatter: parsed.data,
    body,
    warnings,
  };
}
