import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type Methodology,
  type RelationType,
  TYPE_TO_DIRECTORY,
  getCurrentTimestamp,
  parseItemId,
  validateRelationship,
} from '@schnick371/devsteps-shared';
import { getDevStepsDir } from '../workspace.js';

/**
 * Link two items together
 */
export default async function linkHandler(args: {
  source_id: string;
  relation_type: RelationType;
  target_id: string;
}) {
  const devstepsDir = getDevStepsDir();

  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Validate IDs
  const sourceParsed = parseItemId(args.source_id);
  const targetParsed = parseItemId(args.target_id);

  if (!sourceParsed || !targetParsed) {
    throw new Error('Invalid item ID(s)');
  }

  // Get file paths
  const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed.type];
  const targetFolder = TYPE_TO_DIRECTORY[targetParsed.type];
  const sourcePath = join(devstepsDir, sourceFolder, `${args.source_id}.json`);
  const targetPath = join(devstepsDir, targetFolder, `${args.target_id}.json`);

  if (!existsSync(sourcePath)) {
    throw new Error(`Source item not found: ${args.source_id}`);
  }
  if (!existsSync(targetPath)) {
    throw new Error(`Target item not found: ${args.target_id}`);
  }

  // Load items
  const sourceMetadata = JSON.parse(readFileSync(sourcePath, 'utf-8'));
  const targetMetadata = JSON.parse(readFileSync(targetPath, 'utf-8'));

  // Load project config for methodology
  const configPath = join(devstepsDir, 'config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const methodology: Methodology = config.settings?.methodology || 'hybrid';

  // Validate relationship
  const validation = validateRelationship(
    { id: sourceMetadata.id, type: sourceMetadata.type },
    { id: targetMetadata.id, type: targetMetadata.type },
    args.relation_type,
    methodology
  );

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      suggestion: validation.suggestion,
      validation_failed: true,
      source_type: sourceMetadata.type,
      target_type: targetMetadata.type,
      relation: args.relation_type,
      methodology: methodology,
    };
  }

  // Update source item
  if (!sourceMetadata.linked_items[args.relation_type].includes(args.target_id)) {
    sourceMetadata.linked_items[args.relation_type].push(args.target_id);
    sourceMetadata.updated = getCurrentTimestamp();
    writeFileSync(sourcePath, JSON.stringify(sourceMetadata, null, 2));
  }

  // Create inverse relationship
  const inverseRelations: Record<string, RelationType> = {
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

  const inverseRelation = inverseRelations[args.relation_type];
  if (inverseRelation) {
    if (!targetMetadata.linked_items[inverseRelation].includes(args.source_id)) {
      targetMetadata.linked_items[inverseRelation].push(args.source_id);
      targetMetadata.updated = getCurrentTimestamp();
      writeFileSync(targetPath, JSON.stringify(targetMetadata, null, 2));
    }
  }

  return {
    success: true,
    message: `Linked ${args.source_id} --${args.relation_type}--> ${args.target_id}`,
    source_id: args.source_id,
    target_id: args.target_id,
    relation: args.relation_type,
  };
}
