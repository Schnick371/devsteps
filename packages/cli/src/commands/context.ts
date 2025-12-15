import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCache, hasRefsStyleIndex, loadAllIndexes, getConfig } from '@schnick371/devsteps-shared';
import chalk from 'chalk';

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

/**
 * Context stats command - Show cache metrics
 */
export async function contextStatsCommand() {
  const devstepsir = getDevStepsDir();
  const cache = getCache();
  const stats = cache.stats();

  console.log();
  console.log(chalk.bold.cyan('📊 Context System Statistics'));
  console.log();

  // Cache statistics
  console.log(chalk.bold('Cache Performance:'));
  console.log(chalk.gray('  Entries:'), stats.size);
  console.log(chalk.gray('  Cache hits:'), chalk.green(stats.hits.toString()));
  console.log(chalk.gray('  Cache misses:'), chalk.yellow(stats.misses.toString()));
  console.log(
    chalk.gray('  Hit rate:'),
    stats.hitRate >= 0.8
      ? chalk.green(`${(stats.hitRate * 100).toFixed(1)}%`)
      : chalk.yellow(`${(stats.hitRate * 100).toFixed(1)}%`)
  );

  // PROJECT.md status
  const projectMdPath = join(devstepsir, 'PROJECT.md');
  if (existsSync(projectMdPath)) {
    const projectStat = statSync(projectMdPath);
    const daysSinceUpdate = Math.floor((Date.now() - projectStat.mtimeMs) / (1000 * 60 * 60 * 24));
    console.log();
    console.log(chalk.bold('PROJECT.md:'));
    console.log(chalk.gray('  Last modified:'), chalk.cyan(`${daysSinceUpdate} days ago`));
    console.log(chalk.gray('  Size:'), chalk.cyan(`${Math.round(projectStat.size / 1024)} KB`));

    if (daysSinceUpdate > 30) {
      console.log(chalk.yellow('  ⚠️  Not updated in 30+ days - consider refreshing documentation'));
    }
  } else {
    console.log();
    console.log(chalk.bold('PROJECT.md:'));
    console.log(chalk.yellow('  Not found - create one for better AI context'));
    console.log(chalk.gray('  Tip: Document tech stack, architecture, and design decisions'));
  }

  // Config info
  try {
    const config = await getConfig(devstepsir);
    const daysSinceInit = Math.floor(
      (Date.now() - new Date(config.created).getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log();
    console.log(chalk.bold('Project Info:'));
    console.log(chalk.gray('  Name:'), chalk.cyan(config.project_name));
    console.log(chalk.gray('  Age:'), chalk.cyan(`${daysSinceInit} days`));
    console.log(chalk.gray('  Methodology:'), chalk.cyan(config.settings.methodology));
  } catch {
    // Config not found or corrupted
  }

  console.log();

  // Recommendations
  if (stats.hitRate < 0.5) {
    console.log(chalk.yellow('💡 Tip: Low cache hit rate - this is normal for first-time use'));
  } else if (stats.hitRate >= 0.8) {
    console.log(chalk.green('✨ Excellent cache performance! Context requests are fast.'));
  }

  console.log();
}

/**
 * Context validate command - Check for drift
 */
export async function contextValidateCommand() {
  const devstepsir = getDevStepsDir();

  console.log();
  console.log(chalk.bold.cyan('🔍 Context Validation'));
  console.log();

  let hasIssues = false;

  // Check PROJECT.md exists
  const projectMdPath = join(devstepsir, 'PROJECT.md');
  if (!existsSync(projectMdPath)) {
    console.log(chalk.yellow('⚠'), 'PROJECT.md not found');
    console.log(chalk.gray('  Create one to provide static context for AI'));
    console.log(chalk.cyan('  Tip: Document tech stack, architecture, design decisions'));
    hasIssues = true;
    console.log();
  } else {
    console.log(chalk.green('✓'), 'PROJECT.md exists');

    // Check age
    const projectStat = statSync(projectMdPath);
    const daysSinceUpdate = Math.floor((Date.now() - projectStat.mtimeMs) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate > 30) {
      console.log(chalk.yellow('⚠'), `Not updated in ${daysSinceUpdate} days`);
      console.log(chalk.gray('  Consider reviewing and updating documentation'));
      hasIssues = true;
    }
    console.log();
  }

  // Check config
  const configPath = join(devstepsir, 'config.json');
  if (existsSync(configPath)) {
    console.log(chalk.green('✓'), 'Configuration valid');
    console.log();
  } else {
    console.log(chalk.red('✗'), 'Configuration missing');
    console.log(chalk.gray('  Run: devstepsinit to reinitialize'));
    hasIssues = true;
    console.log();
  }

  // Check index (refs-style)
  if (hasRefsStyleIndex(devstepsir)) {
    const indexes = loadAllIndexes(devstepsir);
    const totalItems = Array.from(indexes.byType.values()).reduce((sum, ids) => sum + ids.length, 0);
    console.log(chalk.green('✓'), `Index valid (${totalItems} items, refs-style)`);
    console.log();
  } else {
    console.log(chalk.red('✗'), 'Index missing');
    console.log(chalk.gray('  Project structure corrupted or needs migration'));
    hasIssues = true;
    console.log();
  }

  // Summary
  if (!hasIssues) {
    console.log(chalk.green.bold('✅ All checks passed!'));
    console.log(chalk.gray('Your project context is healthy'));
  } else {
    console.log(chalk.yellow.bold('⚠️  Some issues found'));
    console.log(chalk.gray('Review the warnings above'));
  }

  console.log();
}
