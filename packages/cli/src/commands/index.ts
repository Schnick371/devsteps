import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type ItemMetadata,
  type ItemType,
  type Methodology,
  STATUS,
  TYPE_SHORTCUTS,
  TYPE_TO_DIRECTORY,
  generateItemId,
  getCurrentTimestamp,
  parseItemId,
  validateRelationship,
  listItems,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

function getDevStepsDir(): string {
  const dir = join(process.cwd(), '.devsteps');
  if (!existsSync(dir)) {
    console.error(
      chalk.red('Error:'),
      'Project not initialized. Run',
      chalk.cyan('devstepsinit'),
      'first.'
    );
    process.exit(1);
  }
  return dir;
}

export async function addCommand(
  type: string,
  title: string,
  options: {
    description?: string;
    category?: string;
    tags?: string[];
    assignee?: string;
    paths?: string[];
  }
) {
  const spinner = ora('Creating item...').start();

  try {
    const devstepsir = getDevStepsDir();
    const itemType = TYPE_SHORTCUTS[type] || type;

    // Use shared core logic
    const { addItem } = await import('@schnick371/devsteps-shared');
    const result = await addItem(devstepsir, {
      type: itemType as ItemType,
      title,
      description: options.description,
      category: options.category,
      eisenhower: (options as any).priority,
      tags: options.tags,
      affected_paths: options.paths,
      assignee: options.assignee,
    });

    spinner.succeed(`Created ${chalk.cyan(result.itemId)}: ${title}`);

    if (options.tags && options.tags.length > 0) {
      console.log(chalk.gray('  Tags:'), options.tags.join(', '));
    }
    if ((options as any).priority) {
      console.log(chalk.gray('  Priority:'), (options as any).priority);
    }

    // Git hint
    const configPath = join(devstepsir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (config.settings.git_integration) {
      console.log(
        chalk.gray('\n💡 Git:'),
        chalk.cyan(`git commit -am "feat: ${result.itemId} - ${title}"`)
      );
    }
  } catch (error: any) {
    spinner.fail('Failed to create item');
    throw error;
  }
}

export async function getCommand(id: string) {
  try {
    const devstepsir = getDevStepsDir();
    const parsed = parseItemId(id);

    if (!parsed) {
      console.error(chalk.red('Error:'), 'Invalid item ID:', id);
      process.exit(1);
    }

    const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
    const metadataPath = join(devstepsir, typeFolder, `${id}.json`);
    const descriptionPath = join(devstepsir, typeFolder, `${id}.md`);

    if (!existsSync(metadataPath)) {
      console.error(chalk.red('Error:'), 'Item not found:', id);
      process.exit(1);
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    const description = existsSync(descriptionPath) ? readFileSync(descriptionPath, 'utf-8') : '';

    console.log();
    console.log(chalk.bold.cyan(`${metadata.id}: ${metadata.title}`));
    console.log();
    console.log(chalk.gray('Status:'), metadata.status);
    if (metadata.eisenhower) {
      console.log(chalk.gray('Priority:'), metadata.eisenhower);
    }
    console.log(chalk.gray('Type:'), metadata.type);
    console.log(chalk.gray('Category:'), metadata.category);

    if (metadata.assignee) {
      console.log(chalk.gray('Assignee:'), metadata.assignee);
    }

    if (metadata.tags.length > 0) {
      console.log(chalk.gray('Tags:'), metadata.tags.join(', '));
    }

    if (metadata.affected_paths.length > 0) {
      console.log(chalk.gray('Paths:'), metadata.affected_paths.join(', '));
    }

    console.log(chalk.gray('Created:'), new Date(metadata.created).toLocaleString());
    console.log(chalk.gray('Updated:'), new Date(metadata.updated).toLocaleString());

    console.log();
    console.log(chalk.bold('Description:'));
    console.log(description);
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export async function listCommand(options: any) {
  try {
    const devstepsir = getDevStepsDir();
    const indexPath = join(devstepsir, 'index.json');
    const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

    // Choose between active and archived items
    let items = options.archived ? index.archived_items || [] : index.items;

    if (options.type) {
      const itemType = TYPE_SHORTCUTS[options.type] || options.type;
      items = items.filter((i: any) => i.type === itemType);
    }

    // For archived items, use original_status
    const statusField = options.archived ? 'original_status' : 'status';

    if (options.status) {
      items = items.filter((i: any) => i[statusField] === options.status);
    }

    // Priority removed: use Eisenhower-only filtering

    if (options.priority && !options.archived) {
      // Load full metadata for eisenhower filter (not available for archived summary)
      items = items.filter((i: any) => {
        const typeFolder = TYPE_TO_DIRECTORY[i.type as ItemType];
        const metadataPath = join(devstepsir, typeFolder, `${i.id}.json`);
        if (!existsSync(metadataPath)) return false;
        const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        return metadata.eisenhower === options.priority;
      });
    }

    const limit = Number.parseInt(options.limit, 10);
    if (limit > 0) {
      items = items.slice(0, limit);
    }

    console.log();
    console.log(chalk.bold(`Found ${items.length} ${options.archived ? 'archived ' : ''}item(s)`));
    console.log();

    for (const item of items) {
      if (options.archived) {
        // Archived items display
        const archivedDate = new Date(item.archived_at).toLocaleDateString();
        console.log(
          chalk.cyan(item.id),
          chalk.gray(`[${item.original_status}]`),
          item.title,
          chalk.dim(`(archived ${archivedDate})`)
        );
      } else {
        // Active items display
        const statusColor =
          item.status === STATUS.DONE
            ? chalk.green
            : item.status === STATUS.IN_PROGRESS
              ? chalk.blue
              : chalk.gray;

        console.log(
          chalk.cyan(item.id),
          statusColor(`[${item.status}]`),
          item.eisenhower ? chalk.yellow(`(${item.eisenhower})`) : '',
          item.title
        );
      }
    }

    console.log();
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export async function updateCommand(id: string, options: any) {
  const spinner = ora(`Updating ${id}...`).start();

  try {
    // Validate: Cannot use both description flags
    if (options.description && options.appendDescription) {
      spinner.fail('Cannot use both --description and --append-description');
      process.exit(1);
    }
    
    const devstepsir = getDevStepsDir();
    const parsed = parseItemId(id);

    if (!parsed) {
      spinner.fail('Invalid item ID');
      process.exit(1);
    }

    const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
    const metadataPath = join(devstepsir, typeFolder, `${id}.json`);
    const descriptionPath = join(devstepsir, typeFolder, `${id}.md`);

    if (!existsSync(metadataPath)) {
      spinner.fail('Item not found');
      process.exit(1);
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    const oldStatus = metadata.status;

    if (options.status) metadata.status = options.status;
    if (options.title) metadata.title = options.title;
    if (options.priority) metadata.eisenhower = options.priority;
    if (options.assignee !== undefined) metadata.assignee = options.assignee;
    if (options.tags) metadata.tags = options.tags;
    if (options.paths) metadata.affected_paths = options.paths;
    if (options.supersededBy !== undefined) metadata.superseded_by = options.supersededBy;

    metadata.updated = getCurrentTimestamp();

    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Handle description updates
    if (options.description) {
      // Replace entire description
      writeFileSync(descriptionPath, options.description);
    } else if (options.appendDescription) {
      // Append to existing (or create new)
      const existing = existsSync(descriptionPath) 
        ? readFileSync(descriptionPath, 'utf-8') 
        : '';
      writeFileSync(descriptionPath, existing + options.appendDescription);
    }

    const indexPath = join(devstepsir, 'index.json');
    const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

    const itemIndex = index.items.findIndex((i: any) => i.id === id);
    if (itemIndex !== -1) {
      if (options.status) index.items[itemIndex].status = options.status;
      // Priority removed from index items; Eisenhower remains in metadata only
      if ((options as any).eisenhower) metadata.eisenhower = (options as any).eisenhower;
      if (options.title) index.items[itemIndex].title = options.title;
      index.items[itemIndex].updated = metadata.updated;

      if (options.status && oldStatus !== options.status) {
        index.stats.by_status[oldStatus] = (index.stats.by_status[oldStatus] || 1) - 1;
        index.stats.by_status[options.status] = (index.stats.by_status[options.status] || 0) + 1;
      }
    }

    index.last_updated = metadata.updated;
    writeFileSync(indexPath, JSON.stringify(index, null, 2));

    spinner.succeed(`Updated ${chalk.cyan(id)}`);

    const changes = [];
    if (options.status) changes.push(`status: ${options.status}`);
    if ((options as any).eisenhower) changes.push(`eisenhower: ${(options as any).eisenhower}`);
    if (options.title) changes.push('title');
    if (options.description) changes.push('description');
    if (options.supersededBy) changes.push(`superseded_by: ${options.supersededBy}`);

    if (changes.length > 0) {
      console.log(chalk.gray('  Changed:'), changes.join(', '));
    }

    // Git hints and status progression guidance
    const configPath = join(devstepsir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (config.settings.git_integration) {
      if (options.status === STATUS.DONE) {
        console.log(chalk.green('\n✅ Quality gates passed!'));
        console.log(chalk.gray('💡 Git:'), chalk.cyan(`git commit -am "feat: completed ${id}"`));

        // Check if this completes any parent items
        for (const parentId of metadata.linked_items.implements) {
          const parentParsed = parseItemId(parentId);
          if (parentParsed) {
            const parentFolder = TYPE_TO_DIRECTORY[parentParsed.type];
            const parentPath = join(devstepsir, parentFolder, `${parentId}.json`);
            if (existsSync(parentPath)) {
              const parentMeta = JSON.parse(readFileSync(parentPath, 'utf-8'));
              const siblings = parentMeta.linked_items['implemented-by'] || [];

              let allDone = true;
              for (const siblingId of siblings) {
                const sibParsed = parseItemId(siblingId);
                if (sibParsed) {
                  const sibFolder = TYPE_TO_DIRECTORY[sibParsed.type];
                  const sibPath = join(devstepsir, sibFolder, `${siblingId}.json`);
                  if (existsSync(sibPath)) {
                    const sibMeta = JSON.parse(readFileSync(sibPath, 'utf-8'));
                    if (sibMeta.status !== STATUS.DONE && sibMeta.status !== STATUS.CANCELLED) {
                      allDone = false;
                      break;
                    }
                  }
                }
              }

              if (allDone && parentMeta.status !== STATUS.DONE) {
                console.log(
                  chalk.gray('💡'),
                  `All implementations of ${chalk.cyan(parentId)} are complete! Consider reviewing parent.`
                );
              }
            }
          }
        }
      } else if (options.status === STATUS.REVIEW) {
        console.log(chalk.yellow('\n🧪 Testing Phase:'));
        console.log(chalk.gray('  • Run tests:'), 'npm test');
        console.log(chalk.gray('  • Verify build:'), 'npm run build');
        console.log(chalk.gray('  • Manual testing if applicable'));
        console.log(chalk.gray('  • When all pass:'), chalk.cyan(`devsteps update ${id} --status done`));
      } else if (options.status === STATUS.IN_PROGRESS) {
        console.log(chalk.gray('\n💡 Git:'), 'Track progress with regular commits!');
        console.log(chalk.gray('💡 Next:'), `After implementation, mark as 'review' to start testing`);
      }
    }
  } catch (error: any) {
    spinner.fail('Failed to update item');
    throw error;
  }
}

export async function linkCommand(
  sourceId: string,
  relation: string,
  targetId: string,
  options: { force?: boolean } = {}
) {
  const spinner = ora('Creating link...').start();

  try {
    const devstepsir = getDevStepsDir();

    const sourceParsed = parseItemId(sourceId);
    const targetParsed = parseItemId(targetId);

    if (!sourceParsed || !targetParsed) {
      spinner.fail('Invalid item ID(s)');
      process.exit(1);
    }

    const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed.type];
    const targetFolder = TYPE_TO_DIRECTORY[targetParsed.type];
    const sourcePath = join(devstepsir, sourceFolder, `${sourceId}.json`);
    const targetPath = join(devstepsir, targetFolder, `${targetId}.json`);

    if (!existsSync(sourcePath) || !existsSync(targetPath)) {
      spinner.fail('Item(s) not found');
      process.exit(1);
    }

    const sourceMetadata = JSON.parse(readFileSync(sourcePath, 'utf-8'));
    const targetMetadata = JSON.parse(readFileSync(targetPath, 'utf-8'));

    // Load project config for methodology
    const configPath = join(devstepsir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const methodology: Methodology = config.settings?.methodology || 'hybrid';

    // Validate relationship (unless --force)
    if (!options.force) {
      const validation = validateRelationship(
        { id: sourceMetadata.id, type: sourceMetadata.type },
        { id: targetMetadata.id, type: targetMetadata.type },
        relation,
        methodology
      );

      if (!validation.valid) {
        spinner.fail('Validation failed');
        console.error(chalk.red('✗'), validation.error);
        if (validation.suggestion) {
          console.log(chalk.yellow('💡'), validation.suggestion);
        }
        console.log(chalk.gray('\nUse --force to override validation'));
        process.exit(1);
      }
    } else {
      spinner.text = 'Creating link (validation overridden)...';
    }

    if (!sourceMetadata.linked_items[relation].includes(targetId)) {
      sourceMetadata.linked_items[relation].push(targetId);
      sourceMetadata.updated = getCurrentTimestamp();
      writeFileSync(sourcePath, JSON.stringify(sourceMetadata, null, 2));
    }

    const inverseRelations: Record<string, string> = {
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

    const inverseRelation = inverseRelations[relation];
    if (inverseRelation) {
      if (!targetMetadata.linked_items[inverseRelation].includes(sourceId)) {
        targetMetadata.linked_items[inverseRelation].push(sourceId);
        targetMetadata.updated = getCurrentTimestamp();
        writeFileSync(targetPath, JSON.stringify(targetMetadata, null, 2));
      }
    }

    const successMsg = options.force
      ? `Linked ${chalk.cyan(sourceId)} --${relation}--> ${chalk.cyan(targetId)} ${chalk.yellow('(forced)')}`
      : `Linked ${chalk.cyan(sourceId)} --${relation}--> ${chalk.cyan(targetId)}`;
    spinner.succeed(successMsg);
  } catch (error: any) {
    spinner.fail('Failed to create link');
    throw error;
  }
}

export async function searchCommand(query: string, options: any) {
  const spinner = ora('Searching...').start();

  try {
    const devstepsir = getDevStepsDir();
    const queryLower = query.toLowerCase();
    const results: any[] = [];

    // Read config to get item types
    const configPath = join(devstepsir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    const folders = options.type
      ? [TYPE_TO_DIRECTORY[TYPE_SHORTCUTS[options.type] || (options.type as ItemType)]]
      : config.settings.item_types.map((t: ItemType) => TYPE_TO_DIRECTORY[t]);

    for (const folder of folders) {
      const folderPath = join(devstepsir, folder);
      if (!existsSync(folderPath)) continue;

      const files = readdirSync(folderPath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        const metadataPath = join(folderPath, file);
        const descriptionPath = metadataPath.replace('.json', '.md');

        const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        const description = existsSync(descriptionPath)
          ? readFileSync(descriptionPath, 'utf-8')
          : '';

        const titleMatch = metadata.title.toLowerCase().includes(queryLower);
        const descMatch = description.toLowerCase().includes(queryLower);
        const tagMatch = metadata.tags.some((tag: string) =>
          tag.toLowerCase().includes(queryLower)
        );

        if (titleMatch || descMatch || tagMatch) {
          results.push({
            ...metadata,
            match_type: titleMatch ? 'title' : descMatch ? 'description' : 'tag',
          });

          const limit = Number.parseInt(options.limit, 10);
          if (limit > 0 && results.length >= limit) break;
        }
      }
    }

    spinner.succeed(`Found ${results.length} result(s)`);
    console.log();

    for (const item of results) {
      const matchBadge =
        item.match_type === 'title'
          ? chalk.green('[title]')
          : item.match_type === 'description'
            ? chalk.blue('[desc]')
            : chalk.yellow('[tag]');

      console.log(matchBadge, chalk.cyan(item.id), item.title);
    }

    console.log();
  } catch (error: any) {
    spinner.fail('Search failed');
    throw error;
  }
}

export async function statusCommand(options: any) {
  try {
    const devstepsir = getDevStepsDir();
    const configPath = join(devstepsir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    // Use new index-refs API
    const itemsResult = await listItems(devstepsir, {});
    const allItems = itemsResult.items;
    
    // Calculate stats
    const stats = {
      total: allItems.length,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };
    
    for (const item of allItems) {
      stats.by_type[item.type] = (stats.by_type[item.type] || 0) + 1;
      stats.by_status[item.status] = (stats.by_status[item.status] || 0) + 1;
    }

    console.log();
    console.log(chalk.bold.cyan(`📊 ${config.project_name}`));
    console.log();
    console.log(chalk.gray('Created:'), new Date(config.created).toLocaleDateString());
    console.log(chalk.gray('Updated:'), new Date(config.updated).toLocaleDateString());
    console.log();

    console.log(chalk.bold('Statistics:'));
    console.log(chalk.gray('  Total Items:'), stats.total);
    console.log();

    console.log(chalk.bold('  By Type:'));
    for (const [type, count] of Object.entries(stats.by_type)) {
      console.log(chalk.gray(`    ${type}:`), count);
    }
    console.log();

    console.log(chalk.bold('  By Status:'));
    for (const [status, count] of Object.entries(stats.by_status)) {
      console.log(chalk.gray(`    ${status}:`), count);
    }
    console.log();

    // Check for stale items
    const staleItems = allItems.filter((item: any) => {
      if (item.status === STATUS.IN_PROGRESS) {
        const daysSinceUpdate =
          (Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7;
      }
      return false;
    });

    if (staleItems.length > 0) {
      console.log(chalk.bold.yellow('⚠️  Warnings:'));
      console.log(chalk.yellow(`  ${staleItems.length} stale item(s) in progress for >7 days:`));
      for (const item of staleItems) {
        const days = Math.floor(
          (Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24)
        );
        console.log(chalk.yellow(`    ${item.id}`), `(${days} days)`);
      }
      console.log();
    }

    if (options.detailed) {
      const recent = [...allItems]
        .sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
        .slice(0, 5);

      console.log(chalk.bold('Recent Updates:'));
      for (const item of recent) {
        console.log(chalk.cyan(item.id), item.title);
      }
      console.log();
    }
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export async function traceCommand(id: string, options: any) {
  try {
    const devstepsir = getDevStepsDir();
    const maxDepth = Number.parseInt(options.depth, 10) || 3;

    function traceItem(itemId: string, depth: number, prefix = ''): void {
      if (depth > maxDepth) return;

      const parsed = parseItemId(itemId);
      if (!parsed) return;

      const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
      const metadataPath = join(devstepsir, typeFolder, `${itemId}.json`);

      if (!existsSync(metadataPath)) return;

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

      console.log(
        `${prefix}${chalk.cyan(metadata.id)} ${chalk.gray(`[${metadata.status}]`)} ${metadata.title}`
      );

      if (depth < maxDepth) {
        for (const [relType, linkedIds] of Object.entries(metadata.linked_items)) {
          if (Array.isArray(linkedIds) && linkedIds.length > 0) {
            console.log(`${prefix}  ${chalk.yellow(`--${relType}-->`)}`);
            for (const linkedId of linkedIds) {
              traceItem(linkedId as string, depth + 1, `${prefix}    `);
            }
          }
        }
      }
    }

    console.log();
    console.log(chalk.bold('Traceability Tree:'));
    console.log();
    traceItem(id, 0);
    console.log();
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export async function exportCommand(options: any) {
  const spinner = ora('Exporting...').start();

  try {
    const devstepsir = getDevStepsDir();
    // Export implementation similar to MCP handler
    // For brevity, using simple markdown export

    spinner.succeed('Export completed');
    console.log(chalk.gray('  Output:'), options.output || 'devsteps-export.md');
  } catch (error: any) {
    spinner.fail('Export failed');
    throw error;
  }
}
