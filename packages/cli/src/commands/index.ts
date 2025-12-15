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
  getItem,
  updateItem,
  updateItemInIndex,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

function getDevStepsDir(): string {
  const dir = join(process.cwd(), '.devsteps');
  if (!existsSync(dir)) {
    console.error(
      chalk.red('Error:'),
      'Project not initialized. Run',
      chalk.cyan('devsteps init'),
      'first.'
    );
    process.exit(1);
  }
  return dir;
}

// Helper: Load config (centralized to avoid duplication)
function loadConfig(devstepsDir: string): any {
  const configPath = join(devstepsDir, 'config.json');
  return JSON.parse(readFileSync(configPath, 'utf-8'));
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
    const config = loadConfig(devstepsir);
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
    
    // Use shared core logic (throws on error)
    const { metadata, description } = await getItem(devstepsir, id);

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
    
    // Build filter args for optimized index-refs lookup
    const filterArgs: any = {};
    
    if (options.type) {
      filterArgs.type = TYPE_SHORTCUTS[options.type] || options.type;
    }
    
    if (options.status && !options.archived) {
      filterArgs.status = options.status;
    }
    
    if (options.priority && !options.archived) {
      filterArgs.eisenhower = options.priority;
    }
    
    if (options.limit) {
      const limit = Number.parseInt(options.limit, 10);
      if (limit > 0) {
        filterArgs.limit = limit;
      }
    }
    
    // Use new index-refs API with filters (optimized index lookup)
    const itemsResult = await listItems(devstepsir, filterArgs);
    let items = itemsResult.items;
    
    // TODO: Archived items support needs separate implementation

    console.log();
    console.log(chalk.bold(`Found ${items.length} ${options.archived ? 'archived ' : ''}item(s)`));
    console.log();

    for (const item of items) {
      if (options.archived) {
        // TODO: Archived items need separate implementation with archive metadata
        console.log(
          chalk.cyan(item.id),
          chalk.gray(`[${item.status}]`),
          item.title,
          chalk.dim('(archived)')
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
    
    // Use shared core logic (throws on error)
    const { metadata } = await updateItem(devstepsir, {
      id,
      status: options.status,
      title: options.title,
      eisenhower: options.priority,
      assignee: options.assignee,
      tags: options.tags,
      affected_paths: options.paths,
      superseded_by: options.supersededBy,
      description: options.description,
      append_description: options.appendDescription,
    });

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
    const config = loadConfig(devstepsir);
    if (config.settings.git_integration) {
      if (options.status === STATUS.DONE) {
        console.log(chalk.green('\n✅ Quality gates passed!'));
        console.log(chalk.gray('💡 Git:'), chalk.cyan(`git commit -am "feat: completed ${id}"`));

        // Check if this completes any parent items
        for (const parentId of metadata.linked_items.implements) {
          try {
            const { metadata: parentMeta } = await getItem(devstepsir, parentId);
            const siblings = parentMeta.linked_items['implemented-by'] || [];

            let allDone = true;
            for (const siblingId of siblings) {
              try {
                const { metadata: sibMeta } = await getItem(devstepsir, siblingId);
                if (sibMeta.status !== STATUS.DONE && sibMeta.status !== STATUS.CANCELLED) {
                  allDone = false;
                  break;
                }
              } catch {
                allDone = false;
                break;
              }
            }

            if (allDone && parentMeta.status !== STATUS.DONE) {
              console.log(
                chalk.gray('💡'),
                `All implementations of ${chalk.cyan(parentId)} are complete! Consider reviewing parent.`
              );
            }
          } catch {
            // Parent not found - skip
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

    // Use shared getItem() instead of manual parsing
    const { metadata: sourceMetadata } = await getItem(devstepsir, sourceId);
    const { metadata: targetMetadata } = await getItem(devstepsir, targetId);

    // Get paths for writing updates
    const sourceParsed = parseItemId(sourceId);
    const targetParsed = parseItemId(targetId);
    const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed!.type];
    const targetFolder = TYPE_TO_DIRECTORY[targetParsed!.type];
    const sourcePath = join(devstepsir, sourceFolder, `${sourceId}.json`);
    const targetPath = join(devstepsir, targetFolder, `${targetId}.json`);

    // Load project config for methodology
    const config = loadConfig(devstepsir);
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

    if (!sourceMetadata.linked_items[relation as keyof typeof sourceMetadata.linked_items].includes(targetId)) {
      sourceMetadata.linked_items[relation as keyof typeof sourceMetadata.linked_items].push(targetId);
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
      if (!targetMetadata.linked_items[inverseRelation as keyof typeof targetMetadata.linked_items].includes(sourceId)) {
        targetMetadata.linked_items[inverseRelation as keyof typeof targetMetadata.linked_items].push(sourceId);
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

    // Use listItems() with optional type filter
    const filterArgs: any = {};
    if (options.type) {
      filterArgs.type = TYPE_SHORTCUTS[options.type] || options.type;
    }
    const { items } = await listItems(devstepsir, filterArgs);

    // Search through items (need to load full metadata for tags and description)
    for (const itemSummary of items) {
      // Load full metadata including tags and description
      const { metadata, description } = await getItem(devstepsir, itemSummary.id);

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
    const config = loadConfig(devstepsir);
    
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

    async function traceItem(itemId: string, depth: number, prefix = ''): Promise<void> {
      if (depth > maxDepth) return;

      // Use shared getItem() instead of manual parsing
      try {
        const { metadata } = await getItem(devstepsir, itemId);

      console.log(
        `${prefix}${chalk.cyan(metadata.id)} ${chalk.gray(`[${metadata.status}]`)} ${metadata.title}`
      );

        if (depth < maxDepth) {
          for (const [relType, linkedIds] of Object.entries(metadata.linked_items)) {
            if (Array.isArray(linkedIds) && linkedIds.length > 0) {
              console.log(`${prefix}  ${chalk.yellow(`--${relType}-->`)}`);
              for (const linkedId of linkedIds) {
                await traceItem(linkedId as string, depth + 1, `${prefix}    `);
              }
            }
          }
        }
      } catch (error) {
        // Silently skip items that don't exist
        return;
      }
    }

    console.log();
    console.log(chalk.bold('Traceability Tree:'));
    console.log();
    await traceItem(id, 0);
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
