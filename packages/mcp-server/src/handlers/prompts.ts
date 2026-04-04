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
import type {
  GetPromptResult,
  ListPromptsResult,
  Prompt,
} from '@modelcontextprotocol/sdk/types.js';
import { formatContextAsText, getQuickContext } from '@schnick371/devsteps-shared';
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
  {
    name: 'devsteps-docs-diataxis-explain',
    title: 'DevSteps: Explain Diataxis Quadrant',
    description:
      'Explain which Diataxis quadrant a document belongs to and why. ' +
      'Provide the file path to classify.',
    arguments: [
      {
        name: 'file_path',
        description: 'Path to the markdown file to classify (relative to workspace root)',
        required: true,
      },
    ],
  },
  {
    name: 'devsteps-docs-write-howto',
    title: 'DevSteps: Scaffold How-to Guide',
    description:
      'Generate a how-to guide skeleton for a specific task. ' +
      'Follows Diataxis how-to conventions: imperative steps, prerequisites, goal statement.',
    arguments: [
      {
        name: 'task_description',
        description: 'What the user wants to accomplish (e.g. "add a new MCP tool")',
        required: true,
      },
    ],
  },
  {
    name: 'devsteps-docs-write-reference',
    title: 'DevSteps: Scaffold Reference Page',
    description:
      'Generate a reference page skeleton for an API, config, or CLI command. ' +
      'Follows Diataxis reference conventions: tables, signatures, exhaustive coverage.',
    arguments: [
      {
        name: 'subject',
        description: 'The API, config, or CLI command to document (e.g. "devsteps add command")',
        required: true,
      },
    ],
  },
  {
    name: 'devsteps-docs-classify',
    title: 'DevSteps: Classify Document',
    description:
      'Classify an existing markdown file into its Diataxis type using heuristic signals ' +
      '(path, headings, content patterns). Returns type, confidence, and reasoning.',
    arguments: [
      {
        name: 'file_path',
        description: 'Path to the markdown file to classify (relative to workspace root)',
        required: true,
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

      const typeHint = itemId.startsWith('BUG')
        ? 'fix'
        : itemId.startsWith('TASK')
          ? 'feat'
          : 'chore';

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

    case 'devsteps-docs-diataxis-explain': {
      const filePath = args.file_path || '<file_path>';
      return {
        description: `Diataxis classification for ${filePath}.`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Read the file at \`${filePath}\` and classify it into a Diataxis quadrant.`,
                '',
                'The four quadrants are:',
                '- **Tutorial** — learning-oriented, step-by-step project, "you will learn…"',
                '- **How-to** — task-oriented, numbered imperative steps, solves a specific problem',
                '- **Reference** — information-oriented, tables/signatures, exhaustive coverage',
                '- **Explanation** — understanding-oriented, why/how, trade-offs, design rationale',
                '',
                'Extended types: **Architecture** (ADR/system design), **Research** (investigation/spike)',
                '',
                'Provide:',
                '1. The primary quadrant classification',
                '2. Confidence level (high/medium/low)',
                '3. Key signals that led to the classification',
                '4. Suggestions to improve alignment with the identified quadrant',
              ].join('\n'),
            },
          },
        ],
      };
    }

    case 'devsteps-docs-write-howto': {
      const task = args.task_description || '<describe the task>';
      return {
        description: `How-to guide scaffold for: ${task}.`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Generate a how-to guide for: **${task}**`,
                '',
                'Follow Diataxis how-to conventions:',
                '- Title: "How to <verb> <noun>"',
                '- Start with a one-sentence goal statement',
                '- List prerequisites',
                '- Numbered steps with imperative verbs ("Run…", "Add…", "Configure…")',
                '- Each step: one action, expected result where helpful',
                '- End with "Next steps" linking to related docs',
                '- Keep under 200 lines; split longer procedures',
                '',
                'Output as a complete markdown file ready to save.',
              ].join('\n'),
            },
          },
        ],
      };
    }

    case 'devsteps-docs-write-reference': {
      const subject = args.subject || '<API or command>';
      return {
        description: `Reference page scaffold for: ${subject}.`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Generate a reference page for: **${subject}**`,
                '',
                'Follow Diataxis reference conventions:',
                '- Title: "Reference: <subject>"',
                '- Use tables for parameters, options, and flags',
                '- Include type signatures where applicable',
                '- Cover all options exhaustively — no opinions or tutorials',
                '- Group related items under clear headings',
                '- Add a "See also" section linking to tutorials and how-to guides',
                '',
                'Output as a complete markdown file ready to save.',
              ].join('\n'),
            },
          },
        ],
      };
    }

    case 'devsteps-docs-classify': {
      const filePath = args.file_path || '<file_path>';
      return {
        description: `Heuristic Diataxis classification for ${filePath}.`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Classify \`${filePath}\` into its Diataxis type using these heuristic signals:`,
                '',
                '| Signal | Type |',
                '|--------|------|',
                '| Path contains architecture/ or adr- | Architecture |',
                '| Path contains research/ or analyst- | Research |',
                '| Numbered steps with imperative verbs | How-to |',
                '| "you will learn" / baby-steps / project | Tutorial |',
                '| Tables of parameters, signatures | Reference |',
                '| "Why", "Background", "Trade-offs" headings | Explanation |',
                '',
                'Read the file, then provide:',
                '1. **Type**: The primary Diataxis classification',
                '2. **Confidence**: high / medium / low',
                '3. **Signals found**: List the specific signals detected',
                '4. **Mixed?**: If the doc mixes quadrants, note which and suggest a split',
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
