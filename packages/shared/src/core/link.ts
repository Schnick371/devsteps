/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core link creation — extracted from MCP link handler
 * Implements TASK-216 (createLink in shared) and TASK-219 (link.ts refactor)
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RelationType } from '../schemas/index.js';
import {
  getCurrentTimestamp,
  parseItemId,
  TYPE_TO_DIRECTORY,
} from '../utils/index.js';
import { getConfig } from './config.js';
import { getItem } from './get.js';
import { validateRelationConflict, validateRelationship } from './validation.js';

export interface LinkItemArgs {
  sourceId: string;
  relationType: RelationType;
  targetId: string;
}

export interface LinkItemResult {
  success: boolean;
  message?: string;
  error?: string;
  suggestion?: string;
  validation_failed?: boolean;
  sourceId?: string;
  targetId?: string;
  relation?: RelationType;
  source_type?: string;
  target_type?: string;
  methodology?: string;
}

/** Bi-directional inverse relation map. */
const INVERSE_RELATIONS: Record<RelationType, RelationType> = {
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

/**
 * Create a bi-directional relationship between two items.
 * Validates methodology rules and conflict constraints before writing.
 * Idempotent: adding an already-existing link returns success without re-writing.
 */
export async function linkItem(
  devstepsDir: string,
  args: LinkItemArgs
): Promise<LinkItemResult> {
  const { sourceId, relationType, targetId } = args;

  const sourceParsed = parseItemId(sourceId);
  const targetParsed = parseItemId(targetId);

  if (!sourceParsed) throw new Error(`Invalid source item ID: ${sourceId}`);
  if (!targetParsed) throw new Error(`Invalid target item ID: ${targetId}`);

  const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed.type];
  const targetFolder = TYPE_TO_DIRECTORY[targetParsed.type];
  const sourcePath = join(devstepsDir, sourceFolder, `${sourceId}.json`);
  const targetPath = join(devstepsDir, targetFolder, `${targetId}.json`);

  if (!existsSync(sourcePath)) throw new Error(`Source item not found: ${sourceId}`);
  if (!existsSync(targetPath)) throw new Error(`Target item not found: ${targetId}`);

  const { metadata: sourceMeta } = await getItem(devstepsDir, sourceId);
  const { metadata: targetMeta } = await getItem(devstepsDir, targetId);

  const config = await getConfig(devstepsDir);
  const methodology = (config.settings?.methodology ?? 'hybrid') as
    | 'scrum'
    | 'waterfall'
    | 'hybrid';

  // Validate methodology hierarchy rules
  const validation = validateRelationship(
    { id: sourceMeta.id, type: sourceMeta.type },
    { id: targetMeta.id, type: targetMeta.type },
    relationType,
    methodology
  );
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      suggestion: validation.suggestion,
      validation_failed: true,
      source_type: sourceMeta.type,
      target_type: targetMeta.type,
      relation: relationType,
      methodology,
    };
  }

  // Validate no conflicting relations to the same target
  const conflictCheck = validateRelationConflict(
    targetId,
    relationType,
    sourceMeta.linked_items
  );
  if (!conflictCheck.valid) {
    return {
      success: false,
      error: conflictCheck.error,
      suggestion: conflictCheck.suggestion,
      validation_failed: true,
    };
  }

  // Write forward relation (idempotent)
  const forwardArray = (sourceMeta.linked_items as Record<RelationType, string[]>)[
    relationType
  ];
  if (!forwardArray.includes(targetId)) {
    forwardArray.push(targetId);
    sourceMeta.updated = getCurrentTimestamp();
    writeFileSync(sourcePath, JSON.stringify(sourceMeta, null, 2));
  }

  // Write inverse relation (idempotent)
  const inverseRelation = INVERSE_RELATIONS[relationType];
  if (inverseRelation) {
    const inverseArray = (targetMeta.linked_items as Record<RelationType, string[]>)[
      inverseRelation
    ];
    if (!inverseArray.includes(sourceId)) {
      inverseArray.push(sourceId);
      targetMeta.updated = getCurrentTimestamp();
      writeFileSync(targetPath, JSON.stringify(targetMeta, null, 2));
    }
  }

  return {
    success: true,
    message: `Linked ${sourceId} --${relationType}--> ${targetId}`,
    sourceId,
    targetId,
    relation: relationType,
  };
}
