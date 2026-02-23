/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Context Budget Protocol (CBP) — Analysis Schemas
 * Zod schemas for T3 archaeology and analysis envelope files.
 *
 * @see EPIC-027 CBP Tier-3 Analysis Tools
 */

import { z } from 'zod';

/**
 * Context Budget Protocol (CBP) — Analysis Schemas
 *
 * Defines structured JSON envelopes for AI agent-to-agent handoffs.
 * Aspect agents write AnalysisBriefing to disk (.devsteps/analysis/[ID]/)
 * and return CompressedVerdict envelopes (~150 tokens) in-memory to the coordinator.
 *
 * @see EPIC-027 Context Budget Protocol Infrastructure
 */

// ─── Aspect types ────────────────────────────────────────────────────────────

export const AnalysisAspect = z.enum([
  'impact',
  'constraints',
  'quality',
  'staleness',
  'integration',
  'internal', // competitive analyst: codebase
  'web', // competitive analyst: internet
  'meta', // coordinator judge verdict
]);
export type AnalysisAspect = z.infer<typeof AnalysisAspect>;

// ─── Verdict types ───────────────────────────────────────────────────────────

export const AspectVerdict = z.enum([
  'PROCEED',
  'PROCEED-WITH-CAUTION',
  'STOP',
  // staleness-specific
  'CURRENT',
  'STALE-PARTIAL',
  'STALE-OBSOLETE',
  'STALE-CONFLICT',
]);
export type AspectVerdict = z.infer<typeof AspectVerdict>;

// ─── CompressedVerdict ───────────────────────────────────────────────────────

/**
 * Compressed envelope returned IN-MEMORY by aspect agents to the coordinator.
 * Max ~150 tokens — coordinator reads only this, never the full report.
 */
export const CompressedVerdictSchema = z.object({
  /** Which aspect produced this envelope */
  aspect: AnalysisAspect,
  /** Proceed / stop / caution signal */
  verdict: AspectVerdict,
  /** 0.0–1.0 confidence in the verdict */
  confidence: z.number().min(0).max(1),
  /** Max 3, max 100 chars each — the coordinator reads these */
  top3_findings: z.array(z.string().max(200)).max(3),
  /** Relative path to the full AnalysisBriefing JSON on disk */
  report_path: z.string(),
  /** ISO 8601 timestamp */
  timestamp: z.string().datetime(),
  // ── Competitive mode fields (aspect = 'internal' | 'web' | 'meta') ───────
  /** Winner agent name (meta verdict only) */
  winner: z.string().optional(),
  /** Rule applied by the judge (meta verdict only) */
  rule_applied: z.string().optional(),
  /** Path to winning implementation briefing (meta verdict only) */
  implementation_briefing: z.string().optional(),
  /** Internet advantage claim (web analyst only) */
  internet_advantage_claim: z.string().optional(),
  /** Arbitrary aspect-specific scalar fields (kept minimal) */
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type CompressedVerdict = z.infer<typeof CompressedVerdictSchema>;

// ─── AnalysisBriefing ────────────────────────────────────────────────────────

/**
 * Full analysis report written to disk by aspect agents.
 * Path: `.devsteps/analysis/[TASK-ID]/[aspect]-report.json`
 * Contains the CompressedVerdict envelope + full markdown analysis text.
 * Impl-subagent reads this for implementation context.
 */
export const AnalysisBriefingSchema = z.object({
  /** DevSteps item ID this analysis belongs to */
  task_id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/),
  /** Which aspect this briefing covers */
  aspect: AnalysisAspect,
  /** Name of the agent that produced this briefing */
  analyst: z.string(),
  /** When the briefing was created */
  created: z.string().datetime(),
  /** The compressed envelope (also returned in-memory to coordinator) */
  envelope: CompressedVerdictSchema,
  /** Full markdown analysis text for implementation agents to read */
  full_analysis: z.string(),
  /** Files identified as affected by this analysis */
  affected_files: z.array(z.string()).default([]),
  /** Prioritized action recommendations */
  recommendations: z.array(z.string()).default([]),
  /** Schema version for forward compatibility */
  schema_version: z.literal('1.0').default('1.0'),
});
export type AnalysisBriefing = z.infer<typeof AnalysisBriefingSchema>;

// ─── SprintVerdict ───────────────────────────────────────────────────────────

/**
 * Meta-verdict written by the coordinator judge in Competitive Mode.
 * Path: `.devsteps/analysis/[TASK-ID]/meta.json`
 */
export const SprintVerdictSchema = z.object({
  task_id: z.string(),
  mode: z.literal('competitive'),
  winner: z.enum(['devsteps-analyst-internal-subagent', 'devsteps-analyst-web-subagent']),
  rule_applied: z.enum(['RULE 1', 'RULE 2', 'RULE 3', 'RULE 4', 'RULE 5']),
  implementation_briefing: z.string(),
  flags: z.array(z.string()).default([]),
  created: z.string().datetime(),
  schema_version: z.literal('1.0').default('1.0'),
});
export type SprintVerdict = z.infer<typeof SprintVerdictSchema>;

// ─── EnrichedSprintBrief ─────────────────────────────────────────────────────

/**
 * Produced by devsteps-planner at sprint start from global archaeology + backlog.
 * Path: `.devsteps/analysis/sprint-[DATE]/enriched-sprint-brief.json`
 */
export const SprintItemRisk = z.enum(['QUICK', 'STANDARD', 'FULL', 'COMPETITIVE']);
export type SprintItemRisk = z.infer<typeof SprintItemRisk>;

export const EnrichedSprintItemSchema = z.object({
  item_id: z.string(),
  title: z.string(),
  risk: SprintItemRisk,
  estimated_minutes: z.number().optional(),
  affected_files: z.array(z.string()).default([]),
  depends_on: z.array(z.string()).default([]),
  shared_file_conflicts: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
export type EnrichedSprintItem = z.infer<typeof EnrichedSprintItemSchema>;

export const EnrichedSprintBriefSchema = z.object({
  sprint_date: z.string(),
  global_context_path: z.string(),
  ordered_items: z.array(EnrichedSprintItemSchema),
  invalidation_cache: z.array(z.string()).default([]),
  created: z.string().datetime(),
  schema_version: z.literal('1.0').default('1.0'),
});
export type EnrichedSprintBrief = z.infer<typeof EnrichedSprintBriefSchema>;
