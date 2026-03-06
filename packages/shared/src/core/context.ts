/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Context generation for AI-assisted development
 * Builds structured project context at quick/standard/deep levels.
 *
 * @see STORY-085 Context Command
 * @see STORY-121 Layered AI Context Auto-Delivery
 */

import { statSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ContextLevel, QuickContext } from '../schemas/project.js';
import { CACHE_CONFIG, getCache } from '../utils/cache.js';

interface PackageInfo {
  name: string;
  purpose: string;
  dependencies: string[];
}

interface ItemCounts {
  total: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

interface RecentUpdate {
  id: string;
  type: string;
  title: string;
  updated: string;
}

/**
 * Metadata about the freshness and origin of a context response.
 * Included in all context responses (quick, standard, deep).
 * @see STORY-121 TASK-276
 */
export interface ContextMeta {
  /** ISO 8601 timestamp when this context was generated */
  generated_at: string;
  /** Age of .devsteps/PROJECT.md in decimal hours; Infinity if file absent */
  project_md_age_hours: number;
  /** True when project_md_age_hours > 24 (or PROJECT.md missing) */
  is_stale: boolean;
  /** Context depth level returned */
  level: ContextLevel;
  /** Whether this response was served from in-memory cache */
  cache_hit: boolean;
}

interface ContextResponse {
  context_level: ContextLevel;
  tokens_used: number;
  static_context?: unknown;
  dynamic_context: {
    packages: PackageInfo[];
    active_items: ItemCounts;
    recent_updates: RecentUpdate[];
  };
  suggestions?: string[];
  context_meta?: ContextMeta;
}

/**
 * Extended item summary for standard context level
 */
interface ActiveItemSummary {
  id: string;
  type: string;
  title: string;
  status: string;
  updated: string;
  affected_paths?: string[];
}

/**
 * Analyze packages from workspace (with caching)
 */
export async function analyzePackages(projectDir: string): Promise<PackageInfo[]> {
  const cache = getCache();
  const cacheKey = `package_analysis:${projectDir}`;
  const packagesDir = path.join(projectDir, 'packages');

  // Try cache first
  const cached = cache.get<PackageInfo[]>(cacheKey, CACHE_CONFIG.PACKAGE_ANALYSIS_TTL, packagesDir);
  if (cached) {
    return cached;
  }

  const packages: PackageInfo[] = [];

  try {
    const entries = await fs.readdir(packagesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pkgPath = path.join(packagesDir, entry.name, 'package.json');
        try {
          const content = await fs.readFile(pkgPath, 'utf-8');
          const pkg = JSON.parse(content);

          packages.push({
            name: pkg.name || entry.name,
            purpose: pkg.description || 'No description',
            dependencies: Object.keys(pkg.dependencies || {}),
          });
        } catch {
          // Skip if no package.json
        }
      }
    }
  } catch {
    // No packages directory
  }

  // Cache the result
  cache.set(cacheKey, packages, packagesDir);

  return packages;
}

/**
 * Get item counts from index (with caching)
 */
export async function getItemCounts(devstepsDir: string): Promise<ItemCounts> {
  const cache = getCache();
  const cacheKey = `item_counts:${devstepsDir}`;
  const indexPath = path.join(devstepsDir, 'index.json');

  // Try cache first
  const cached = cache.get<ItemCounts>(cacheKey, CACHE_CONFIG.ITEM_COUNTS_TTL, indexPath);
  if (cached) {
    return cached;
  }

  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    // Note: Using JSON.parse directly here because loadLegacyIndex() doesn't include
    // all item fields (title, updated) needed for context operations
    const index = JSON.parse(content);

    const counts: ItemCounts = {
      total: index.items.length,
      by_type: {},
      by_status: {},
    };

    for (const item of index.items) {
      counts.by_type[item.type] = (counts.by_type[item.type] || 0) + 1;
      counts.by_status[item.status] = (counts.by_status[item.status] || 0) + 1;
    }

    // Cache the result
    cache.set(cacheKey, counts, indexPath);

    return counts;
  } catch {
    return { total: 0, by_type: {}, by_status: {} };
  }
}

