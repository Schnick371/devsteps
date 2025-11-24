import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

/**
 * Check if a command exists
 */
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version of a command
 */
function getVersion(command: string, args: string[] = ['--version']): string | null {
  try {
    return execSync(`${command} ${args.join(' ')}`, { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

/**
 * Check Node.js installation
 */
function checkNode(): CheckResult {
  if (!commandExists('node')) {
    return {
      name: 'Node.js',
      status: 'fail',
      message: 'Node.js not found',
      fix: 'Install Node.js v18+ from https://nodejs.org',
    };
  }

  const version = getVersion('node');
  if (!version) {
    return {
      name: 'Node.js',
      status: 'warn',
      message: 'Could not determine Node.js version',
    };
  }

  const match = version.match(/v(\d+)\./);
  const major = match ? Number.parseInt(match[1]) : 0;

  if (major < 18) {
    return {
      name: 'Node.js',
      status: 'fail',
      message: `Node.js ${version} is too old (need v18+)`,
      fix: 'Upgrade Node.js to v18 or higher',
    };
  }

  return {
    name: 'Node.js',
    status: 'pass',
    message: version,
  };
}

/**
 * Check package manager (pnpm, npm, yarn, bun)
 */
function checkPackageManager(): CheckResult {
  const managers = [
    { name: 'pnpm', preferred: true },
    { name: 'bun', preferred: true },
    { name: 'npm', preferred: false },
    { name: 'yarn', preferred: false },
  ];

  const found = managers.filter((m) => commandExists(m.name));

  if (found.length === 0) {
    return {
      name: 'Package Manager',
      status: 'fail',
      message: 'No package manager found',
      fix: 'Install pnpm: npm install -g pnpm',
    };
  }

  const preferred = found.find((m) => m.preferred);
  if (preferred) {
    const version = getVersion(preferred.name);
    return {
      name: 'Package Manager',
      status: 'pass',
      message: `${preferred.name} ${version || '(version unknown)'}`,
    };
  }

  return {
    name: 'Package Manager',
    status: 'warn',
    message: `Using ${found[0].name} (pnpm or bun recommended)`,
    fix: 'Install pnpm: npm install -g pnpm',
  };
}

/**
 * Check Git installation
 */
function checkGit(): CheckResult {
  if (!commandExists('git')) {
    return {
      name: 'Git',
      status: 'warn',
      message: 'Git not found (optional)',
      fix: 'Install Git from https://git-scm.com',
    };
  }

  const version = getVersion('git');
  return {
    name: 'Git',
    status: 'pass',
    message: version || 'installed',
  };
}

/**
 * Check devcrumbs project structure
 */
function checkDevCrumbsProject(): CheckResult {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');

  if (!existsSync(devcrumbsDir)) {
    return {
      name: 'DevCrumbs Project',
      status: 'fail',
      message: 'Not initialized',
      fix: 'Run: devcrumbs init <project-name>',
    };
  }

  const configPath = join(devcrumbsDir, 'config.json');
  const indexPath = join(devcrumbsDir, 'index.json');

  if (!existsSync(configPath) || !existsSync(indexPath)) {
    return {
      name: 'DevCrumbs Project',
      status: 'fail',
      message: 'Corrupt project structure',
      fix: 'Reinitialize: rm -rf .devcrumbs && devcrumbs init',
    };
  }

  return {
    name: 'DevCrumbs Project',
    status: 'pass',
    message: 'Initialized and healthy',
  };
}

/**
 * Check TypeScript installation (if project uses it)
 */
function checkTypeScript(): CheckResult {
  const hasTsConfig = existsSync(join(process.cwd(), 'tsconfig.json'));

  if (!hasTsConfig) {
    return {
      name: 'TypeScript',
      status: 'pass',
      message: 'Not used in this project',
    };
  }

  if (!commandExists('tsc')) {
    return {
      name: 'TypeScript',
      status: 'warn',
      message: 'TypeScript project but tsc not in PATH',
      fix: 'Install: npm install -g typescript',
    };
  }

  const version = getVersion('tsc');
  return {
    name: 'TypeScript',
    status: 'pass',
    message: version || 'installed',
  };
}

/**
 * Check if dependencies are installed
 */
function checkDependencies(): CheckResult {
  const hasNodeModules = existsSync(join(process.cwd(), 'node_modules'));
  const hasPackageJson = existsSync(join(process.cwd(), 'package.json'));

  if (!hasPackageJson) {
    return {
      name: 'Dependencies',
      status: 'pass',
      message: 'No package.json (not a Node.js project)',
    };
  }

  if (!hasNodeModules) {
    return {
      name: 'Dependencies',
      status: 'fail',
      message: 'node_modules not found',
      fix: 'Run: pnpm install (or npm install)',
    };
  }

  return {
    name: 'Dependencies',
    status: 'pass',
    message: 'Installed',
  };
}

/**
 * Check MCP configuration
 */
function checkMCPConfig(): CheckResult {
  const vscodeConfig = join(process.cwd(), '.vscode', 'mcp.json');
  const cursorConfig = join(process.cwd(), '.cursor', 'mcp.json');

  if (existsSync(vscodeConfig)) {
    return {
      name: 'MCP Configuration',
      status: 'pass',
      message: 'VS Code MCP configured',
    };
  }

  if (existsSync(cursorConfig)) {
    return {
      name: 'MCP Configuration',
      status: 'pass',
      message: 'Cursor MCP configured',
    };
  }

  return {
    name: 'MCP Configuration',
    status: 'warn',
    message: 'Not configured',
    fix: 'Run: devcrumbs setup',
  };
}

/**
 * Doctor command - Run health checks
 */
export async function doctorCommand() {
  console.log();
  console.log(chalk.bold.cyan('🏥 DevCrumbs Health Check'));
  console.log();

  const spinner = ora('Running diagnostics...').start();

  const checks: CheckResult[] = [
    checkNode(),
    checkPackageManager(),
    checkGit(),
    checkTypeScript(),
    checkDependencies(),
    checkDevCrumbsProject(),
    checkMCPConfig(),
  ];

  spinner.stop();

  // Display results
  let hasFailures = false;
  let hasWarnings = false;

  for (const check of checks) {
    let icon = '';
    let color: (s: string) => string = chalk.white;

    if (check.status === 'pass') {
      icon = '✓';
      color = chalk.green;
    } else if (check.status === 'warn') {
      icon = '⚠';
      color = chalk.yellow;
      hasWarnings = true;
    } else {
      icon = '✗';
      color = chalk.red;
      hasFailures = true;
    }

    console.log(color(`${icon} ${check.name}`));
    console.log(chalk.gray(`  ${check.message}`));

    if (check.fix) {
      console.log(chalk.cyan(`  Fix: ${check.fix}`));
    }

    console.log();
  }

  // Summary
  if (hasFailures) {
    console.log(chalk.red.bold('❌ Health check failed'));
    console.log(chalk.yellow('Fix the issues above and run again'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow.bold('⚠️  Health check passed with warnings'));
    console.log(chalk.gray('Consider fixing the warnings above'));
  } else {
    console.log(chalk.green.bold('✅ All checks passed!'));
    console.log(chalk.gray('Your development environment is healthy'));
  }

  console.log();
}
