#!/usr/bin/env node
/**
 * Add Copyright Headers Script
 *
 * Prepends Apache 2.0 copyright headers to source files missing them.
 * Temporary maintenance script — safe to delete after use.
 *
 * @temporary true
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const COPYRIGHT = `/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0`;

/**
 * File-specific descriptions. Key = relative path from packages/
 */
const DESCRIPTIONS = {
  // ── shared/src/core ──────────────────────────────────────────────────────
  'shared/src/core/add.ts':
    'Core add-item operation\n * Creates metadata JSON, description Markdown, and updates distributed index.',
  'shared/src/core/archive.ts':
    'Core archive and purge operations\n * Moves items to .devsteps/archive/ and updates the distributed index.',
  'shared/src/core/auto-migrate-detect.ts':
    'Auto-Migration Detection\n * Pure analysis/detection functions — no side effects, no I/O mutations.\n * These functions only read state and return status information.\n *\n * @see STORY-073 External Project Migration Auto-Detection',
  'shared/src/core/auto-migrate-impl.ts':
    'Auto-Migration Implementation\n * Stateful migration operations: performs actual index and directory migrations.\n * Contains all I/O-heavy transformation logic.\n *\n * @see STORY-073 External Project Migration Auto-Detection',
  'shared/src/core/auto-migrate.ts':
    'Auto-Migration Module — Orchestrator\n * Provides auto-detection and migration for DevSteps projects.\n * Safely migrates from legacy index.json to refs-style distributed index.\n * Safe to call repeatedly — only migrates once.\n *\n * @see STORY-073 External Project Migration Auto-Detection\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/core/bulk-update.ts':
    'Bulk update operations\n * Batch tag management and field patching across multiple work items.',
  'shared/src/core/config.ts':
    'Project configuration loader\n * Reads and validates devsteps.config.json from the .devsteps directory.',
  'shared/src/core/context.ts':
    'Context generation for AI-assisted development\n * Builds structured project context at quick/standard/deep levels.\n *\n * @see STORY-085 Context Command',
  'shared/src/core/get.ts':
    'Core get-item operation\n * Reads and returns item metadata from the distributed file store.',
  'shared/src/core/index-refs-core.ts':
    'Refs-Style Index — Core I/O Operations\n * Git-inspired distributed index implementation with atomic operations\n * and consistency guarantees across all index files.\n *\n * @see STORY-069 Foundation: Refs-Style Index Schema & Core Operations\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/core/index-refs.ts':
    'Refs-Style Index — Public API\n * Re-exports setup + I/O primitives from index-refs-core.ts\n * and provides synchronization operations for add/remove/update.\n *\n * @see STORY-069 Foundation: Refs-Style Index Schema & Core Operations\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/core/index-rebuild.ts':
    'Index Rebuild Operations\n * Rebuilds the refs-style index from source of truth (item files).\n * Scans all item directories and reconstructs index files from scratch.\n *\n * @see STORY-074 Index Rebuild Command\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/core/index.ts':
    'Core module barrel export\n * Re-exports all public operations from the shared core layer.',
  'shared/src/core/list.ts':
    'Core list-items operation\n * Queries work items with filtering by type, status, priority, and tag.',
  'shared/src/core/unlink.ts':
    'Core unlink operation\n * Removes a relationship between two work items and updates both sides.',
  'shared/src/core/update.ts':
    'Core update-item operation\n * Patches item metadata fields and synchronizes the distributed index.',
  'shared/src/core/validation.ts':
    'Relationship validation\n * Enforces hierarchy rules and flexible relationship constraints\n * based on the active project methodology.',
  'shared/src/core/link.ts':
    'Core link creation — extracted from MCP link handler\n * Creates a validated bidirectional relationship between two work items.',

  // ── shared/src/schemas ────────────────────────────────────────────────────
  'shared/src/schemas/analysis.ts':
    'Context Budget Protocol (CBP) — Analysis Schemas\n * Zod schemas for T3 archaeology and analysis envelope files.\n *\n * @see EPIC-027 CBP Tier-3 Analysis Tools',
  'shared/src/schemas/cbp-loops.ts':
    'Context Budget Protocol (CBP) — Loop Control Schemas\n * Zod schemas for rejection feedback, iteration signals, and escalation.\n *\n * @see EPIC-028 CBP Tier-2 Mandate Tools',
  'shared/src/schemas/cbp-mandate.ts':
    'Context Budget Protocol (CBP) — Tier-2 Mandate Schemas\n * Zod schemas for T2 mandate dispatch and result envelopes.\n *\n * @see EPIC-028 CBP Tier-2 Mandate Tools',
  'shared/src/schemas/index-refs.schema.ts':
    'Zod Validation Schemas for Refs-Style Index\n * Runtime validation for the distributed index architecture.\n * Ensures data integrity across all index files.\n *\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/schemas/index.ts':
    'Schemas barrel export\n * Re-exports all Zod schemas and derived TypeScript types.',
  'shared/src/schemas/project.ts':
    'Project metadata schemas\n * Zod schemas for devsteps.config.json, PROJECT.md, and context levels.',
  'shared/src/schemas/relationships.ts':
    'Relationship type definitions\n * Separates strict hierarchy relationships from flexible relationships.\n * Provides validation helpers for both categories.',

  // ── shared/src/types ─────────────────────────────────────────────────────
  'shared/src/types/commands.ts':
    'CLI and MCP command type shortcuts\n * Central type aliases for command arguments and response shapes.',
  'shared/src/types/index-refs.types.ts':
    'Refs-Style Index Types\n * Git-inspired distributed index architecture where each category\n * (type, status, priority) maintains its own JSON index file.\n *\n * @see EPIC-018 Index Architecture Refactoring',
  'shared/src/types/index.ts':
    'Types barrel export\n * Re-exports all TypeScript types from the shared type layer.',

  // ── shared/src/utils ─────────────────────────────────────────────────────
  'shared/src/utils/cache.ts':
    'In-memory file-stat cache\n * TTL-based cache keyed by file path; invalidates when mtime changes.',
  'shared/src/utils/index.ts':
    'Utils barrel export\n * Re-exports helper functions and constants from the utils layer.',
  'shared/src/utils/init-helpers.ts':
    'Project initialization helpers\n * Creates default .devsteps structure, copies GitHub Copilot templates.',

  // ── shared/src/constants ─────────────────────────────────────────────────
  'shared/src/constants/index.ts':
    'Centralized constants for type-safe comparisons\n * Use these instead of string literals to get autocomplete + compile-time safety.',

  // ── shared/src ────────────────────────────────────────────────────────────
  'shared/src/index.ts':
    'Shared package public API\n * Single entry point re-exporting all public types, schemas, and core functions.',

  // ── mcp-server/src/handlers ───────────────────────────────────────────────
  'mcp-server/src/handlers/add.ts':
    'MCP handler: add\n * Creates a new work item and returns its ID and metadata.',
  'mcp-server/src/handlers/analysis.ts':
    'MCP handlers: CBP analysis operations\n * write_analysis_report, read_analysis_envelope, write_verdict, write_sprint_brief\n *\n * @see EPIC-027 CBP Tier-3 Analysis Tools',
  'mcp-server/src/handlers/archive.ts':
    'MCP handler: archive\n * Archives a single work item by moving it to .devsteps/archive/.',
  'mcp-server/src/handlers/cbp-mandate.ts':
    'MCP handlers: CBP Tier-2 mandate operations\n * write_mandate_result, read_mandate_results, write_rejection_feedback,\n * write_iteration_signal, write_escalation\n *\n * @see EPIC-028 CBP Tier-2 Mandate Tools',
  'mcp-server/src/handlers/context.ts':
    'MCP handler: context\n * Returns structured project context at quick/standard/deep level for AI agents.',
  'mcp-server/src/handlers/export.ts':
    'MCP handler: export\n * Exports work items as Markdown, JSON, or HTML report.',
  'mcp-server/src/handlers/get.ts':
    'MCP handler: get\n * Retrieves full metadata for a single work item by ID.',
  'mcp-server/src/handlers/health.ts':
    'MCP handler: health_check\n * Returns comprehensive server health status including uptime, memory, and metrics.',
  'mcp-server/src/handlers/init.ts':
    'MCP handler: init\n * Initializes a new DevSteps project in the current workspace.',
  'mcp-server/src/handlers/link.ts':
    'MCP handler: link\n * Creates a validated bidirectional relationship between two work items.',
  'mcp-server/src/handlers/list.ts':
    'MCP handler: list\n * Returns work items filtered by type, status, priority, tag, or assignee.',
  'mcp-server/src/handlers/metrics.ts':
    'MCP handler: metrics\n * Returns Prometheus-format or JSON server metrics.',
  'mcp-server/src/handlers/purge.ts':
    'MCP handler: purge\n * Bulk-archives items matching status or type filters.',
  'mcp-server/src/handlers/read_analysis_envelope.ts':
    'MCP handler re-export: read_analysis_envelope\n * Thin re-export — delegates to analysis.ts handler.',
  'mcp-server/src/handlers/read_mandate_results.ts':
    'MCP handler re-export: read_mandate_results\n * Thin re-export — delegates to cbp-mandate.ts handler.',
  'mcp-server/src/handlers/search.ts':
    'MCP handler: search\n * Full-text search across all item titles and descriptions.',
  'mcp-server/src/handlers/status.ts':
    'MCP handler: status\n * Returns project statistics: item counts grouped by type, status, and priority.',
  'mcp-server/src/handlers/trace.ts':
    'MCP handler: trace\n * Resolves and returns the full relationship graph for a work item.',
  'mcp-server/src/handlers/unlink.ts':
    'MCP handler: unlink\n * Removes a relationship between two work items on both sides.',
  'mcp-server/src/handlers/update.ts':
    'MCP handler: update\n * Patches metadata fields or applies bulk tag changes to work items.',
  'mcp-server/src/handlers/write_analysis_report.ts':
    'MCP handler re-export: write_analysis_report\n * Thin re-export — delegates to analysis.ts handler.',
  'mcp-server/src/handlers/write_escalation.ts':
    'MCP handler re-export: write_escalation\n * Thin re-export — delegates to cbp-mandate.ts handler.',
  'mcp-server/src/handlers/write_iteration_signal.ts':
    'MCP handler re-export: write_iteration_signal\n * Thin re-export — delegates to cbp-mandate.ts handler.',
  'mcp-server/src/handlers/write_mandate_result.ts':
    'MCP handler re-export: write_mandate_result\n * Thin re-export — delegates to cbp-mandate.ts handler.',
  'mcp-server/src/handlers/write_rejection_feedback.ts':
    'MCP handler re-export: write_rejection_feedback\n * Thin re-export — delegates to cbp-mandate.ts handler.',
  'mcp-server/src/handlers/write_sprint_brief.ts':
    'MCP handler re-export: write_sprint_brief\n * Thin re-export — delegates to analysis.ts handler.',
  'mcp-server/src/handlers/write_verdict.ts':
    'MCP handler re-export: write_verdict\n * Thin re-export — delegates to analysis.ts handler.',

  // ── mcp-server/src ────────────────────────────────────────────────────────
  'mcp-server/src/http-server.ts':
    'HTTP Transport for MCP Server\n * Wraps DevStepsServer in an HTTP endpoint for Docker/production deployments.',
  'mcp-server/src/index.ts':
    'MCP Server Entry Point\n * Parses CLI arguments, configures logging, runs auto-migration,\n * then starts the server in stdio or HTTP transport mode.',
  'mcp-server/src/logger.ts':
    'Pino logger configuration\n * Configures structured JSON logging with optional file transport.',
  'mcp-server/src/metrics.ts':
    'Prometheus Metrics for MCP Server\n * Request counters, duration histograms, error rates, and connection gauges.',
  'mcp-server/src/server-utils.ts':
    'MCP Server Utilities\n * Heartbeat monitoring and tool summary generation for request logging.',
  'mcp-server/src/server.ts':
    'DevSteps MCP Server\n * Main server class — handles tool registration and MCP protocol request routing.',
  'mcp-server/src/shutdown.ts':
    'Graceful Shutdown Manager\n * Tracks in-flight operations and coordinates clean server shutdown on signals.',
  'mcp-server/src/tools/health-check.ts':
    'MCP tool definition: health_check\n * Tool schema for the health check operation.',
  'mcp-server/src/workspace.ts':
    'Workspace path resolution utility\n * MCP servers receive workspace context via process.cwd() from the spawning process.',

  // ── cli/src/commands ──────────────────────────────────────────────────────
  'cli/src/commands/archive.ts':
    'CLI archive and purge commands\n * devsteps archive <id> — moves item to .devsteps/archive/\n * devsteps purge — bulk archives items by status or type',
  'cli/src/commands/bulk.ts':
    'CLI bulk operations command\n * devsteps bulk — apply tag or status changes to multiple items at once',
  'cli/src/commands/context.ts':
    'CLI context command\n * devsteps context — generates AI-friendly project context at quick/standard/deep level',
  'cli/src/commands/init.ts':
    'CLI init command\n * devsteps init — initializes a new DevSteps project in the current directory',
  'cli/src/commands/migrate.ts':
    'CLI migrate command\n * devsteps migrate — auto-detects and migrates legacy index.json to refs-style index\n * devsteps migrate --check — dry-run check without performing changes',
  'cli/src/commands/setup.ts':
    'CLI setup command\n * devsteps setup — interactive project configuration wizard',
  'cli/src/index.ts':
    'CLI entry point\n * Registers all devsteps sub-commands and parses CLI arguments.',
};