/**
 * Get recent updates (last N days) (with caching)
 */
export async function getRecentUpdates(devstepsDir: string, days: number): Promise<RecentUpdate[]> {
  const cache = getCache();
  const cacheKey = `recent_updates:${devstepsDir}:${days}`;
  const indexPath = path.join(devstepsDir, 'index.json');

  // Try cache first
  const cached = cache.get<RecentUpdate[]>(cacheKey, CACHE_CONFIG.RECENT_UPDATES_TTL, indexPath);
  if (cached) {
    return cached;
  }

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    // Note: Using JSON.parse directly here because loadLegacyIndex() doesn't include
    // all item fields (title, updated) needed for context operations
    const index = JSON.parse(content);

    const updates = index.items
      .filter((item: { updated: string }) => new Date(item.updated).getTime() > cutoff)
      .sort(
        (a: { updated: string }, b: { updated: string }) =>
          new Date(b.updated).getTime() - new Date(a.updated).getTime()
      )
      .slice(0, 10)
      .map((item: { id: string; type: string; title: string; updated: string }) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        updated: item.updated,
      }));

    // Cache the result
    cache.set(cacheKey, updates, indexPath);

    return updates;
  } catch {
    return [];
  }
}

/**
 * Read PROJECT.md if exists (with caching)
 */
export async function readProjectMd(devstepsDir: string): Promise<QuickContext | null> {
  const cache = getCache();
  const cacheKey = `project_md:${devstepsDir}`;
  const projectPath = path.join(devstepsDir, 'PROJECT.md');

  // Try cache first
  const cached = cache.get<QuickContext | null>(cacheKey, CACHE_CONFIG.PROJECT_MD_TTL, projectPath);
  if (cached !== null) {
    return cached;
  }

  try {
    const content = await fs.readFile(projectPath, 'utf-8');

    // Parse markdown to extract context (simplified)
    // In production, use a proper markdown parser
    const techStack: Record<string, string> = {};
    const packages: PackageInfo[] = [];

    // Extract tech stack (look for bullet points after "### Tech Stack")
    const techStackMatch = content.match(/### Tech Stack\n([\s\S]*?)(?=\n###|$)/);
    if (techStackMatch) {
      const lines = techStackMatch[1].split('\n');
      for (const line of lines) {
        const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
        if (match) {
          techStack[match[1]] = match[2];
        }
      }
    }

    // Extract project type
    const projectTypeMatch = content.match(/### Project Type\n(.+)/);
    const projectType = projectTypeMatch?.[1] || 'Unknown';

    const result = {
      tech_stack: techStack,
      packages,
      project_type: projectType,
    };

    // Cache the result
    cache.set(cacheKey, result, projectPath);

    return result;
  } catch {
    // Cache the null result (file doesn't exist)
    cache.set(cacheKey, null);
    return null;
  }
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 chars)
 */
export function estimateTokens(obj: unknown): number {
  const str = JSON.stringify(obj);
  return Math.ceil(str.length / 4);
}

/**
 * Get quick context
 */
export async function getQuickContext(
  projectDir: string,
  devstepsDir: string
): Promise<ContextResponse> {
  const packages = await analyzePackages(projectDir);
  const activeItems = await getItemCounts(devstepsDir);
  const recentUpdates = await getRecentUpdates(devstepsDir, 7);
  const staticContext = await readProjectMd(devstepsDir);

  const response: ContextResponse = {
    context_level: 'quick',
    tokens_used: 0,
    dynamic_context: {
      packages,
      active_items: activeItems,
      recent_updates: recentUpdates,
    },
  };

  if (staticContext) {
    response.static_context = staticContext;
  }

  response.tokens_used = estimateTokens(response);

  // Add suggestions
  const suggestions: string[] = [];
  if (!staticContext) {
    suggestions.push('Run `devsteps context generate` to create PROJECT.md for richer AI context');
  }
  if (activeItems.by_status.blocked > 0) {
    suggestions.push(`${activeItems.by_status.blocked} blocked items need attention`);
  }

  if (suggestions.length > 0) {
    response.suggestions = suggestions;
  }

  // Add context_meta for staleness awareness (TASK-276)
  response.context_meta = await buildContextMeta(devstepsDir, 'quick', false);

  return response;
}
/**
 * Build context_meta block for any context response.
 * Computes PROJECT.md age from filesystem mtime.
 * @see STORY-121 TASK-276
 */
export async function buildContextMeta(
  devstepsDir: string,
  level: ContextLevel,
  cacheHit: boolean
): Promise<ContextMeta> {
  const projectPath = path.join(devstepsDir, 'PROJECT.md');
  let projectMdAgeHours = Number.POSITIVE_INFINITY;

  try {
    const stat = statSync(projectPath);
    projectMdAgeHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
  } catch {
    // File doesn't exist — treat as infinitely stale
  }

  return {
    generated_at: new Date().toISOString(),
    project_md_age_hours: projectMdAgeHours,
    is_stale: projectMdAgeHours > 24,
    level,
    cache_hit: cacheHit,
  };
}

/**
 * Get active items list from index (non-done, non-cancelled, non-obsolete)
 */
async function getActiveItemsSummary(devstepsDir: string): Promise<ActiveItemSummary[]> {
  const indexPath = path.join(devstepsDir, 'index.json');
  const TERMINAL_STATUSES = new Set(['done', 'cancelled', 'obsolete']);

  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(content);

    return (index.items as ActiveItemSummary[])
      .filter((item) => !TERMINAL_STATUSES.has(item.status))
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 30)
      .map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        status: item.status,
        updated: item.updated,
        affected_paths: item.affected_paths,
      }));
  } catch {
    return [];
  }
}

