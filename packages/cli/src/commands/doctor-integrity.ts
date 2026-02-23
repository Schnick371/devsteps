/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Doctor integrity checks for relationship consistency
 * Implements TASK-044 (invalid relations), TASK-045 (orphaned items),
 * TASK-046 (broken references), TASK-047 (asymmetric links)
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getConfig,
  type ItemMetadata,
  type Methodology,
  validateRelationship,
} from '@schnick371/devsteps-shared';

export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string[];
  fix?: string;
}

/** All relation types and their bi-directional inverses */
const INVERSE_RELATIONS: Record<string, string> = {
  implements: 'implemented-by',
  'implemented-by': 'implements',
  'tested-by': 'tests',
  tests: 'tested-by',
  blocks: 'blocked-by',
  'blocked-by': 'blocks',
  'depends-on': 'required-by',
  'required-by': 'depends-on',
  'relates-to': 'relates-to',
  supersedes: 'superseded-by',
  'superseded-by': 'supersedes',
};

/** Top-level item types that don't need a parent */
const TOP_LEVEL_TYPES = new Set(['epic', 'requirement']);

/** Subdirectory → type mapping derived from TYPE_TO_DIRECTORY inverse */
const DIR_TO_TYPE: Record<string, string> = {
  'items/epics': 'epic',
  'items/stories': 'story',
  'items/tasks': 'task',
  'items/bugs': 'bug',
  'items/spikes': 'spike',
  'items/features': 'feature',
  'items/requirements': 'requirement',
  'items/tests': 'test',
};

/**
 * Load all item metadata from the refs-style items directory.
 * Returns a Map<id, metadata> for O(1) lookups.
 */
function loadAllItems(devstepsDir: string): Map<string, ItemMetadata> {
  const items = new Map<string, ItemMetadata>();
  const itemsRoot = join(devstepsDir, 'items');

  if (!existsSync(itemsRoot)) return items;

  for (const subdir of Object.keys(DIR_TO_TYPE)) {
    const dirPath = join(devstepsDir, subdir);
    if (!existsSync(dirPath)) continue;

    try {
      for (const filename of readdirSync(dirPath)) {
        if (!filename.endsWith('.json')) continue;
        try {
          const raw = readFileSync(join(dirPath, filename), 'utf-8');
          const meta = JSON.parse(raw) as ItemMetadata;
          if (meta.id) items.set(meta.id, meta);
        } catch {
          // Skip malformed files — caught by other checks
        }
      }
    } catch {
      /* directory may not exist */
    }
  }

  return items;
}

/** TASK-046: Detect references to non-existent items */
function detectBrokenReferences(allItems: Map<string, ItemMetadata>): CheckResult {
  const broken: string[] = [];

  for (const [id, meta] of allItems) {
    if (!meta.linked_items) continue;
    for (const [relType, targets] of Object.entries(meta.linked_items)) {
      for (const targetId of targets as string[]) {
        if (!allItems.has(targetId)) {
          broken.push(`${id} →[${relType}]→ ${targetId} (not found)`);
        }
      }
    }
  }

  if (broken.length === 0) {
    return { name: 'Broken References', status: 'pass', message: 'No broken references found' };
  }

  return {
    name: 'Broken References',
    status: 'fail',
    message: `${broken.length} broken reference(s) detected`,
    details: broken.slice(0, 10),
    fix: 'Run: devsteps unlink <source> <relation> <target> to clean up',
  };
}

/** TASK-047: Detect asymmetric links (A→B but B doesn't reference A back) */
function detectAsymmetricLinks(allItems: Map<string, ItemMetadata>): CheckResult {
  const asymmetric: string[] = [];

  for (const [id, meta] of allItems) {
    if (!meta.linked_items) continue;

    for (const [relType, targets] of Object.entries(meta.linked_items)) {
      const expectedInverse = INVERSE_RELATIONS[relType];
      if (!expectedInverse) continue;

      for (const targetId of targets as string[]) {
        const targetMeta = allItems.get(targetId);
        if (!targetMeta?.linked_items) continue;

        const inverseArray = (targetMeta.linked_items as Record<string, string[]>)[
          expectedInverse
        ];
        if (!inverseArray?.includes(id)) {
          asymmetric.push(
            `${id} →[${relType}]→ ${targetId} but ${targetId} missing [${expectedInverse}]→ ${id}`
          );
        }
      }
    }
  }

  if (asymmetric.length === 0) {
    return {
      name: 'Asymmetric Links',
      status: 'pass',
      message: 'All bidirectional links are consistent',
    };
  }

  return {
    name: 'Asymmetric Links',
    status: 'warn',
    message: `${asymmetric.length} asymmetric link(s) detected`,
    details: asymmetric.slice(0, 10),
    fix: 'Run: devsteps link <source> <relation> <target> to re-create missing inverse',
  };
}

