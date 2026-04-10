/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — docs import dialog chain (5 tools).
 *
 * devsteps_docs_new was removed in STORY-268 — Diataxis skeleton generation
 * is now integrated into the generic `add` command via addItem() in shared.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const docsImportTool: Tool = {
  name: 'devsteps_docs_import',
  description:
    'Scan a directory for importable documentation files. Creates an import session with HMAC-SHA256 token enforcement. Returns file excerpts for the classify loop.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Directory to scan for .md files, e.g. "docs/"',
      },
      dry_run: {
        type: 'boolean',
        description: 'If true, scan and return files without creating a session (default: false)',
      },
    },
    required: ['path'],
  },
};

export const docsClassifyTool: Tool = {
  name: 'devsteps_docs_classify',
  description:
    'Classify a single file using the Diataxis heuristic scorer. Returns score vector, winner, mixed flag, and suggested splits for mixed documents. Requires session token from devsteps_docs_import.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File path (from files[] returned by devsteps_docs_import)',
      },
      excerpt: {
        type: 'string',
        description: 'First 40 lines of file content',
      },
      session_id: {
        type: 'string',
        description: 'Session UUID from devsteps_docs_import',
      },
      token: {
        type: 'string',
        description: '64-char hex HMAC token from devsteps_docs_import',
      },
    },
    required: ['path', 'excerpt', 'session_id', 'token'],
  },
};

export const docsClassifyConfirmTool: Tool = {
  name: 'devsteps_docs_classify_confirm',
  description:
    'Record classification decision for one file: accept, split, skip, or rewrite. Updates session state and returns remaining work count.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File path being classified',
      },
      decision: {
        type: 'string',
        enum: ['accept', 'split', 'skip', 'rewrite'],
        description: 'User/LLM decision for this document',
      },
      diataxis_type: {
        type: 'string',
        enum: ['tutorial', 'how-to', 'reference', 'explanation', 'architecture', 'research'],
        description: 'Required when decision is "accept" — the Diataxis type to assign',
      },
      splits: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            new_path: { type: 'string' },
            sections: { type: 'array', items: { type: 'string' } },
            diataxis_type: {
              type: 'string',
              enum: ['tutorial', 'how-to', 'reference', 'explanation', 'architecture', 'research'],
            },
          },
          required: ['new_path', 'sections', 'diataxis_type'],
        },
        description: 'Required when decision is "split" — one entry per output file',
      },
      session_id: {
        type: 'string',
        description: 'Session UUID',
      },
      token: {
        type: 'string',
        description: '64-char hex HMAC token',
      },
    },
    required: ['path', 'decision', 'session_id', 'token'],
  },
};

export const docsBomStatusTool: Tool = {
  name: 'devsteps_docs_bom_status',
  description:
    'Read-only progress check on an import session. Returns summary table with classification status for all files.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: {
        type: 'string',
        description: 'Session UUID',
      },
      token: {
        type: 'string',
        description: '64-char hex HMAC token',
      },
    },
    required: ['session_id', 'token'],
  },
};

export const docsBomCommitTool: Tool = {
  name: 'devsteps_docs_bom_commit',
  description:
    'Finalise the import session: create DOC items in .devsteps/items/docs/ and update docs-map.json. Returns created DOC IDs.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: {
        type: 'string',
        description: 'Session UUID',
      },
      token: {
        type: 'string',
        description: '64-char hex HMAC token',
      },
      dry_run: {
        type: 'boolean',
        description:
          'If true, compute and return what would be created without writing (default: false)',
      },
    },
    required: ['session_id', 'token'],
  },
};

