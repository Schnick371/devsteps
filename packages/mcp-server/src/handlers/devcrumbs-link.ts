import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type RelationType,
  TYPE_TO_DIRECTORY,
  getCurrentTimestamp,
  parseItemId,
} from '@devcrumbs/shared';

/**
 * Link two items together
 */
export default async function linkHandler(args: {
  source_id: string;
  relation_type: RelationType;
  target_id: string;
}) {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');

  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devcrumbs-init first.');
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
  const sourcePath = join(devcrumbsDir, sourceFolder, `${args.source_id}.json`);
  const targetPath = join(devcrumbsDir, targetFolder, `${args.target_id}.json`);

  if (!existsSync(sourcePath)) {
    throw new Error(`Source item not found: ${args.source_id}`);
  }
  if (!existsSync(targetPath)) {
    throw new Error(`Target item not found: ${args.target_id}`);
  }

  // Update source item
  const sourceMetadata = JSON.parse(readFileSync(sourcePath, 'utf-8'));

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
  };

  const inverseRelation = inverseRelations[args.relation_type];
  if (inverseRelation) {
    const targetMetadata = JSON.parse(readFileSync(targetPath, 'utf-8'));

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
