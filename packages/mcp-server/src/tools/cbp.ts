/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — Context Budget Protocol (CBP) Tier-2 Mandate tools:
 * write_mandate_result, read_mandate_results, write_rejection_feedback,
 * write_iteration_signal, write_escalation
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const writeMandateResultTool: Tool = {
  name: 'write_mandate_result',
  description:
    'Write a validated MandateResult to .devsteps/cbp/[sprint_id]/[mandate_id].result.json. ' +
    'Called by Tier-2 Deep Analysts after synthesizing all T3 sub-question answers. ' +
    'Tier-1 reads via read_mandate_results. Uses atomic write (.tmp → rename).',
  inputSchema: {
    type: 'object',
    properties: {
      mandate_result: {
        type: 'object',
        description: 'MandateResult JSON object (required)',
        properties: {
          mandate_id: {
            type: 'string',
            format: 'uuid',
            description: 'UUID correlating to the originating Mandate (required)',
          },
          item_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'DevSteps item IDs covered by this result (required)',
          },
          sprint_id: {
            type: 'string',
            description: 'Sprint or session context ID — used in file path (required)',
          },
          analyst: {
            type: 'string',
            description: 'Tier-2 agent name that produced this result (required)',
          },
          status: {
            type: 'string',
            enum: ['complete', 'partial', 'escalated'],
            description: 'Result status (required)',
          },
          findings: {
            type: 'string',
            description: 'Structured synthesis, MAX ~800 tokens / 6000 chars (required)',
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Top-5 actionable items for Tier-1, max 200 chars each (required)',
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Confidence score 0–1 (required)',
          },
          token_cost: {
            type: 'integer',
            minimum: 0,
            description: 'Actual tokens consumed by this analyst (required)',
          },
          completed_at: {
            type: 'string',
            description: 'ISO 8601 timestamp (required)',
          },
          escalation_reason: {
            type: 'string',
            description: 'Required when status is escalated',
          },
        },
        required: [
          'mandate_id',
          'item_ids',
          'sprint_id',
          'analyst',
          'status',
          'findings',
          'recommendations',
          'confidence',
          'token_cost',
          'completed_at',
        ],
      },
    },
    required: ['mandate_result'],
  },
};

export const readMandateResultsTool: Tool = {
  name: 'read_mandate_results',
  description:
    'Read all MandateResult files for a sprint_id from .devsteps/cbp/[sprint_id]/. ' +
    'Returns MandateResult array sorted by completed_at (ascending). ' +
    'Called by Tier-1 after dispatching Tier-2 analysts. ' +
    'Missing files return empty array (not error). Optional filters: mandate_ids, status_filter.',
  inputSchema: {
    type: 'object',
    properties: {
      sprint_id: {
        type: 'string',
        description: 'Sprint or session context ID (required)',
      },
      mandate_ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional: filter to specific mandate UUIDs. If omitted, returns all.',
      },
      status_filter: {
        type: 'string',
        enum: ['complete', 'partial', 'escalated', 'all'],
        description: 'Optional: filter by result status. Default: all',
      },
    },
    required: ['sprint_id'],
  },
};

export const writeRejectionFeedbackTool: Tool = {
  name: 'write_rejection_feedback',
  description:
    'Write structured rejection feedback from Tier-2 deep-analyst-quality to disk. ' +
    'Called when an implementation fails the quality gate. ' +
    'Tier-1 reads this and re-dispatches the impl agent with rejection context. ' +
    'Files are append-only per iteration. Hard limit: max 3 review-fix iterations.',
  inputSchema: {
    type: 'object',
    properties: {
      rejection: {
        type: 'object',
        description: 'RejectionFeedback JSON object (required)',
        properties: {
          target_subagent: {
            type: 'string',
            description: 'Tier-3 agent that produced the rejected output (required)',
          },
          iteration: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Current loop iteration (1-based, required)',
          },
          rejection_type: {
            type: 'string',
            enum: [
              'quality-insufficient',
              'wrong-approach',
              'missing-requirement',
              'test-failure',
              'type-error',
            ],
            description: 'Rejection classification (required)',
          },
          violated_criteria: {
            type: 'array',
            items: { type: 'string' },
            description: 'Acceptance criteria that failed (required)',
          },
          specific_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                line: { type: 'integer' },
                issue: { type: 'string', maxLength: 300 },
                suggestion: { type: 'string', maxLength: 300 },
              },
              required: ['file', 'issue', 'suggestion'],
            },
            description: 'File-level issues with suggestions (required)',
          },
          max_iterations_remaining: {
            type: 'integer',
            minimum: 0,
            maximum: 4,
            description: 'Iterations remaining before escalation (required)',
          },
          escalate_if_remaining: { type: 'integer', minimum: 0, maximum: 3 },
          sprint_id: { type: 'string', description: 'Sprint context ID (required)' },
          item_id: { type: 'string', description: 'DevSteps item being reviewed (required)' },
          created_at: {
            type: 'string',
            description: 'ISO 8601 timestamp (required)',
          },
        },
        required: [
          'target_subagent',
          'iteration',
          'rejection_type',
          'violated_criteria',
          'specific_issues',
          'max_iterations_remaining',
          'sprint_id',
          'item_id',
          'created_at',
        ],
      },
    },
    required: ['rejection'],
  },
};