/**
 * Collect unique affected_paths from in-progress items (top 10).
 */
function collectKeyPaths(items: ActiveItemSummary[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    if (item.status !== 'in-progress') continue;
    for (const p of item.affected_paths ?? []) {
      if (!seen.has(p)) {
        seen.add(p);
        result.push(p);
        if (result.length >= 10) return result;
      }
    }
  }

  return result;
}

/**
 * Get standard context — extended project context for AI (< 20K tokens).
 * Includes all quick fields plus open items, blocked items, in-progress summary,
 * recent changes (7 days), key affected paths, and context_meta.
 * @see STORY-121 TASK-273
 */
export async function getStandardContext(
  projectDir: string,
  devstepsDir: string
): Promise<ContextResponse> {
  const [packages, activeItems, recentUpdates, staticContext, allActiveItems] = await Promise.all([
    analyzePackages(projectDir),
    getItemCounts(devstepsDir),
    getRecentUpdates(devstepsDir, 7),
    readProjectMd(devstepsDir),
    getActiveItemsSummary(devstepsDir),
  ]);

  const inProgress = allActiveItems.filter((i) => i.status === 'in-progress');
  const blocked = allActiveItems.filter((i) => i.status === 'blocked');
  const keyPaths = collectKeyPaths(allActiveItems);

  const response: ContextResponse = {
    context_level: 'standard',
    tokens_used: 0,
    dynamic_context: {
      packages,
      active_items: activeItems,
      recent_updates: recentUpdates,
    },
  };

  if (staticContext) {
    response.static_context = staticContext;
  }

  // Extended fields for standard level (stored as additional dynamic context)
  const extendedContext = {
    ...response.dynamic_context,
    open_items_count: allActiveItems.length,
    in_progress: inProgress.map((i) => ({ id: i.id, type: i.type, title: i.title, updated: i.updated })),
    blocking_items: blocked.map((i) => ({ id: i.id, type: i.type, title: i.title })),
    key_paths: keyPaths,
  };
  response.dynamic_context = extendedContext as typeof response.dynamic_context;

  // Add suggestions
  const suggestions: string[] = [];
  if (!staticContext) {
    suggestions.push('Run `devsteps context generate` to create PROJECT.md for richer AI context');
  }
  if (blocked.length > 0) {
    suggestions.push(`${blocked.length} blocked item(s) need attention`);
  }
  if (inProgress.length > 5) {
    suggestions.push(`${inProgress.length} items in-progress — consider focusing`);
  }
  if (suggestions.length > 0) {
    response.suggestions = suggestions;
  }

  response.tokens_used = estimateTokens(response);
  response.context_meta = await buildContextMeta(devstepsDir, 'standard', false);

  return response;
}

