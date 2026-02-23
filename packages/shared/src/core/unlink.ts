import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LinkedItems, RelationType } from '../schemas/index.js';
import { getCurrentTimestamp, parseItemId, TYPE_TO_DIRECTORY } from '../utils/index.js';
import { getItem } from './get.js';

export interface UnlinkItemArgs {
  sourceId: string;
  relationType: RelationType;
  targetId: string;
}

export interface UnlinkItemResult {
  success: boolean;
  message: string;
  sourceId: string;
  targetId: string;
  relation: RelationType;
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
 * Remove a relationship between two items bi-directionally.
 * Idempotent: calling when the relation already does not exist returns success.
 */
export async function unlinkItem(
  devstepsDir: string,
  args: UnlinkItemArgs
): Promise<UnlinkItemResult> {
  const { sourceId, relationType, targetId } = args;

  const sourceParsed = parseItemId(sourceId);
  const targetParsed = parseItemId(targetId);

  if (!sourceParsed) throw new Error(`Invalid source item ID: ${sourceId}`);
  if (!targetParsed) throw new Error(`Invalid target item ID: ${targetId}`);

  const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed.type];
  const targetFolder = TYPE_TO_DIRECTORY[targetParsed.type];
  const sourcePath = join(devstepsDir, sourceFolder, `${sourceId}.json`);
  const targetPath = join(devstepsDir, targetFolder, `${targetId}.json`);

  // Load both items (getItem throws on not-found)
  const { metadata: sourceMeta } = await getItem(devstepsDir, sourceId);
  const { metadata: targetMeta } = await getItem(devstepsDir, targetId);

  let changed = false;

  // Remove targetId from source's relation array
  const sourceLinks = sourceMeta.linked_items as LinkedItems;
  const sourceArray = sourceLinks[relationType];
  const sourceIdx = sourceArray.indexOf(targetId);
  if (sourceIdx !== -1) {
    sourceArray.splice(sourceIdx, 1);
    sourceMeta.updated = getCurrentTimestamp();
    writeFileSync(sourcePath, JSON.stringify(sourceMeta, null, 2));
    changed = true;
  }

  // Remove sourceId from target's inverse relation array
  const inverseRelation = INVERSE_RELATIONS[relationType];
  const targetLinks = targetMeta.linked_items as LinkedItems;
  const targetArray = targetLinks[inverseRelation];
  const targetIdx = targetArray.indexOf(sourceId);
  if (targetIdx !== -1) {
    targetArray.splice(targetIdx, 1);
    targetMeta.updated = getCurrentTimestamp();
    writeFileSync(targetPath, JSON.stringify(targetMeta, null, 2));
    changed = true;
  }

  const message = changed
    ? `Unlinked ${sourceId} -/${relationType}/-> ${targetId}`
    : `Relation ${sourceId} --${relationType}--> ${targetId} was not present (no-op)`;

  return {
    success: true,
    message,
    sourceId,
    targetId,
    relation: relationType,
  };
}
