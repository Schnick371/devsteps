/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — Relationship operations: link, unlink, trace
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const RELATION_TYPE_ENUM = [
  'implements',
  'implemented-by',
  'tested-by',
  'tests',
  'blocks',
  'blocked-by',
  'relates-to',
  'depends-on',
  'required-by',
  'supersedes',
  'superseded-by',
] as const;

export const linkTool: Tool = {
  name: 'link',
  description:
    'Create a relationship between two items. HIERARCHY RULES (implements): Scrum: Epic→Story|Spike, Story→Task, Bug→Task, Spike→Task. Story→Bug (blocks). Waterfall: Requirement→Feature|Spike, Feature→Task, Bug→Task, Spike→Task. Feature→Bug (blocks). FLEXIBLE (always allowed): relates-to, blocks, depends-on, tested-by, supersedes.',
  inputSchema: {
    type: 'object',
    properties: {
      source_id: {
        type: 'string',
        description: 'Source item ID (required)',
      },
      relation_type: {
        type: 'string',
        enum: RELATION_TYPE_ENUM,
        description: 'Type of relationship (required)',
      },
      target_id: {
        type: 'string',
        description: 'Target item ID (required)',
      },
    },
    required: ['source_id', 'relation_type', 'target_id'],
  },
};

export const unlinkTool: Tool = {
  name: 'unlink',
  description:
    'Remove a relationship between two items. Also removes the inverse relation bi-directionally. Idempotent: safe to call when the relation does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      source_id: {
        type: 'string',
        description: 'Source item ID (required)',
      },
      relation_type: {
        type: 'string',
        enum: RELATION_TYPE_ENUM,
        description: 'Type of relationship to remove (required)',
      },
      target_id: {
        type: 'string',
        description: 'Target item ID (required)',
      },
    },
    required: ['source_id', 'relation_type', 'target_id'],
  },
};

export const traceTool: Tool = {
  name: 'trace',
  description:
    'Show traceability tree for an item: all related items (requirements, features, tests) with relationship types.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Item ID to trace (required)',
      },
      depth: {
        type: 'number',
        description: 'Maximum depth to traverse (optional, default: 3)',
      },
    },
    required: ['id'],
  },
};