/**
 * Format a ContextResponse as readable plain text for embedding in AI prompts
 * (used by MCP resource devsteps://project-context).
 * @see STORY-121 TASK-275
 */
export function formatContextAsText(ctx: ContextResponse): string {
  const lines: string[] = [];

  lines.push('# DevSteps Project Context');
  lines.push('');

  if (ctx.static_context) {
    const sc = ctx.static_context as { tech_stack?: Record<string, string>; project_type?: string };
    if (sc.project_type) {
      lines.push(`**Project Type:** ${sc.project_type}`);
      lines.push('');
    }
    if (sc.tech_stack && Object.keys(sc.tech_stack).length > 0) {
      lines.push('## Tech Stack');
      for (const [key, val] of Object.entries(sc.tech_stack)) {
        lines.push(`- **${key}:** ${val}`);
      }
      lines.push('');
    }
  }

  // Packages
  if (ctx.dynamic_context.packages.length > 0) {
    lines.push('## Packages');
    for (const pkg of ctx.dynamic_context.packages) {
      lines.push(`- **${pkg.name}:** ${pkg.purpose}`);
    }
    lines.push('');
  }

  // Item summary
  const counts = ctx.dynamic_context.active_items;
  lines.push('## Project Status');
  lines.push(`Total items: ${counts.total}`);
  if (counts.by_status) {
    const statusParts = Object.entries(counts.by_status)
      .filter(([, n]) => n > 0)
      .map(([s, n]) => `${s}: ${n}`)
      .join(', ');
    if (statusParts) lines.push(`By status: ${statusParts}`);
  }
  lines.push('');

  // Recent updates
  if (ctx.dynamic_context.recent_updates.length > 0) {
    lines.push('## Recent Activity (last 7 days)');
    for (const u of ctx.dynamic_context.recent_updates.slice(0, 5)) {
      lines.push(`- [${u.id}] ${u.title} (${u.type}, updated ${u.updated.slice(0, 10)})`);
    }
    lines.push('');
  }

  // Staleness warning
  if (ctx.context_meta?.is_stale) {
    lines.push(
      `⚠️ Context may be stale (PROJECT.md is ${ctx.context_meta.project_md_age_hours.toFixed(1)}h old). Run \`devsteps context generate\` to refresh.`
    );
    lines.push('');
  }

  // Conventions
  lines.push('## DevSteps Conventions');
  lines.push('- Never edit .devsteps/ directly — use MCP tools or CLI');
  lines.push('- Item hierarchy: Epic → Story|Spike → Task|Bug');
  lines.push('- Status flow: draft → planned → in-progress → review → done');
  lines.push('- Git: `type(scope): subject` + footer `Implements: ID`');

  return lines.join('\n');
}
/**
 * Generate PROJECT.md content from live project state.
 * Used by `devsteps context generate` CLI command.
 * @see STORY-121 TASK-272
 */
