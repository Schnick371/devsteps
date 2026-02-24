#!/usr/bin/env node
/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI entry point
 * Registers all devsteps sub-commands and parses CLI arguments.
 */
import chalk from 'chalk';
import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import {
  addCommand,
  exportCommand,
  getCommand,
  linkCommand,
  listCommand,
  searchCommand,
  statusCommand,
  traceCommand,
  unlinkCommand,
  updateCommand,
} from './commands/index.js';
import { initCommand } from './commands/init.js';
import { updateCopilotFilesCommand } from './commands/update-copilot-files.js';

const program = new Command();

program
  .name('devsteps')
  .description('AI-powered developer task tracking system')
  .version(packageJson.version);

// Initialize project
program
  .command('init')
  .description('Initialize a new devstepsproject')
  .argument('[project-name]', 'Project name')
  .option('-p, --path <path>', 'Project path (default: current directory)')
  .option('-a, --author <email>', 'Default author email')
  .option('--no-git', 'Disable git integration')
  .option('-m, --methodology <type>', 'Methodology: scrum|waterfall|hybrid (default: scrum)')
  .action(initCommand);

// Update GitHub Copilot files
program
  .command('update-copilot-files')
  .alias('ucf')
  .description('Update devsteps-managed GitHub Copilot files (.github/agents, .github/instructions, .github/prompts)')
  .option('--dry-run', 'Preview changes without writing files')
  .option('-f, --force', 'Overwrite all files even when up-to-date')
  .option('--max-backups <number>', 'Maximum backup rotations to keep (default: 5)', Number)
  .action(async (options) => {
    await updateCopilotFilesCommand({
      dryRun: options.dryRun,
      force: options.force,
      maxBackups: options.maxBackups,
    });
  });

// Add item
program
  .command('add')
  .description('Add a new item (epic, story, task, requirement, feature, bug, spike, test)')
  .argument('<type>', 'Item type: epic|story|task|req|feat|bug|spike|test')
  .argument('<title>', 'Item title')
  .option('-d, --description <text>', 'Item description')
  .option('-c, --category <category>', 'Category/module')
  .option(
    '-p, --priority <quadrant>',
    'Priority: urgent-important|not-urgent-important|urgent-not-important|not-urgent-not-important'
  )
  .option('-t, --tags <tags...>', 'Tags (space-separated)')
  .option('-a, --assignee <email>', 'Assignee email')
  .option('--paths <paths...>', 'Affected file paths')
  .action(addCommand);

// Get item
program
  .command('get')
  .description('Get detailed information about an item')
  .argument('<id>', 'Item ID (e.g., REQ-001)')
  .action(getCommand);

// List items
program
  .command('list')
  .description('List items with optional filters')
  .option('-t, --type <type>', 'Filter by type: epic|story|task|req|feat|bug|spike|test')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <quadrant>', 'Filter by priority quadrant')
  .option('-a, --assignee <email>', 'Filter by assignee')
  .option('--tags <tags...>', 'Filter by tags')
  .option('--archived', 'Show archived items instead of active items')
  .option('-l, --limit <number>', 'Limit results')
  .action(listCommand);

// Update item
program
  .command('update')
  .description('Update an existing item')
  .argument('<id>', 'Item ID')
  .option('-s, --status <status>', 'New status')
  .option('-p, --priority <quadrant>', 'New priority quadrant')
  .option('-t, --title <title>', 'New title')
  .option('-d, --description <text>', 'New description (replaces existing)')
  .option('--append-description <text>', 'Append to existing description (preserves content)')
  .option('-a, --assignee <email>', 'New assignee')
  .option('--tags <tags...>', 'New tags (replaces existing)')
  .option('--paths <paths...>', 'New paths (replaces existing)')
  .option('--superseded-by <id>', 'ID of item that supersedes this one (for obsolete status)')
  .action(updateCommand);

// Link items
program
  .command('link')
  .description(
    'Create a relationship between two items. HIERARCHY (implements): Scrum: Epic→Story|Spike, Story→Task, Bug→Task. Story→Bug (blocks). Waterfall: Requirement→Feature|Spike, Feature→Task, Bug→Task. Feature→Bug (blocks). FLEXIBLE: relates-to, blocks, depends-on, tested-by, supersedes.'
  )
  .argument('<source-id>', 'Source item ID')
  .argument(
    '<relation-type>',
    'Relation type: implements|tested-by|blocks|relates-to|depends-on|supersedes'
  )
  .argument('<target-id>', 'Target item ID')
  .option('-f, --force', 'Override validation rules (use with caution)')
  .action(linkCommand);

// Unlink items
program
  .command('unlink')
  .description(
    'Remove a relationship between two items. Removes the inverse relation bi-directionally. Idempotent: safe to call when relation does not exist.'
  )
  .argument('<source-id>', 'Source item ID')
  .argument('<relation-type>', 'Relation type to remove')
  .argument('<target-id>', 'Target item ID')
  .action(unlinkCommand);

// Search items
program
  .command('search')
  .description('Full-text search across items')
  .argument('<query>', 'Search query')
  .option('-t, --type <type>', 'Filter by type')
  .option('-l, --limit <number>', 'Limit results', '20')
  .action(searchCommand);

