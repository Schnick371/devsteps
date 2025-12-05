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
        description: 'Name of the project',
      },
      path: {
        type: 'string',
        description: 'Path where to initialize the project (defaults to current directory)',
      },
      author: {
        type: 'string',
        description: 'Default author email (optional)',
      },
      git_integration: {
        type: 'boolean',
        description: 'Enable git integration (default: true)',
      },
      methodology: {
        type: 'string',
        enum: ['scrum', 'waterfall', 'hybrid'],
        description:
          'Project methodology: scrum (epics/stories/tasks), waterfall (requirements/features), or hybrid (both). Default: scrum',
      },
    },
    required: ['project_name'],
  },
};

export const addTool: Tool = {
  name: 'add',
  description:
    'Add a new item to the devsteps. Item types depend on methodology: Scrum (epic/story/task/bug/spike/test), Waterfall (requirement/feature/task/bug/test), Hybrid (all types). Creates both JSON metadata and Markdown description files.',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
        description: 'Type of item to create',
      },
      title: {
        type: 'string',
        description: 'Title of the item (max 200 characters)',
      },
      description: {
        type: 'string',
        description: 'Detailed description in Markdown format',
      },
      category: {
        type: 'string',
        description: 'Category/module this item belongs to',
      },
      priority: {
        type: 'string',
        enum: ['critical', 'high', 'medium', 'low'],
        description: 'Priority level',
      },
      eisenhower: {
        type: 'string',
        enum: [
          'urgent-important',
          'not-urgent-important',
          'urgent-not-important',
          'not-urgent-not-important',
        ],
        description:
          'Eisenhower Matrix quadrant: Q1 (urgent-important: do first), Q2 (not-urgent-important: schedule), Q3 (urgent-not-important: delegate), Q4 (not-urgent-not-important: eliminate)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for categorization',
      },
      affected_paths: {
        type: 'array',
        items: { type: 'string' },
        description: 'File/directory paths affected by this item',
      },
      assignee: {
        type: 'string',
        description: 'Email of the person assigned to this item',
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
        description: 'Item ID (e.g., REQ-001, FEAT-023)',
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
        description: 'Filter by item type',
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
        description: 'Filter by status',
      },
      priority: {
        type: 'string',
        enum: ['critical', 'high', 'medium', 'low'],
        description: 'Filter by priority',
      },
      assignee: {
        type: 'string',
        description: 'Filter by assignee email',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tags (items must have all specified tags)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of items to return',
      },
    },
  },
};

export const updateTool: Tool = {
  name: 'update',
  description:
    'Update an existing item. Can update any field including status, priority, assignee, description, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Item ID to update',
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
        description: 'New status',
      },
      superseded_by: {
        type: 'string',
        description: 'Item ID that supersedes/replaces this item (use when status=obsolete)',
      },
      priority: {
        type: 'string',
        enum: ['critical', 'high', 'medium', 'low'],
        description: 'New priority',
      },
      eisenhower: {
        type: 'string',
        enum: [
          'urgent-important',
          'not-urgent-important',
          'urgent-not-important',
          'not-urgent-not-important',
        ],
        description: 'New Eisenhower quadrant',
      },
      title: {
        type: 'string',
        description: 'New title',
      },
      description: {
        type: 'string',
        description: 'New description (Markdown)',
      },
      assignee: {
        type: 'string',
        description: 'New assignee email',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New tags (replaces existing)',
      },
      affected_paths: {
        type: 'array',
        items: { type: 'string' },
        description: 'New affected paths (replaces existing)',
      },
    },
    required: ['id'],
  },
};

export const linkTool: Tool = {
  name: 'link',
  description:
    'Create a relationship between two items. HIERARCHY RULES (implements): Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task, Spike→Task. Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task, Spike→Task. FLEXIBLE (always allowed): relates-to, blocks, depends-on, tested-by, supersedes.',
  inputSchema: {
    type: 'object',
    properties: {
      source_id: {
        type: 'string',
        description: 'Source item ID',
      },
      relation_type: {
        type: 'string',
        enum: [
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
        ],
        description: 'Type of relationship',
      },
      target_id: {
        type: 'string',
        description: 'Target item ID',
      },
    },
    required: ['source_id', 'relation_type', 'target_id'],
  },
};

export const searchTool: Tool = {
  name: 'search',
  description: 'Full-text search across all items (titles and descriptions). Supports wildcards (*), multi-word queries (AND logic), and substring matching.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query. Supports: wildcards (Tree*), multi-word (TreeView primary sidebar), exact substring (methodology)',
      },
      type: {
        type: 'string',
        enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
        description: 'Optional: filter by type',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
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
        description: 'Include detailed breakdown',
      },
    },
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
        description: 'Item ID to trace',
      },
      depth: {
        type: 'number',
        description: 'Maximum depth to traverse (default: 3)',
      },
    },
    required: ['id'],
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
        description: 'Export format',
      },
      output_path: {
        type: 'string',
        description: 'Output file path',
      },
      include_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
        },
        description: 'Types to include (default: all)',
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
        description: 'Item ID to archive (e.g., REQ-001, STORY-042)',
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
        },
        description: 'Status filter (default: done, cancelled)',
      },
      type: {
        type: 'string',
        enum: ['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test'],
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
        description: 'Context depth level. Default: quick',
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
        description: 'Output format: "prometheus" (default) or "json"',
      },
    },
  },
};