export const writeIterationSignalTool: Tool = {
  name: 'write_iteration_signal',
  description:
    'Write current loop state to .devsteps/cbp/[sprint_id]/[item_id].loop-signal.json. ' +
    'OVERWRITES previous signal (last-write-wins = CURRENT state). ' +
    'Tier-1 reads this before each iteration to detect stuck/resolved loops. ' +
    'Max iterations bounded by CBP_LOOP constants. Supports: tdd, review-fix, clarification, replanning.',
  inputSchema: {
    type: 'object',
    properties: {
      signal: {
        type: 'object',
        description: 'IterationSignal JSON object (required)',
        properties: {
          loop_type: {
            type: 'string',
            enum: ['tdd', 'review-fix', 'clarification', 'replanning'],
            description: 'Loop type (required)',
          },
          status: {
            type: 'string',
            enum: ['continuing', 'resolved', 'exhausted', 'escalated'],
            description: 'Current loop status (required)',
          },
          iteration: { type: 'integer', minimum: 1, description: 'Current iteration (required)' },
          max_iterations: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Maximum iterations allowed (required)',
          },
          sprint_id: { type: 'string', description: 'Sprint context ID (required)' },
          item_id: { type: 'string', description: 'DevSteps item ID (required)' },
          notes: { type: 'string', maxLength: 500, description: 'Optional context notes' },
          signaled_at: {
            type: 'string',
            description: 'ISO 8601 timestamp (required)',
          },
        },
        required: [
          'loop_type',
          'status',
          'iteration',
          'max_iterations',
          'sprint_id',
          'item_id',
          'signaled_at',
        ],
      },
    },
    required: ['signal'],
  },
};

export const writeEscalationTool: Tool = {
  name: 'write_escalation',
  description:
    'Write an escalation signal when an agent cannot proceed without external input. ' +
    'Tier-1 checks for pending escalations before each phase and PAUSES execution. ' +
    'Never silently continue after writing an escalation. ' +
    'Storage: .devsteps/cbp/[sprint_id]/escalations/[escalation_id].json. ' +
    'Returns the escalation_id for correlation.',
  inputSchema: {
    type: 'object',
    properties: {
      source_agent: {
        type: 'string',
        description: 'Agent that triggered the escalation (required)',
      },
      escalation_type: {
        type: 'string',
        enum: [
          'human-required',
          'contradicting-requirements',
          'budget-exhausted',
          'architectural-decision',
          'scope-ambiguous',
        ],
        description: 'Escalation classification (required)',
      },
      context: {
        type: 'string',
        maxLength: 3000,
        description: 'What led to this escalation, max ~400 tokens (required)',
      },
      decision_needed: {
        type: 'string',
        maxLength: 500,
        description: 'Specific question for human or Tier-1 (required)',
      },
      blocking_items: {
        type: 'array',
        items: { type: 'string' },
        description: 'DevSteps item IDs blocked by this escalation (required)',
      },
      suggested_resolution: {
        type: 'string',
        maxLength: 500,
        description: 'Optional: what the agent suggests as resolution',
      },
      sprint_id: { type: 'string', description: 'Sprint context ID (required)' },
      escalated_at: {
        type: 'string',
        description: 'ISO 8601 timestamp (required)',
      },
    },
    required: [
      'source_agent',
      'escalation_type',
      'context',
      'decision_needed',
      'blocking_items',
      'sprint_id',
      'escalated_at',
    ],
  },
};
