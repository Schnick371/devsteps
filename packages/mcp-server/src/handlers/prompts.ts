/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Prompts handler — DevSteps workflow prompt templates.
 *
 * Exposes named prompt templates that MCP clients (VS Code Copilot, Claude Code,
 * Cursor) can surface as slash commands or auto-invoke at session start.
 *
 * @see STORY-121 TASK-274
 * @see https://modelcontextprotocol.io/specification/2025-06-18/server/prompts
 */

import path from 'node:path';
import { formatContextAsText, getQuickContext } from '@schnick371/devsteps-shared';
import type { GetPromptResult, ListPromptsResult, Prompt } from '@modelcontextprotocol/sdk/types.js';
import { getWorkspacePath } from '../workspace.js';

/**
 * All prompts exposed by the DevSteps MCP server.
 * VS Code Copilot renders these as slash commands (e.g. /devsteps-onboard).
 */
const DEVSTEPS_PROMPTS: Prompt[] = [
  {
    name: 'devsteps-onboard',
    title: 'DevSteps: Load Project Context',
    description:
      'Load current DevSteps project context for this AI session. ' +
      'Includes tech stack, active items, conventions, and recent changes. ' +
      'Call at the beginning of each chat session.',
    arguments: [],
  },
  {
    name: 'devsteps-sprint-review',
    title: 'DevSteps: Sprint Review',
    description:
      'Summarise the current sprint state: all in-progress items, recently completed work, and blockers.',
    arguments: [],
  },
  {
    name: 'devsteps-commit-message',
    title: 'DevSteps: Generate Commit Message',
    description: 'Generate a Conventional Commits commit message for a DevSteps work item.',
    arguments: [
      {
        name: 'item_id',
        description: 'DevSteps item ID (e.g. TASK-271)',
        required: true,
      },
      {
        name: 'change_summary',
        description: 'Brief description of the changes made (optional)',
        required: false,
      },
    ],
  },
];

/**
 * List all available DevSteps prompts.
 * Handles prompts/list request.
 */
export function listPromptsHandler(): ListPromptsResult {
  return { prompts: DEVSTEPS_PROMPTS };
}

/**
 * Get a specific prompt by name, embedding live project context where appropriate.
 * Handles prompts/get request.
 */
export async function getPromptHandler(
  name: string,
  args: Record<string, string> = {}
): Promise<GetPromptResult> {
  const cwd = getWorkspacePath();
  const devstepsDir = path.join(cwd, '.devsteps');

  switch (name) {
    case 'devsteps-onboard': {
      // Embed live project context as plain text for maximum compatibility
      let contextText: string;
      try {
        const ctx = await getQuickContext(cwd, devstepsDir);
        contextText = formatContextAsText(ctx);
      } catch {
        contextText = [
          '# DevSteps Project Context',
          '',
          'Context could not be loaded — project may not be initialized.',
          'Run `devsteps init` to set up the project, then call this prompt again.',
        ].join('\n');
      }

      return {
        description: 'DevSteps project context for this AI session.',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                'Please read this DevSteps project context before responding to my requests:',
                '',
                contextText,
                '',
                'You now have full visibility into the project structure, active work items, ' +
                  'and conventions. Refer to this context when making suggestions or implementing changes.',
              ].join('\n'),
            },
          },
        ],
      };
    }

    case 'devsteps-sprint-review': {
      return {
        description: 'Sprint state summary prompt.',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                'Please review the current sprint state by calling `devsteps_context` with level "standard".',
                '',
                'Then provide a concise sprint review covering:',
                '1. **In-progress items** — what is actively being worked on',
                '2. **Completed this week** — items moved to done recently',
                '3. **Blockers** — any blocked items that need attention',
                '4. **Recommendations** — what to focus on next',
              ].join('\n'),
            },
          },
        ],
      };
    }

    case 'devsteps-commit-message': {
      const itemId = args.item_id || '<ITEM_ID>';
      const changeSummary = args.change_summary || '';

      const typeHint = itemId.startsWith('BUG') ? 'fix' : itemId.startsWith('TASK') ? 'feat' : 'chore';

      const template = [
        `${typeHint}(<scope>): ${changeSummary || '<describe what changed>'}`,
        '',
        '[Optional: additional body explaining the why]',
        '',
        `Implements: ${itemId}`,
      ].join('\n');

      return {
        description: `Commit message template for ${itemId}.`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Generate a Conventional Commits commit message for DevSteps item ${itemId}.`,
                '',
                'Template:',
                '```',
                template,
                '```',
                '',
                'Replace `<scope>` with the affected package (cli, mcp-server, shared, extension).',
                changeSummary
                  ? `The changes involve: ${changeSummary}`
                  : 'Fill in the subject line with a concise description of what changed.',
              ].join('\n'),
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
