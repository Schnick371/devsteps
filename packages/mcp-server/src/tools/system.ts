/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — System operations: search, status, export, archive, purge, context, health, metrics
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const ITEM_TYPE_ENUM = [
  'epic',
  'story',
  'task',
  'requirement',
  'feature',
  'bug',
  'spike',
  'test',
] as const;

const ITEM_STATUS_ENUM = [
  'draft',
  'planned',
  'in-progress',
  'review',
  'done',
  'blocked',
  'cancelled',
  'obsolete',
] as const;

export const searchTool: Tool = {
  name: 'search',
  description:
    'Full-text search across all items (titles and descriptions). Supports wildcards (*), multi-word queries (AND logic), and substring matching.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Search query (required). Supports: wildcards (Tree*), multi-word (TreeView primary sidebar), exact substring (methodology)',
      },
      type: {
        type: 'string',
        enum: ITEM_TYPE_ENUM,
        description: 'Optional: filter by type',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (optional)',
      },
    },
    required: ['query'],
  },
};

export const statusTool: Tool = {
  name: 'status',
  description:
    'Get project overview with statistics: total items, breakdown by type/status/priority, recent updates.',
  inputSchema: {
    type: 'object',
    properties: {
      detailed: {
        type: 'boolean',
        description: 'Include detailed breakdown (optional)',
      },
    },
  },
};

export const exportTool: Tool = {
  name: 'export',
  description: 'Export project data as formatted report (Markdown, JSON, or HTML).',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['markdown', 'json', 'html'],
        description: 'Export format (required)',
      },
      output_path: {
        type: 'string',
        description: 'Output file path (optional)',
      },
      include_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ITEM_TYPE_ENUM,
        },
        description: 'Types to include (optional, default: all)',
      },
    },
    required: ['format'],
  },
};

export const archiveTool: Tool = {
  name: 'archive',
  description:
    'Archive a single item by moving it to .devsteps/archive/. Archived items are removed from active index but remain readable.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Item ID to archive (required, e.g., REQ-001, STORY-042)',
      },
    },
    required: ['id'],
  },
};

export const purgeTool: Tool = {
  name: 'purge',
  description:
    'Bulk archive items with filters. Default: archives all done/cancelled items. Items are moved to .devsteps/archive/.',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'array',
        items: {
          type: 'string',
          enum: ITEM_STATUS_ENUM,
        },
        description: 'Status filter (optional, default: done, cancelled)',
      },
      type: {
        type: 'string',
        enum: ITEM_TYPE_ENUM,
        description: 'Optional: filter by item type',
      },
    },
  },
};

export const contextTool: Tool = {
  name: 'context',
  description:
    'Get project context for AI-assisted development. Returns curated project information combining static documentation (PROJECT.md) with dynamic analysis (packages, active items, recent updates). Reduces token usage by 70%+ compared to manual code analysis. Three levels available: quick (< 5K tokens, default), standard (< 20K tokens), deep (< 50K tokens).',
  inputSchema: {
    type: 'object',
    properties: {
      level: {
        type: 'string',
        enum: ['quick', 'standard', 'deep'],
        description: 'Context depth level (optional, default: quick)',
      },
    },
  },
};

export const healthCheckTool: Tool = {
  name: 'health',
  description:
    'Get server health status with comprehensive metrics. Returns: status (healthy/degraded/unhealthy), uptime, memory usage, request counts, error rate, average response time. Essential for monitoring and production deployments.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const metricsTool: Tool = {
  name: 'metrics',
  description:
    'Export Prometheus metrics for monitoring and observability. Returns metrics in Prometheus text format (default) or JSON. Includes: request counters, duration histograms, error rates, memory usage, uptime. Use format parameter to specify output format.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['prometheus', 'json'],
        description: 'Output format: "prometheus" (default) or "json" (optional)',
      },
    },
  },
};

export const updateCopilotFilesTool: Tool = {
  name: 'update_copilot_files',
  description:
    'Update devsteps-managed GitHub Copilot files (.github/agents, .github/instructions, .github/prompts) in the current workspace. Compares installed files against the bundled package source using SHA-256 hashes stored in HTML comments, backs up changed files, then writes fresh copies. Use dry_run to preview changes without writing.',
  inputSchema: {
    type: 'object',
    properties: {
      dry_run: {
        type: 'boolean',
        description: 'Preview changes without writing files or creating a backup (default: false)',
      },
      force: {
        type: 'boolean',
        description: 'Overwrite all files even when hashes match (default: false)',
      },
      max_backups: {
        type: 'number',
        description: 'Maximum number of backup rotations to keep (default: 5)',
      },
    },
  },
};

