/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — doc content reading tools.
 *
 * @see STORY-252 TASK-503
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const docReadContentTool: Tool = {
  name: 'devsteps_doc_read_content',
  description:
    'Read the full markdown content of a DOC item by ID. Returns structured metadata including headings[], word_count, and diataxis_type. ' +
    'Fail-fast if affected_paths is not set on the item (run devsteps update <id> --paths first). ' +
    'Falls back to the description field if the .md file is not accessible. ' +
    'Only works with items of type doc.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'DOC item ID, e.g. "DOC-042"',
      },
    },
    required: ['id'],
  },
};