/** TASK-044: Detect invalid relationship types between item types */
async function detectInvalidRelationships(
  allItems: Map<string, ItemMetadata>,
  methodology: Methodology
): Promise<CheckResult> {
  const invalid: string[] = [];

  for (const [id, meta] of allItems) {
    if (!meta.linked_items) continue;

    for (const [relType, targets] of Object.entries(meta.linked_items)) {
      for (const targetId of targets as string[]) {
        const targetMeta = allItems.get(targetId);
        if (!targetMeta) continue; // Broken refs handled separately

        const result = validateRelationship(
          { id, type: meta.type },
          { id: targetId, type: targetMeta.type },
          relType,
          methodology
        );

        if (!result.valid) {
          invalid.push(
            `${id}(${meta.type}) →[${relType}]→ ${targetId}(${targetMeta.type}): ${result.error}`
          );
        }
      }
    }
  }

  if (invalid.length === 0) {
    return {
      name: 'Relationship Validation',
      status: 'pass',
      message: 'All relationship types are valid',
    };
  }

  return {
    name: 'Relationship Validation',
    status: 'fail',
    message: `${invalid.length} invalid relationship(s) detected`,
    details: invalid.slice(0, 10),
    fix: 'Run: devsteps unlink <source> <relation> <target> then re-link with correct type',
  };
}

/** TASK-045: Detect orphaned items with no parent relationship */
function detectOrphanedItems(allItems: Map<string, ItemMetadata>): CheckResult {
  const orphaned: string[] = [];

  for (const [id, meta] of allItems) {
    // Top-level types don't need a parent
    if (TOP_LEVEL_TYPES.has(meta.type)) continue;

    // Skip cancelled/obsolete items
    if (meta.status === 'cancelled' || meta.status === 'obsolete') continue;

    const linked = meta.linked_items as Record<string, string[]> | undefined;
    const hasParent =
      (linked?.implements?.length ?? 0) > 0 ||
      (linked?.['blocked-by']?.length ?? 0) > 0 ||
      (linked?.tests?.length ?? 0) > 0;

    if (!hasParent) {
      orphaned.push(`${id} (${meta.type}): ${meta.title}`);
    }
  }

  if (orphaned.length === 0) {
    return {
      name: 'Orphaned Items',
      status: 'pass',
      message: 'No orphaned items found',
    };
  }

  return {
    name: 'Orphaned Items',
    status: 'warn',
    message: `${orphaned.length} orphaned item(s) with no parent relationship`,
    details: orphaned.slice(0, 10),
    fix: 'Run: devsteps link <item> implements <parent> to assign parent',
  };
}

/**
 * Run all relationship integrity checks.
 * Returns an array of CheckResults for each check category.
 */
export async function runIntegrityChecks(devstepsDir: string): Promise<CheckResult[]> {
  if (!existsSync(join(devstepsDir, 'items'))) {
    return [
      {
        name: 'Relationship Integrity',
        status: 'warn',
        message: 'No items directory found — skipping integrity checks',
      },
    ];
  }

  const allItems = loadAllItems(devstepsDir);

  if (allItems.size === 0) {
    return [
      {
        name: 'Relationship Integrity',
        status: 'pass',
        message: 'No items found to check',
      },
    ];
  }

  let methodology: Methodology = 'hybrid';
  try {
    const config = await getConfig(devstepsDir);
    methodology = (config.settings?.methodology as Methodology) || 'hybrid';
  } catch {
    /* use default */
  }

  return await Promise.all([
    detectBrokenReferences(allItems),
    detectAsymmetricLinks(allItems),
    detectInvalidRelationships(allItems, methodology),
    detectOrphanedItems(allItems),
  ]);
}
