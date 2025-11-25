import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemType } from '@schnick371/devsteps-shared';
import { TYPE_TO_DIRECTORY } from '@schnick371/devsteps-shared';

/**
 * Search items by query
 */
export default async function searchHandler(args: {
  query: string;
  type?: ItemType;
  limit?: number;
}) {
  const devcrumbsDir = join(process.cwd(), '.devsteps');

  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const query = args.query.toLowerCase();

  // Convert wildcards (*) to regex pattern
  const hasWildcard = query.includes('*');
  const regexPattern = hasWildcard
    ? new RegExp(query.replace(/\*/g, '.*'), 'i')
    : null;

  // Tokenize multi-word queries for OR matching
  const tokens = query.split(/\s+/).filter(t => t.length > 0);

  // Helper: Check if text matches query (substring, wildcard, or tokens)
  const matches = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    if (regexPattern) {
      return regexPattern.test(lowerText);
    }
    if (tokens.length > 1) {
      // Multi-word: all tokens must match (AND logic)
      return tokens.every(token => lowerText.includes(token));
    }
    return lowerText.includes(query);
  };

  // Read config to get available item types
  const configPath = join(devcrumbsDir, 'config.json');
  const indexPath = join(devcrumbsDir, 'index.json');

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

  const results: any[] = [];

  // Determine folders to search
  const folders = args.type
    ? [TYPE_TO_DIRECTORY[args.type]]
    : config.settings.item_types.map((t: ItemType) => TYPE_TO_DIRECTORY[t]);

  for (const folder of folders) {
    const folderPath = join(devcrumbsDir, folder);
    if (!existsSync(folderPath)) continue;

    const files = readdirSync(folderPath).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const metadataPath = join(folderPath, file);
      const descriptionPath = metadataPath.replace('.json', '.md');

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      const description = existsSync(descriptionPath) ? readFileSync(descriptionPath, 'utf-8') : '';

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

    if (args.limit && results.length >= args.limit) {
      break;
    }
  }

  return {
    success: true,
    query: args.query,
    count: results.length,
    results,
  };
}