export async function generateProjectMd(
  projectDir: string,
  devstepsDir: string
): Promise<string> {
  const [packages, counts, recentUpdates] = await Promise.all([
    analyzePackages(projectDir),
    getItemCounts(devstepsDir),
    getRecentUpdates(devstepsDir, 14),
  ]);

  let projectName = path.basename(projectDir);
  let methodology = 'scrum';
  let projectDescription = '';

  try {
    const configRaw = await fs.readFile(path.join(devstepsDir, 'config.json'), 'utf-8');
    const config = JSON.parse(configRaw);
    projectName = config.project_name || projectName;
    methodology = config.settings?.methodology || methodology;
    projectDescription = config.description || '';
  } catch {
    // config missing - use defaults
  }

  if (!projectDescription) {
    try {
      const readme = await fs.readFile(path.join(projectDir, 'README.md'), 'utf-8');
      const firstPara = readme
        .split('\n\n')
        .find((p) => p.trim() && !p.startsWith('#') && !p.startsWith('<!--'));
      projectDescription = firstPara?.trim().replace(/\n/g, ' ').slice(0, 300) || '';
    } catch {
      // No README
    }
  }

  const techLines: string[] = [];
  try {
    const rootPkg = await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8');
    const root = JSON.parse(rootPkg);
    const allDeps = { ...root.dependencies, ...root.devDependencies };
    const knownStack: Array<[RegExp, string]> = [
      [/@modelcontextprotocol\/sdk/, 'MCP SDK (@modelcontextprotocol/sdk)'],
      [/\bzod\b/, 'Zod (schema validation)'],
      [/\bcommander\b/, 'Commander (CLI framework)'],
      [/\bchalk\b/, 'Chalk (terminal styling)'],
      [/\bora\b/, 'Ora (spinners)'],
      [/\bpino\b/, 'Pino (structured logging)'],
      [/\bprom-client\b/, 'prom-client (Prometheus metrics)'],
      [/@biomejs\/biome/, 'Biome (lint + format)'],
      [/\bvitest\b/, 'Vitest (unit testing)'],
      [/\besbuild\b/, 'esbuild (bundler)'],
      [/\btypescript\b/, 'TypeScript'],
    ];
    for (const [pattern, label] of knownStack) {
      if (Object.keys(allDeps).some((k) => pattern.test(k))) {
        techLines.push(`- ${label}`);
      }
    }
  } catch {
    // No root package.json
  }

  const inProgressCount = counts.by_status['in-progress'] || 0;
  const openCount =
    counts.total -
    (counts.by_status.done || 0) -
    (counts.by_status.cancelled || 0) -
    (counts.by_status.obsolete || 0);

  const lines: string[] = [];
  lines.push(`# ${projectName}`);
  lines.push('');

  if (projectDescription) {
    lines.push('## Description');
    lines.push('');
    lines.push(projectDescription);
    lines.push('');
  }

  if (techLines.length > 0) {
    lines.push('## Tech Stack');
    lines.push('');
    lines.push('- **Runtime:** Node.js 22+, TypeScript ESM');
    lines.push('- **Monorepo:** npm workspaces, esbuild per-package');
    lines.push(`- **Methodology:** ${methodology}`);
    for (const t of techLines) {
      lines.push(t);
    }
    lines.push('');
  }

  lines.push('## Project Type');
  lines.push('');
  lines.push(methodology.charAt(0).toUpperCase() + methodology.slice(1));
  lines.push('');

  if (packages.length > 0) {
    lines.push('## Package Structure');
    lines.push('');
    for (const pkg of packages) {
      lines.push(`- **${pkg.name}:** ${pkg.purpose}`);
    }
    lines.push('');
  }

  lines.push('## Status');
  lines.push('');
  lines.push(`Total items: ${counts.total} | Open: ${openCount} | In-progress: ${inProgressCount}`);
  if (counts.by_type) {
    const typeSummary = Object.entries(counts.by_type)
      .filter(([, n]) => n > 0)
      .map(([t, n]) => `${t}: ${n}`)
      .join(', ');
    if (typeSummary) lines.push(`By type: ${typeSummary}`);
  }
  lines.push('');

  if (recentUpdates.length > 0) {
    lines.push('## Active Work');
    lines.push('');
    for (const u of recentUpdates.slice(0, 10)) {
      lines.push(`- [${u.id}] ${u.title} (${u.type})`);
    }
    lines.push('');
  }

  lines.push('## Conventions');
  lines.push('');
  lines.push('- **WorkDir:** `.devsteps/` -- managed by DevSteps tools only');
  lines.push('- **Hierarchy:** Epic -> Story|Spike -> Task|Bug');
  lines.push('- **Status flow:** draft -> planned -> in-progress -> review -> done');
  lines.push('- **Commits:** `type(scope): subject` + footer `Implements: ID`');
  lines.push('- **Quality:** Build + tests must pass before marking done');
  lines.push('');
  lines.push(`_Generated by \`devsteps context generate\` at ${new Date().toISOString()}_`);

  return lines.join('\n');
}
