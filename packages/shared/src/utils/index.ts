import type { ItemType, Methodology } from '../schemas/index.js';

// Export cache utilities
export {
  ContextCache,
  CACHE_CONFIG,
  getCache,
  clearGlobalCache,
  type CacheStats,
} from './cache.js';

/**
 * Type to plural directory mapping
 */
export const TYPE_TO_DIRECTORY: Record<ItemType, string> = {
  epic: 'epics',
  story: 'stories',
  task: 'tasks',
  requirement: 'requirements',
  feature: 'features',
  bug: 'bugs',
  spike: 'spikes',
  test: 'tests',
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
      directories: ['epics', 'stories', 'tasks', 'bugs', 'spikes', 'tests'],
    },
    waterfall: {
      item_types: ['requirement', 'feature', 'task', 'bug', 'test'] as ItemType[],
      item_prefixes: {
        requirement: 'REQ',
        feature: 'FEAT',
        task: 'TASK',
        bug: 'BUG',
        test: 'TEST',
      },
      directories: ['requirements', 'features', 'tasks', 'bugs', 'tests'],
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
        'epics',
        'stories',
        'requirements',
        'features',
        'tasks',
        'bugs',
        'spikes',
        'tests',
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
