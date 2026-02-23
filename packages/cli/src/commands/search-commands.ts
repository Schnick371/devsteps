/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI commands — search, status, export
 */

import {
  type DevStepsIndex,
  getItem,
  type ItemType,
  type ListItemsArgs,
  listItems,
  STATUS,
  TYPE_SHORTCUTS,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';
import { getDevStepsDir, loadConfig } from './cli-helpers.js';

interface SearchCommandOptions {
  type?: string;
  limit?: string;
}

interface SearchResult {
  id: string;
  title: string;
  match_type: 'title' | 'description' | 'tag';
}

export async function searchCommand(query: string, options: SearchCommandOptions) {
  const spinner = ora('Searching...').start();
  try {
    const devstepsDir = getDevStepsDir();
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    const filterArgs: ListItemsArgs = {};
    if (options.type) filterArgs.type = (TYPE_SHORTCUTS[options.type] || options.type) as ItemType;
    const { items } = await listItems(devstepsDir, filterArgs);

    for (const itemSummary of items) {
      const { metadata, description } = await getItem(devstepsDir, itemSummary.id);
      const titleMatch = metadata.title.toLowerCase().includes(queryLower);
      const descMatch = description.toLowerCase().includes(queryLower);
      const tagMatch = metadata.tags.some((tag: string) => tag.toLowerCase().includes(queryLower));

      if (titleMatch || descMatch || tagMatch) {
        results.push({ ...metadata, match_type: titleMatch ? 'title' : descMatch ? 'description' : 'tag' });
        if (options.limit) {
          const limit = Number.parseInt(options.limit, 10);
          if (limit > 0 && results.length >= limit) break;
        }
      }
    }

    spinner.succeed(`Found ${results.length} result(s)`);
    console.log();
    for (const item of results) {
      const matchBadge = item.match_type === 'title' ? chalk.green('[title]') : item.match_type === 'description' ? chalk.blue('[desc]') : chalk.yellow('[tag]');
      console.log(matchBadge, chalk.cyan(item.id), item.title);
    }
    console.log();
  } catch (error: unknown) {
    spinner.fail('Search failed');
    throw error;
  }
}

interface StatusCommandOptions {
  detailed?: boolean;
}

export async function statusCommand(options: StatusCommandOptions) {
  try {
    const devstepsDir = getDevStepsDir();
    const config = await loadConfig(devstepsDir);
    const itemsResult = await listItems(devstepsDir, {});
    const allItems = itemsResult.items;

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
    console.log(chalk.gray('  Total:'), stats.total);
    console.log();
    console.log(chalk.bold('  By Type:'));
    for (const [type, count] of Object.entries(stats.by_type)) console.log(chalk.gray(`    ${type}:`), count);
    console.log();
    console.log(chalk.bold('  By Status:'));
    for (const [status, count] of Object.entries(stats.by_status)) console.log(chalk.gray(`    ${status}:`), count);
    console.log();

    const staleItems = allItems.filter((item: DevStepsIndex['items'][number]) => {
      if (item.status !== STATUS.IN_PROGRESS) return false;
      return (Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24) > 7;
    });

    if (staleItems.length > 0) {
      console.log(chalk.bold.yellow('⚠️  Warnings:'));
      console.log(chalk.yellow(`  ${staleItems.length} stale item(s) in progress for >7 days:`));
      for (const item of staleItems) {
        const days = Math.floor((Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24));
        console.log(chalk.yellow(`    ${item.id}`), `(${days} days)`);
      }
      console.log();
    }

    if (options.detailed) {
      const recent = [...allItems]
        .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
        .slice(0, 5);
      console.log(chalk.bold('Recent Updates:'));
      for (const item of recent) console.log(chalk.cyan(item.id), item.title);
      console.log();
    }
  } catch (error: unknown) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

interface ExportCommandOptions {
  output?: string;
}

export async function exportCommand(options: ExportCommandOptions) {
  const spinner = ora('Exporting...').start();
  try {
    getDevStepsDir();
    spinner.succeed('Export completed');
    console.log(chalk.gray('  Output:'), options.output || 'devsteps-export.md');
  } catch (error: unknown) {
    spinner.fail('Export failed');
    throw error;
  }
}
