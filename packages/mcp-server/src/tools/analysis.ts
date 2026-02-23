/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions — Context Budget Protocol analysis tools:
 * write_analysis_report, read_analysis_envelope, write_verdict, write_sprint_brief
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const ASPECT_ENUM = [
  'impact',
  'constraints',
  'quality',
  'staleness',
  'integration',
  'internal',
  'web',
  'meta',
] as const;

export const writeAnalysisReportTool: Tool = {
  name: 'write_analysis_report',
  description:
    'Write a structured AnalysisBriefing JSON to .devsteps/analysis/[taskId]/[aspect]-report.json. ' +
    'Called by aspect agent subagents after completing analysis. Uses atomic write (.tmp → rename).',
  inputSchema: {
    type: 'object',
    properties: {
      briefing: {
        type: 'object',
        description: 'AnalysisBriefing JSON object conforming to the schema (required)',
        properties: {
          task_id: { type: 'string', description: 'DevSteps item ID (e.g., TASK-222)' },
          aspect: { type: 'string', enum: ASPECT_ENUM },
          analyst: { type: 'string', description: 'Agent name that produced this briefing' },
          created: { type: 'string', description: 'ISO 8601 timestamp' },
          envelope: { type: 'object', description: 'CompressedVerdict envelope' },
          full_analysis: { type: 'string', description: 'Full markdown analysis text' },
          affected_files: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
        required: ['task_id', 'aspect', 'analyst', 'created', 'envelope', 'full_analysis'],
      },
    },
    required: ['briefing'],
  },
};

export const readAnalysisEnvelopeTool: Tool = {
  name: 'read_analysis_envelope',
  description:
    'Read the CompressedVerdict envelope from .devsteps/analysis/[taskId]/[aspect]-report.json. ' +
    'Returns only the ~150-token envelope — never the full report body. ' +
    'Use this in the coordinator AFTER aspect agents have written their reports.',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: { type: 'string', description: 'DevSteps item ID (required, e.g., TASK-222)' },
      aspect: {
        type: 'string',
        enum: ASPECT_ENUM,
        description: 'Which aspect agent report to read (required)',
      },
    },
    required: ['task_id', 'aspect'],
  },
};

export const writeVerdictTool: Tool = {
  name: 'write_verdict',
  description:
    'Write the coordinator judge meta.json for Competitive Mode. ' +
    'Records winner (analyst-internal-subagent vs analyst-web-subagent), rule applied, and briefing path. ' +
    'Written to .devsteps/analysis/[taskId]/meta.json.',
  inputSchema: {
    type: 'object',
    properties: {
      verdict: {
        type: 'object',
        description: 'SprintVerdict JSON object (required)',
        properties: {
          task_id: { type: 'string' },
          mode: { type: 'string', enum: ['competitive'] },
          winner: {
            type: 'string',
            enum: ['devsteps-analyst-internal-subagent', 'devsteps-analyst-web-subagent'],
          },
          rule_applied: {
            type: 'string',
            enum: ['RULE 1', 'RULE 2', 'RULE 3', 'RULE 4', 'RULE 5'],
          },
          implementation_briefing: { type: 'string', description: 'Path to winning report' },
          flags: { type: 'array', items: { type: 'string' } },
          created: { type: 'string' },
        },
        required: [
          'task_id',
          'mode',
          'winner',
          'rule_applied',
          'implementation_briefing',
          'created',
        ],
      },
    },
    required: ['verdict'],
  },
};

export const writeSprintBriefTool: Tool = {
  name: 'write_sprint_brief',
  description:
    'Write the Enriched Sprint Brief (produced by devsteps-planner at sprint start) to ' +
    '.devsteps/analysis/sprint-[DATE]/enriched-sprint-brief.json. ' +
    'Contains ordered item list with risk scores (QUICK/STANDARD/FULL/COMPETITIVE), ' +
    'shared-file conflict map, and cross-package build order.',
  inputSchema: {
    type: 'object',
    properties: {
      sprint_date: {
        type: 'string',
        description: 'Sprint date in YYYY-MM-DD format (required)',
      },
      brief: {
        type: 'object',
        description: 'Enriched Sprint Brief data (required)',
        properties: {
          global_context_path: { type: 'string' },
          ordered_items: { type: 'array', items: { type: 'object' } },
          invalidation_cache: { type: 'array', items: { type: 'string' } },
        },
        required: ['global_context_path', 'ordered_items'],
      },
    },
    required: ['sprint_date', 'brief'],
  },
};
