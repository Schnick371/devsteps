import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevStepsIndex,
  EisenhowerQuadrant,
  ItemMetadata,
  ItemStatus,
  Priority,
} from '../schemas/index.js';
import { TYPE_TO_DIRECTORY, getCurrentTimestamp, parseItemId } from '../utils/index.js';

export interface UpdateItemArgs {
  id: string;
  status?: ItemStatus;
  priority?: Priority;
  eisenhower?: EisenhowerQuadrant;
  superseded_by?: string;
  title?: string;
  description?: string;
  append_description?: string;
  assignee?: string;
  tags?: string[];
  affected_paths?: string[];
}

export interface UpdateItemResult {
  metadata: ItemMetadata;
  oldStatus: ItemStatus;
}

/**
 * Core business logic for updating an item
 */
export async function updateItem(
  devstepsir: string,
  args: UpdateItemArgs
): Promise<UpdateItemResult> {
  if (!existsSync(devstepsir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const parsed = parseItemId(args.id);
  if (!parsed) {
    throw new Error(`Invalid item ID: ${args.id}`);
  }

  const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
  const metadataPath = join(devstepsir, typeFolder, `${args.id}.json`);
  const descriptionPath = join(devstepsir, typeFolder, `${args.id}.md`);

  if (!existsSync(metadataPath)) {
    throw new Error(`Item not found: ${args.id}`);
  }

  // Read and update metadata
  const metadata: ItemMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const oldStatus = metadata.status;

  // Validate status transitions (parent-child rules)
  if (args.status === 'done') {
    // Helper function to validate children are complete
    const validateChildren = (relationshipType: 'implemented-by' | 'tested-by'): void => {
      const children = metadata.linked_items[relationshipType];
      if (children.length > 0) {
        const openChildren: string[] = [];
        for (const childId of children) {
          const childParsed = parseItemId(childId);
          if (childParsed) {
            const childFolder = TYPE_TO_DIRECTORY[childParsed.type];
            const childPath = join(devstepsir, childFolder, `${childId}.json`);
            if (existsSync(childPath)) {
              const childMeta: ItemMetadata = JSON.parse(readFileSync(childPath, 'utf-8'));
              if (childMeta.status !== 'done' && childMeta.status !== 'cancelled' && childMeta.status !== 'obsolete') {
                openChildren.push(childId);
              }
            }
          }
        }
        if (openChildren.length > 0) {
          const relationLabel = relationshipType === 'implemented-by' ? 'implementation' : 'test';
          throw new Error(
            `Cannot close ${args.id}: ${openChildren.length} ${relationLabel} item(s) still open: ${openChildren.join(', ')}`
          );
        }
      }
    };

    // Validate implemented-by children (Scrum: Epic→Story, Story→Task; Waterfall: Requirement→Feature, Feature→Task)
    if (['epic', 'story', 'requirement', 'feature'].includes(metadata.type)) {
      validateChildren('implemented-by');
    }

    // Validate tested-by children (all parent types must have tests complete)
    if (['epic', 'story', 'requirement', 'feature'].includes(metadata.type)) {
      validateChildren('tested-by');
    }
  }

  if (args.status) metadata.status = args.status;
  if (args.priority) metadata.priority = args.priority;
  if (args.eisenhower) metadata.eisenhower = args.eisenhower;
  if (args.superseded_by !== undefined) metadata.superseded_by = args.superseded_by;
  if (args.title) metadata.title = args.title;
  if (args.assignee !== undefined) metadata.assignee = args.assignee;
  if (args.tags) metadata.tags = args.tags;
  if (args.affected_paths) metadata.affected_paths = args.affected_paths;

  metadata.updated = getCurrentTimestamp();

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Update description
  if (args.description && args.append_description) {
    throw new Error('Cannot use both description and append_description simultaneously');
  }
  
  if (args.description) {
    // Replace entire description
    writeFileSync(descriptionPath, args.description);
  } else if (args.append_description) {
    // Append to existing (or create new if doesn't exist)
    const existing = existsSync(descriptionPath) 
      ? readFileSync(descriptionPath, 'utf-8') 
      : '';
    writeFileSync(descriptionPath, existing + args.append_description);
  }

  // Update index
  const indexPath = join(devstepsir, 'index.json');
  const index: DevStepsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

  const itemIndex = index.items.findIndex((i) => i.id === args.id);
  if (itemIndex !== -1) {
    if (args.status) index.items[itemIndex].status = args.status;
    if (args.priority) index.items[itemIndex].priority = args.priority;
    if (args.title) index.items[itemIndex].title = args.title;
    index.items[itemIndex].updated = metadata.updated;

    // Update stats
    if (args.status && oldStatus !== args.status) {
      index.stats = index.stats || { total: 0, by_type: {}, by_status: {} };
      index.stats.by_status[oldStatus] = (index.stats.by_status[oldStatus] || 1) - 1;
      index.stats.by_status[args.status] = (index.stats.by_status[args.status] || 0) + 1;
    }
  }

  index.last_updated = metadata.updated;
  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  return {
    metadata,
    oldStatus,
  };
}
