/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI commands — item CRUD: add, get, list, update
 */

import {
  type EisenhowerQuadrant,
  getItem,
  type ItemStatus,
  type ItemType,
  type ListItemsArgs,
  listItems,
  STATUS,
  TYPE_SHORTCUTS,
  type UpdateItemArgs,
  updateItem,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';
import { getDevStepsDir, loadConfig } from './cli-helpers.js';

interface AddCommandOptions {
  description?: string;
  category?: string;
  tags?: string[];
  assignee?: string;
  paths?: string[];
  priority?: string;
}

export async function addCommand(type: string, title: string, options: AddCommandOptions) {
  const spinner = ora('Creating item...').start();
  try {
    const devstepsDir = getDevStepsDir();
    const itemType = TYPE_SHORTCUTS[type] || type;
    const { addItem } = await import('@schnick371/devsteps-shared');
    const result = await addItem(devstepsDir, {
      type: itemType as ItemType,
      title,
      description: options.description,
      category: options.category,
      eisenhower: options.priority as EisenhowerQuadrant | undefined,
      tags: options.tags,
      affected_paths: options.paths,
      assignee: options.assignee,
    });
    spinner.succeed(`Created ${chalk.cyan(result.itemId)}: ${title}`);
    if (options.tags?.length) console.log(chalk.gray('  Tags:'), options.tags.join(', '));
    if (options.priority) console.log(chalk.gray('  Priority:'), options.priority);
    const config = await loadConfig(devstepsDir);
    if (config.settings.git_integration) {
      console.log(chalk.gray('\n💡 Git:'), chalk.cyan(`git commit -am "feat: ${result.itemId} - ${title}"`));
    }
  } catch (error: unknown) {
    spinner.fail('Failed to create item');
    throw error;
  }
}

export async function getCommand(id: string) {
  try {
    const devstepsDir = getDevStepsDir();
    const { metadata, description } = await getItem(devstepsDir, id);
    console.log();
    console.log(chalk.bold.cyan(`${metadata.id}: ${metadata.title}`));
    console.log();
    console.log(chalk.gray('Status:'), metadata.status);
    if (metadata.eisenhower) console.log(chalk.gray('Priority:'), metadata.eisenhower);
    console.log(chalk.gray('Type:'), metadata.type);
    console.log(chalk.gray('Category:'), metadata.category);
    if (metadata.assignee) console.log(chalk.gray('Assignee:'), metadata.assignee);
    if (metadata.tags.length > 0) console.log(chalk.gray('Tags:'), metadata.tags.join(', '));
    if (metadata.affected_paths.length > 0) console.log(chalk.gray('Paths:'), metadata.affected_paths.join(', '));
    console.log(chalk.gray('Created:'), new Date(metadata.created).toLocaleString());
    console.log(chalk.gray('Updated:'), new Date(metadata.updated).toLocaleString());
    if (metadata.linked_items) {
      const hasRelationships = Object.values(metadata.linked_items).some(
        (items) => Array.isArray(items) && items.length > 0
      );
      if (hasRelationships) {
        console.log();
        console.log(chalk.bold('Relationships:'));
        for (const [relType, items] of Object.entries(metadata.linked_items)) {
          if (Array.isArray(items) && items.length > 0) {
            console.log(chalk.gray(`  ${relType}:`), items.join(', '));
          }
        }
      }
    }
    console.log();
    console.log(chalk.bold('Description:'));
    console.log(description);
  } catch (error: unknown) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

interface ListCommandOptions {
  type?: string;
  status?: string;
  priority?: string;
  limit?: string;
  archived?: boolean;
}

export async function listCommand(options: ListCommandOptions) {
  try {
    const devstepsDir = getDevStepsDir();
    const filterArgs: ListItemsArgs = {};
    if (options.type) filterArgs.type = (TYPE_SHORTCUTS[options.type] || options.type) as ItemType;
    if (options.status && !options.archived) filterArgs.status = options.status as ItemStatus;
    if (options.priority && !options.archived) filterArgs.eisenhower = options.priority as EisenhowerQuadrant;
    if (options.limit) {
      const limit = Number.parseInt(options.limit, 10);
      if (limit > 0) filterArgs.limit = limit;
    }
    const itemsResult = await listItems(devstepsDir, filterArgs);
    const items = itemsResult.items;
    console.log();
    console.log(chalk.bold(`Found ${items.length} ${options.archived ? 'archived ' : ''}item(s)`));
    console.log();
    for (const item of items) {
      if (options.archived) {
        console.log(chalk.cyan(item.id), chalk.gray(`[${item.status}]`), item.title, chalk.dim('(archived)'));
      } else {
        const statusColor = item.status === STATUS.DONE ? chalk.green : item.status === STATUS.IN_PROGRESS ? chalk.blue : chalk.gray;
        console.log(chalk.cyan(item.id), statusColor(`[${item.status}]`), item.eisenhower ? chalk.yellow(`(${item.eisenhower})`) : '', item.title);
      }
    }
    console.log();
  } catch (error: unknown) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

interface UpdateCommandOptions {
  status?: string;
  title?: string;
  priority?: string;
  assignee?: string;
  tags?: string[];
  paths?: string[];
  supersededBy?: string;
  description?: string;
  appendDescription?: string;
}

export async function updateCommand(id: string, options: UpdateCommandOptions) {
  const spinner = ora(`Updating ${id}...`).start();
  try {
    if (options.description && options.appendDescription) {
      spinner.fail('Cannot use both --description and --append-description');
      process.exit(1);
    }
    const devstepsDir = getDevStepsDir();
    const { metadata } = await updateItem(devstepsDir, {
      id,
      status: options.status as ItemStatus | undefined,
      title: options.title,
      eisenhower: options.priority as EisenhowerQuadrant | undefined,
      assignee: options.assignee,
      tags: options.tags,
      affected_paths: options.paths,
      superseded_by: options.supersededBy,
      description: options.description,
      append_description: options.appendDescription,
    } as UpdateItemArgs & { append_description?: string });
    spinner.succeed(`Updated ${chalk.cyan(id)}`);
    const changes = [];
    if (options.status) changes.push(`status: ${options.status}`);
    if (options.priority) changes.push(`priority: ${options.priority}`);
    if (options.title) changes.push('title');
    if (options.description) changes.push('description');
    if (options.supersededBy) changes.push(`superseded_by: ${options.supersededBy}`);
    if (changes.length > 0) console.log(chalk.gray('  Changed:'), changes.join(', '));
    const config = await loadConfig(devstepsDir);
    if (config.settings.git_integration) {
      await _printUpdateGitHints(devstepsDir, id, options.status, metadata);
    }
  } catch (error: unknown) {
    spinner.fail('Failed to update item');
    throw error;
  }
}

async function _printUpdateGitHints(devstepsDir: string, id: string, status: string | undefined, metadata: { linked_items: { implements: string[] } }) {
  if (status === STATUS.DONE) {
    console.log(chalk.green('\n✅ Quality gates passed!'));
    console.log(chalk.gray('💡 Git:'), chalk.cyan(`git commit -am "feat: completed ${id}"`));
    for (const parentId of metadata.linked_items.implements) {
      try {
        const { metadata: parentMeta } = await getItem(devstepsDir, parentId);
        const siblings = parentMeta.linked_items['implemented-by'] || [];
        let allDone = true;
        for (const sibId of siblings) {
          try {
            const { metadata: sibMeta } = await getItem(devstepsDir, sibId);
            if (sibMeta.status !== STATUS.DONE && sibMeta.status !== STATUS.CANCELLED) { allDone = false; break; }
          } catch { allDone = false; break; }
        }
        if (allDone && parentMeta.status !== STATUS.DONE) {
          console.log(chalk.gray('💡'), `All implementations of ${chalk.cyan(parentId)} are complete! Consider reviewing parent.`);
        }
      } catch { /* skip */ }
    }
  } else if (status === STATUS.REVIEW) {
    console.log(chalk.yellow('\n🧪 Testing Phase:'));
    console.log(chalk.gray('  • Run tests:'), 'npm test');
    console.log(chalk.gray('  • Verify build:'), 'npm run build');
    console.log(chalk.gray('  • Manual testing if applicable'));
    console.log(chalk.gray('  • When all pass:'), chalk.cyan(`devsteps update ${id} --status done`));
  } else if (status === STATUS.IN_PROGRESS) {
    console.log(chalk.gray('\n💡 Git:'), 'Track progress with regular commits!');
    console.log(chalk.gray('💡 Next:'), `After implementation, mark as 'review' to start testing`);
  }
}
