import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { getWorkspacePath } from '../workspace.js';
import { join } from 'node:path';
import type { ItemType } from '@schnick371/devsteps-shared';
import { TYPE_TO_DIRECTORY, listItems, getItem } from '@schnick371/devsteps-shared';

/**
 * Search items by query
 */
export default async function searchHandler(args: {
  query: string;
  type?: ItemType;
  limit?: number;
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    if (!existsSync(devstepsDir)) {
      throw new Error('Project not initialized. Run devsteps-init first.');
    }

    const query = args.query.toLowerCase();

    // Convert wildcards (*) to regex pattern
    const hasWildcard = query.includes('*');
    const regexPattern = hasWildcard ? new RegExp(query.replace(/\*/g, '.*'), 'i') : null;

    // Tokenize multi-word queries for OR matching
    const tokens = query.split(/\s+/).filter((t) => t.length > 0);

    // Helper: Check if text matches query (substring, wildcard, or tokens)
    const matches = (text: string): boolean => {
      const lowerText = text.toLowerCase();
      if (regexPattern) {
        return regexPattern.test(lowerText);
      }
      if (tokens.length > 1) {
        // Multi-word: all tokens must match (AND logic)
        return tokens.every((token) => lowerText.includes(token));
      }
      return lowerText.includes(query);
    };

    // Use listItems() with optional type filter, then load full metadata
    const filterArgs: any = {};
    if (args.type) {
      filterArgs.type = args.type;
    }
    const { items } = await listItems(devstepsDir, filterArgs);

    const results: any[] = [];

    // Load full metadata + description for each item
    for (const itemSummary of items) {
      const { metadata, description } = await getItem(devstepsDir, itemSummary.id);

      // Search in title, description, and tags
      const titleMatch = matches(metadata.title);
      const descMatch = matches(description);
      const tagMatch = metadata.tags.some((tag: string) => matches(tag));

      if (titleMatch || descMatch || tagMatch) {
        results.push({
          ...metadata,
          description_preview: description.slice(0, 200),
          match_type: titleMatch ? 'title' : descMatch ? 'description' : 'tag',
        });

        if (args.limit && results.length >= args.limit) {
          break;
        }
      }
    }

    return {
      success: true,
      query: args.query,
      count: results.length,
      results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
