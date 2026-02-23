/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI doctor — system and project health check functions
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { hasRefsStyleIndex } from '@schnick371/devsteps-shared';

export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string[];
  fix?: string;
}

function commandExists(command: string): boolean {
  try { execSync(`which ${command}`, { stdio: 'ignore' }); return true; } catch { return false; }
}

function getVersion(command: string, args: string[] = ['--version']): string | null {
  try { return execSync(`${command} ${args.join(' ')}`, { encoding: 'utf-8' }).trim(); } catch { return null; }
}

export function checkNode(): CheckResult {
  if (!commandExists('node')) return { name: 'Node.js', status: 'fail', message: 'Node.js not found', fix: 'Install Node.js v18+ from https://nodejs.org' };
  const version = getVersion('node');
  if (!version) return { name: 'Node.js', status: 'warn', message: 'Could not determine Node.js version' };
  const match = version.match(/v(\d+)\./);
  const major = match ? Number.parseInt(match[1], 10) : 0;
  if (major < 18) return { name: 'Node.js', status: 'fail', message: `Node.js ${version} is too old (need v18+)`, fix: 'Upgrade Node.js to v18 or higher' };
  return { name: 'Node.js', status: 'pass', message: version };
}

export function checkPackageManager(): CheckResult {
  const managers = [{ name: 'pnpm', preferred: true }, { name: 'bun', preferred: true }, { name: 'npm', preferred: false }, { name: 'yarn', preferred: false }];
  const found = managers.filter((m) => commandExists(m.name));
  if (found.length === 0) return { name: 'Package Manager', status: 'fail', message: 'No package manager found', fix: 'Install pnpm: npm install -g pnpm' };
  const preferred = found.find((m) => m.preferred);
  if (preferred) return { name: 'Package Manager', status: 'pass', message: `${preferred.name} ${getVersion(preferred.name) || '(version unknown)'}` };
  return { name: 'Package Manager', status: 'warn', message: `Using ${found[0].name} (pnpm or bun recommended)`, fix: 'Install pnpm: npm install -g pnpm' };
}

export function checkGit(): CheckResult {
  if (!commandExists('git')) return { name: 'Git', status: 'warn', message: 'Git not found (optional)', fix: 'Install Git from https://git-scm.com' };
  return { name: 'Git', status: 'pass', message: getVersion('git') || 'installed' };
}

export function checkDevStepsProject(): CheckResult {
  const devstepsDir = join(process.cwd(), '.devsteps');
  if (!existsSync(devstepsDir)) return { name: 'DevSteps Project', status: 'fail', message: 'Not initialized', fix: 'Run: devsteps init <project-name>' };
  const configPath = join(devstepsDir, 'config.json');
  if (!existsSync(configPath) || !hasRefsStyleIndex(devstepsDir)) {
    return { name: 'DevSteps Project', status: 'fail', message: 'Corrupt project structure (missing config or refs-style index)', fix: 'Reinitialize: rm -rf .devsteps && devsteps init' };
  }
  return { name: 'DevSteps Project', status: 'pass', message: 'Initialized and healthy' };
}

export function checkTypeScript(): CheckResult {
  const hasTsConfig = existsSync(join(process.cwd(), 'tsconfig.json'));
  if (!hasTsConfig) return { name: 'TypeScript', status: 'pass', message: 'Not used in this project' };
  if (!commandExists('tsc')) return { name: 'TypeScript', status: 'warn', message: 'TypeScript project but tsc not in PATH', fix: 'Install: npm install -g typescript' };
  return { name: 'TypeScript', status: 'pass', message: getVersion('tsc') || 'installed' };
}

export function checkDependencies(): CheckResult {
  const hasNodeModules = existsSync(join(process.cwd(), 'node_modules'));
  const hasPackageJson = existsSync(join(process.cwd(), 'package.json'));
  if (!hasPackageJson) return { name: 'Dependencies', status: 'pass', message: 'No package.json (not a Node.js project)' };
  if (!hasNodeModules) return { name: 'Dependencies', status: 'fail', message: 'node_modules not found', fix: 'Run: pnpm install (or npm install)' };
  return { name: 'Dependencies', status: 'pass', message: 'Installed' };
}

export function checkMCPConfig(): CheckResult {
  const vscodeConfig = join(process.cwd(), '.vscode', 'mcp.json');
  const cursorConfig = join(process.cwd(), '.cursor', 'mcp.json');
  if (existsSync(vscodeConfig)) return { name: 'MCP Configuration', status: 'pass', message: 'VS Code MCP configured' };
  if (existsSync(cursorConfig)) return { name: 'MCP Configuration', status: 'pass', message: 'Cursor MCP configured' };
  return { name: 'MCP Configuration', status: 'warn', message: 'Not configured', fix: 'Run: devsteps setup' };
}
