/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — CRUD operations: init, add, get, list, update
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const initTool: Tool = {
  name: 'init',
  description:
    'Initialize a new devsteps project. Creates .devsteps directory structure with config and index files. Supports Scrum, Waterfall, or Hybrid methodologies.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: {
        type: 'string',
        description: 'Name of the project (required)',
      },
      path: {
        type: 'string',
        description: 'Path where to initialize the project (optional, defaults to current directory)',
      },
      author: {
        type: 'string',
        description: 'Default author email (optional)',
      },
      git_integration: {
        type: 'boolean',
        description: 'Enable git integration (optional, default: true)',
      },
      methodology: {
        type: 'string',
        enum: ['scrum', 'waterfall', 'hybrid'],
        description:
          'Project methodology: scrum (epics/stories/tasks), waterfall (requirements/features), or hybrid (both). Optional, default: scrum',
      },
    },
    required: ['project_name'],
  },
};

export const addTool: Tool = {
  name: 'add',
  description:
    "Add a new item to the devsteps. Item types depend on methodology: Scrum (epic/story/task/bug/spike/test), Waterfall (requirement/feature/task/bug/test), Hybrid (all types). Creates both JSON metadata and Markdown description files.\n\nStatus defaults to 'draft'. Standard progression: draft → planned → in-progress → review → done",
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
        description: 'Type of item to create (required)',
      },
      title: {
        type: 'string',
        description: 'Title of the item, max 200 characters (required)',
      },
      description: {
        type: 'string',
        description: 'Detailed description in Markdown format (optional)',
      },
      category: {
        type: 'string',
        description: 'Category/module this item belongs to (optional)',
      },
      priority: {
        type: 'string',
        enum: [
          'urgent-important',
          'not-urgent-important',
          'urgent-not-important',
          'not-urgent-not-important',
        ],
        description:
          'Priority (Eisenhower Matrix): urgent-important (Q1: do first), not-urgent-important (Q2: schedule), urgent-not-important (Q3: delegate), not-urgent-not-important (Q4: eliminate). Optional.',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for categorization (optional)',
      },
      affected_paths: {
        type: 'array',
        items: { type: 'string' },
        description: 'File/directory paths affected by this item (optional)',
      },
      assignee: {
        type: 'string',
        description: 'Email of the person assigned to this item (optional)',
      },
    },
    required: ['type', 'title'],
  },
};

export const getTool: Tool = {
  name: 'get',
  description:
    'Get detailed information about a specific item including metadata and full description.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Item ID (required, e.g., REQ-001, FEAT-023)',
      },
    },
    required: ['id'],
  },
};

export const listTool: Tool = {
  name: 'list',
  description: 'List items with optional filtering by type, status, priority, assignee, or tags.',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
        description: 'Filter by item type (optional)',
      },
      status: {
        type: 'string',
        enum: [
          'draft',
          'planned',
          'in-progress',
          'review',
          'done',
          'blocked',
          'cancelled',
          'obsolete',
        ],
        description: 'Filter by status (optional)',
      },
      assignee: {
        type: 'string',
        description: 'Filter by assignee email (optional)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tags — items must have all specified tags (optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of items to return (optional)',
      },
      archived: {
        type: 'boolean',
        description: 'When true, list archived items instead of active items (optional)',
      },
    },
  },
};

export const updateTool: Tool = {
  name: 'update',
  description:
    "Update one or multiple items. Provide id (single) or ids (batch — same fields applied to all).\n\nStatus Progression: draft → planned → in-progress → review → done\n- Use 'review' status when testing/validating before marking done\n- Mark 'done' only after all quality gates pass (tests, build, manual testing, docs)\n\nTag operations (incremental, no replacement):\n- add_tags: add tags without replacing existing ones\n- remove_tags: remove specific tags",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Single item ID to update (optional if ids is provided)',
      },
      ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Multiple item IDs to update with the same patch — batch mode (optional if id is provided)',
      },
      status: {
        type: 'string',
        enum: [
          'draft',
          'planned',
          'in-progress',
          'review',
          'done',
          'blocked',
          'cancelled',
          'obsolete',
        ],
        description: 'New status (optional)',
      },
      superseded_by: {
        type: 'string',
        description: 'Item ID that supersedes/replaces this item — use when status=obsolete (optional)',
      },
      priority: {
        type: 'string',
        enum: [
          'urgent-important',
          'not-urgent-important',
          'urgent-not-important',
          'not-urgent-not-important',
        ],
        description: 'New priority (Eisenhower quadrant, optional)',
      },
      title: {
        type: 'string',
        description: 'New title — single-item only (optional)',
      },
      description: {
        type: 'string',
        description: 'New description in Markdown — single-item only, replaces existing (optional)',
      },
      append_description: {
        type: 'string',
        description: 'Append text to existing description — single-item only (optional)',
      },
      assignee: {
        type: 'string',
        description: 'New assignee email (optional)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New tags — replaces all existing tags, single-item only (optional)',
      },
      add_tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags to add without replacing existing ones — works with id and ids (optional)',
      },
      remove_tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags to remove — works with id and ids (optional)',
      },
      affected_paths: {
        type: 'array',
        items: { type: 'string' },
        description: 'New affected paths — replaces existing, single-item only (optional)',
      },
    },
    required: [],
  },
};