// Project status
program
  .command('status')
  .description('Show project overview and statistics')
  .option('-d, --detailed', 'Show detailed breakdown')
  .action(statusCommand);

// Trace item
program
  .command('trace')
  .description('Show traceability tree for an item')
  .argument('<id>', 'Item ID')
  .option('--depth <number>', 'Maximum depth', '3')
  .action(traceCommand);

// Export project
program
  .command('export')
  .description('Export project data as report')
  .option('-f, --format <format>', 'Export format: md|json|html', 'md')
  .option('-o, --output <path>', 'Output file path')
  .option('-t, --types <types...>', 'Types to include')
  .action(exportCommand);

// Archive item
program
  .command('archive')
  .description('Archive a single item (moves to .devsteps/archive/)')
  .argument('<id>', 'Item ID to archive')
  .action(async (id: string) => {
    const { archiveCommand } = await import('./commands/archive.js');
    await archiveCommand(id);
  });

// Purge items
program
  .command('purge')
  .description('Bulk archive items (default: done/cancelled)')
  .option('-s, --status <status...>', 'Status filter (default: done, cancelled)')
  .option('-t, --type <type>', 'Type filter')
  .action(async (options) => {
    const { purgeCommand } = await import('./commands/archive.js');
    await purgeCommand(options);
  });

// Migrate index
program
  .command('migrate')
  .description('Auto-detect and migrate legacy index to refs-style')
  .option('--check', 'Check if migration is needed (dry-run)')
  .option('--skip-backup', 'Skip backup creation (advanced users)')
  .action(async (options) => {
    const { migrateCommand } = await import('./commands/migrate.js');
    await migrateCommand(options);
  });

// Setup MCP
program
  .command('setup')
  .description('Configure MCP server for your IDE')
  .option('-t, --tool <tool>', 'IDE to configure: vscode|cursor')
  .option('-g, --global', 'Install globally for all projects')
  .action(async (options) => {
    const { setupCommand } = await import('./commands/setup.js');
    await setupCommand(options);
  });

// Doctor - Health check
program
  .command('doctor')
  .description('Run health checks and index operations')
  .option('--rebuild-index', 'Rebuild index from item files')
  .option('--check', 'Check what would be rebuilt (dry-run)')
  .option('--yes', 'Skip confirmation prompts')
  .action(async (options) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

// Context commands
const contextCmd = program
  .command('context')
  .description('Manage project context and documentation');

contextCmd
  .command('stats')
  .description('Show context system statistics and cache metrics')
  .action(async () => {
    const { contextStatsCommand } = await import('./commands/context.js');
    await contextStatsCommand();
  });

contextCmd
  .command('validate')
  .description('Validate project context and check for issues')
  .action(async () => {
    const { contextValidateCommand } = await import('./commands/context.js');
    await contextValidateCommand();
  });

// Bulk operations
const bulkCmd = program.command('bulk').description('Bulk operations on multiple items');

bulkCmd
  .command('update')
  .description('Update multiple items at once')
  .argument('<ids...>', 'Item IDs to update')
  .option('-s, --status <status>', 'Set status for all items')
  .option('-a, --assignee <email>', 'Set assignee for all items')
  .option('-c, --category <category>', 'Set category for all items')
  .action(async (ids: string[], options) => {
    const { bulkUpdateCommand } = await import('./commands/bulk.js');
    await bulkUpdateCommand(ids, options);
  });

bulkCmd
  .command('tag-add')
  .description('Add tags to multiple items')
  .argument('<ids...>', 'Item IDs')
  .option('-t, --tags <tags...>', 'Tags to add')
  .action(async (ids: string[], options) => {
    const { bulkTagAddCommand } = await import('./commands/bulk.js');
    await bulkTagAddCommand(ids, options.tags || []);
  });

bulkCmd
  .command('tag-remove')
  .description('Remove tags from multiple items')
  .argument('<ids...>', 'Item IDs')
  .option('-t, --tags <tags...>', 'Tags to remove')
  .action(async (ids: string[], options) => {
    const { bulkTagRemoveCommand } = await import('./commands/bulk.js');
    await bulkTagRemoveCommand(ids, options.tags || []);
  });

// Error handling
program.exitOverride();

(async () => {
  try {
    // Auto-migrate legacy projects before command execution (matches MCP server behavior)
    const { join } = await import('node:path');
    const { existsSync } = await import('node:fs');
    const { ensureIndexMigrated } = await import('@schnick371/devsteps-shared');

    const devstepsDir = join(process.cwd(), '.devsteps');

    if (existsSync(devstepsDir)) {
      try {
        // Silent auto-migration - no output unless it fails
        await ensureIndexMigrated(devstepsDir, { silent: true });
      } catch (migrationError) {
        // Only warn - don't block CLI
        console.warn(
          chalk.yellow('⚠️  Migration check skipped:'),
          migrationError instanceof Error ? migrationError.message : 'Unknown error'
        );
      }
    }

    await program.parseAsync(process.argv);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code !== 'commander.help' && err.code !== 'commander.version') {
      const message = err.message || String(error);
      console.error(chalk.red('Error:'), message);
      process.exit(1);
    }
  }
})();
