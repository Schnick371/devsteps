/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Context generation for AI-assisted development
 * Builds structured project context at quick/standard/deep levels.
 *
 * @see STORY-085 Context Command
 */

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
    suggestions.push('Consider creating .devsteps/PROJECT.md for static context');
  }
  if (activeItems.by_status.blocked > 0) {
    suggestions.push(`${activeItems.by_status.blocked} blocked items need attention`);
  }

  if (suggestions.length > 0) {
    response.suggestions = suggestions;
  }

  return response;
}