/**
 * Build the header comment for a given file path (relative to packages/).
 */
function buildHeader(relPath) {
  const desc = DESCRIPTIONS[relPath];
  if (!desc) {
    console.warn(`  ⚠ No description for ${relPath} — skipping`);
    return null;
  }

  return `/**\n * Copyright © 2025 Thomas Hertel (the@devsteps.dev)\n * Licensed under the Apache License, Version 2.0\n *\n * ${desc}\n */\n`;
}

/**
 * Inject header into file content.
 * - If file starts with `#!/usr/bin/env node`, put header after shebang line
 * - If file starts with `/**` (existing JSDoc), insert copyright + blank line inside it
 * - Otherwise prepend the full block
 */
function injectHeader(content, header) {
  // Shebang: put header after first line
  if (content.startsWith('#!/')) {
    const newlineIdx = content.indexOf('\n');
    const sheban = content.slice(0, newlineIdx + 1);
    const rest = content.slice(newlineIdx + 1);
    // If rest already starts with a JSDoc, merge copyright into it
    if (rest.trimStart().startsWith('/**')) {
      const startIdx = rest.indexOf('/**');
      const before = rest.slice(0, startIdx + 3); // includes '/**'
      const after = rest.slice(startIdx + 3);
      return sheban + before + '\n * Copyright © 2025 Thomas Hertel (the@devsteps.dev)\n * Licensed under the Apache License, Version 2.0\n *' + after;
    }
    return sheban + header + rest;
  }

  // Existing JSDoc at top: inject copyright at the start of the block
  if (content.trimStart().startsWith('/**')) {
    const startIdx = content.indexOf('/**');
    const before = content.slice(0, startIdx + 3); // '/**'
    const after = content.slice(startIdx + 3);
    return before + '\n * Copyright © 2025 Thomas Hertel (the@devsteps.dev)\n * Licensed under the Apache License, Version 2.0\n *' + after;
  }

  // Plain file: prepend full header
  return header + '\n' + content;
}

// Files to process (relative to packages/)
const FILES = Object.keys(DESCRIPTIONS);

let count = 0;
let skipped = 0;

for (const relPath of FILES) {
  const absPath = join(ROOT, 'packages', relPath);
  let content;

  try {
    content = readFileSync(absPath, 'utf-8');
  } catch {
    console.warn(`  ⚠ File not found: ${relPath}`);
    skipped++;
    continue;
  }

  // Skip if already has copyright
  if (content.includes('Copyright ©')) {
    console.log(`  ✓ Already has header: ${relPath}`);
    skipped++;
    continue;
  }

  const header = buildHeader(relPath);
  if (!header) { skipped++; continue; }

  const newContent = injectHeader(content, header);
  writeFileSync(absPath, newContent, 'utf-8');
  console.log(`  ✅ Added header: ${relPath}`);
  count++;
}

console.log(`\nDone: ${count} files updated, ${skipped} skipped.`);
