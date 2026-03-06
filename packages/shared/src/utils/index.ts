/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Utils barrel export
 * Re-exports helper functions and constants from the utils layer.
 */

import type { ItemType, Methodology } from '../schemas/index.js';

// Export cache utilities
export {
  CACHE_CONFIG,
  type CacheStats,
  ContextCache,
  clearGlobalCache,
  getCache,
} from './cache.js';
// Export backup utilities
export {
  type BackupOptions,
  type BackupResult,
  backupGithubFiles,
} from './backup-github-files.js';
// Export init helpers
export {
  type CopiedGithubFiles,
  copyDevstepsDocs,
  copyGithubFiles,
  injectDevstepsComment,
  writeSetupMd,
} from './init-helpers.js';
// Export update helpers
export {
  type UpdateCopilotFilesOptions,
  type UpdateCopilotFilesResult,
  updateCopilotFiles,
} from './update-copilot-files.js';

/**
 * Type to plural directory mapping
 * Uses items/ subdirectory for git-inspired object store (SPIKE-008)
 */
export const TYPE_TO_DIRECTORY: Record<ItemType, string> = {
  epic: 'items/epics',
  story: 'items/stories',
  task: 'items/tasks',
  requirement: 'items/requirements',
  feature: 'items/features',
  bug: 'items/bugs',
  spike: 'items/spikes',
  test: 'items/tests',
};

/**
 * Get methodology configuration
 */
export function getMethodologyConfig(methodology: Methodology) {
  const configs = {
    scrum: {
      item_types: ['epic', 'story', 'task', 'bug', 'spike', 'test'] as ItemType[],
      item_prefixes: {
        epic: 'EPIC',
        story: 'STORY',
        task: 'TASK',
        bug: 'BUG',
        spike: 'SPIKE',
        test: 'TEST',
      },
      directories: [
        'items/epics',
        'items/stories',
        'items/tasks',
        'items/bugs',
        'items/spikes',
        'items/tests',
      ],
    },
    waterfall: {
      item_types: ['requirement', 'feature', 'task', 'bug', 'spike', 'test'] as ItemType[],
      item_prefixes: {
        requirement: 'REQ',
        feature: 'FEAT',
        task: 'TASK',
        bug: 'BUG',
        spike: 'SPIKE',
        test: 'TEST',
      },
      directories: [
        'items/requirements',
        'items/features',
        'items/tasks',
        'items/bugs',
        'items/spikes',
        'items/tests',
      ],
    },
    hybrid: {
      item_types: [
        'epic',
        'story',
        'requirement',
        'feature',
        'task',
        'bug',
        'spike',
        'test',
      ] as ItemType[],
      item_prefixes: {
        epic: 'EPIC',
        story: 'STORY',
        requirement: 'REQ',
        feature: 'FEAT',
        task: 'TASK',
        bug: 'BUG',
        spike: 'SPIKE',
        test: 'TEST',
      },
      directories: [
        'items/epics',
        'items/stories',
        'items/requirements',
        'items/features',
        'items/tasks',
        'items/bugs',
        'items/spikes',
        'items/tests',
      ],
    },
  };

  return configs[methodology];
}

/**
 * Generates a new item ID with proper prefix and number
 */
export function generateItemId(
  type: string,
  counter: number,
  prefixes?: Record<string, string>
): string {
  const defaultPrefixes: Record<string, string> = {
    epic: 'EPIC',
    story: 'STORY',
    task: 'TASK',
    requirement: 'REQ',
    feature: 'FEAT',
    bug: 'BUG',
    spike: 'SPIKE',
    test: 'TEST',
  };

  const prefixMap = prefixes || defaultPrefixes;
  const prefix = prefixMap[type] || 'ITEM';
  const paddedNumber = counter.toString().padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Get uppercase prefix from lowercase type name
 * Used for consistent counter key generation
 */
export function getTypePrefix(type: string): string {
  const prefixMap: Record<string, string> = {
    epic: 'EPIC',
    story: 'STORY',
    task: 'TASK',
    requirement: 'REQ',
    feature: 'FEAT',
    bug: 'BUG',
    spike: 'SPIKE',
    test: 'TEST',
  };
  return prefixMap[type] || 'ITEM';
}

/**
 * Parses an item ID into type and number
 */
export function parseItemId(id: string): { type: ItemType; number: number } | null {
  const match = id.match(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-(\d+)$/);
  if (!match) return null;

  const typeMap: Record<string, ItemType> = {
    EPIC: 'epic',
    STORY: 'story',
    TASK: 'task',
    REQ: 'requirement',
    FEAT: 'feature',
    BUG: 'bug',
    SPIKE: 'spike',
    TEST: 'test',
  };

  return {
    type: typeMap[match[1]],
    number: Number.parseInt(match[2], 10),
  };
}

/**
 * Formats a date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Gets current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitizes a string for use in filenames
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Normalizes escape sequences in description strings received from MCP tool calls.
 *
 * **Problem:** MCP clients (GitHub Copilot ≥ v1.0.0, Claude Code, etc.) transmit
 * multiline strings with literal two-character sequences `\n`, `\t` instead of
 * actual Unicode control characters. `JSON.parse` delivers these sequences unchanged,
 * so `writeFileSync` writes them verbatim — producing unreadable `.md` files.
 *
 * **Heuristic:** If the incoming string already contains real newlines (U+000A),
 * it is already properly formatted and returned unchanged. This makes the function
 * safe to call on both MCP-origin strings and CLI-origin strings, and prevents
 * double-conversion.
 *
 * **Handles:**
 * - `\n` (backslash + n) → real newline (LF)
 * - `\t` (backslash + t) → real tab
 * - `\r` (backslash + r) → removed (stray CR from Windows-style `\r\n` literals)
 *
 * @param value - The raw description string from an MCP tool argument
 * @returns A string with proper newline characters suitable for file I/O
 */
export function normalizeMarkdown(value: string): string {
  // Fast path: real newlines are present → already properly formatted
  if (value.includes('\n')) return value;

  // Slow path: convert MCP-style escape sequences to real control characters
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '');
}
