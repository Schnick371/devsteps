/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI commands — relationships: link, unlink, trace
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getCurrentTimestamp,
  getItem,
  type Methodology,
  parseItemId,
  type RelationType,
  TYPE_TO_DIRECTORY,
  unlinkItem,
  validateRelationConflict,
  validateRelationship,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';
import { getDevStepsDir, loadConfig } from './cli-helpers.js';

const INVERSE_RELATIONS: Record<string, string> = {
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

export async function linkCommand(
  sourceId: string,
  relation: string,
  targetId: string,
  options: { force?: boolean } = {}
) {
  const spinner = ora('Creating link...').start();
  try {
    const devstepsDir = getDevStepsDir();
    const { metadata: sourceMetadata } = await getItem(devstepsDir, sourceId);
    const { metadata: targetMetadata } = await getItem(devstepsDir, targetId);

    const sourceParsed = parseItemId(sourceId);
    const targetParsed = parseItemId(targetId);
    if (!sourceParsed?.type || !targetParsed?.type) throw new Error('Invalid item ID format');

    const sourcePath = join(devstepsDir, TYPE_TO_DIRECTORY[sourceParsed.type], `${sourceId}.json`);
    const targetPath = join(devstepsDir, TYPE_TO_DIRECTORY[targetParsed.type], `${targetId}.json`);

    const config = await loadConfig(devstepsDir);
    const methodology: Methodology = config.settings?.methodology || 'hybrid';

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
        if (validation.suggestion) console.log(chalk.yellow('💡'), validation.suggestion);
        console.log(chalk.gray('\nUse --force to override validation'));
        process.exit(1);
      }
    } else {
      spinner.text = 'Creating link (validation overridden)...';
    }

    const conflictCheck = validateRelationConflict(targetId, relation, sourceMetadata.linked_items);
    if (!conflictCheck.valid) {
      spinner.fail('Relation conflict detected');
      console.error(chalk.red('✗'), conflictCheck.error);
      if (conflictCheck.suggestion) console.log(chalk.yellow('💡'), conflictCheck.suggestion);
      process.exit(1);
    }

    if (!sourceMetadata.linked_items[relation as keyof typeof sourceMetadata.linked_items].includes(targetId)) {
      sourceMetadata.linked_items[relation as keyof typeof sourceMetadata.linked_items].push(targetId);
      sourceMetadata.updated = getCurrentTimestamp();
      writeFileSync(sourcePath, JSON.stringify(sourceMetadata, null, 2));
    }

    const inverseRelation = INVERSE_RELATIONS[relation];
    if (inverseRelation && !targetMetadata.linked_items[inverseRelation as keyof typeof targetMetadata.linked_items].includes(sourceId)) {
      targetMetadata.linked_items[inverseRelation as keyof typeof targetMetadata.linked_items].push(sourceId);
      targetMetadata.updated = getCurrentTimestamp();
      writeFileSync(targetPath, JSON.stringify(targetMetadata, null, 2));
    }

    const successMsg = options.force
      ? `Linked ${chalk.cyan(sourceId)} --${relation}--> ${chalk.cyan(targetId)} ${chalk.yellow('(forced)')}`
      : `Linked ${chalk.cyan(sourceId)} --${relation}--> ${chalk.cyan(targetId)}`;
    spinner.succeed(successMsg);
  } catch (error: unknown) {
    spinner.fail('Failed to create link');
    throw error;
  }
}

export async function unlinkCommand(sourceId: string, relation: string, targetId: string) {
  const spinner = ora('Removing link...').start();
  try {
    const devstepsDir = getDevStepsDir();
    const result = await unlinkItem(devstepsDir, {
      sourceId,
      relationType: relation as RelationType,
      targetId,
    });
    spinner.succeed(`Unlinked ${chalk.cyan(sourceId)} -/${relation}/-> ${chalk.cyan(targetId)}`);
    if (result.message.includes('no-op')) {
      console.log(chalk.yellow('  ⚠'), 'Relation was not present — no changes made');
    }
  } catch (error: unknown) {
    spinner.fail('Failed to remove link');
    if (error instanceof Error) console.error(chalk.red(error.message));
    process.exit(1);
  }
}

interface TraceCommandOptions {
  depth?: string;
}

export async function traceCommand(id: string, options: TraceCommandOptions) {
  try {
    const devstepsDir = getDevStepsDir();
    const maxDepth = options.depth ? Number.parseInt(options.depth, 10) : 3;

    async function traceItem(itemId: string, depth: number, prefix = ''): Promise<void> {
      if (depth > maxDepth) return;
      try {
        const { metadata } = await getItem(devstepsDir, itemId);
        console.log(`${prefix}${chalk.cyan(metadata.id)} ${chalk.gray(`[${metadata.status}]`)} ${metadata.title}`);
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
      } catch { /* skip missing items */ }
    }

    console.log();
    console.log(chalk.bold('Traceability Tree:'));
    console.log();
    await traceItem(id, 0);
    console.log();
  } catch (error: unknown) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
