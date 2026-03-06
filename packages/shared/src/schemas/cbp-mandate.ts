/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Context Budget Protocol (CBP) — Tier-2 Mandate Schemas
 * Zod schemas for T2 mandate dispatch and result envelopes.
 *
 * @see EPIC-028 CBP Tier-2 Mandate Tools
 */

import { z } from 'zod';

/**
 * Context Budget Protocol (CBP) — Tier-2 Mandate Schemas
 *
 * Defines structured JSON envelopes for Tier-1 ↔ Tier-2 agent handoffs.
 * Tier-1 dispatches Mandates to Tier-2 Deep Analysts.
 * Tier-2 writes MandateResult to disk and returns ~800-token synthesis to Tier-1.
 *
 * Storage path: .devsteps/cbp/[sprint_id]/[mandate_id].result.json
 *
 * @see EPIC-028 N-Tier Agent Hierarchy
 * @see STORY-108 MandateResult CBP Extension
 */

// ─── Mandate Type ─────────────────────────────────────────────────────────────

export const MandateType = z.enum([
  'archaeology', // deep-analyst-archaeology: full scope analysis
  'archaeology-delta', // deep-analyst-archaeology: incremental re-analysis
  'risk', // deep-analyst-risk: single-item risk scoring
  'risk-batch', // deep-analyst-risk: multi-item sprint risk matrix
  'research', // deep-analyst-research: external technical research
  'quality', // deep-analyst-quality: post-implementation gate (canonical)
  'quality-review', // deep-analyst-quality: post-implementation gate (legacy alias)
  'planning', // deep-analyst-planner: atomic step decomposition
  'planning-rerank', // deep-analyst-planner: adaptive sprint resequencing
]);
export type MandateType = z.infer<typeof MandateType>;

// ─── Triage Tier ─────────────────────────────────────────────────────────────

export const TriageTier = z.enum(['QUICK', 'STANDARD', 'FULL', 'COMPETITIVE']);
export type TriageTier = z.infer<typeof TriageTier>;

// ─── MandateResult Status ─────────────────────────────────────────────────────

export const MandateResultStatus = z.enum([
  'complete', // All sub-questions answered, confidence >= 0.5
  'partial', // Max resolution rounds exhausted, answers incomplete
  'escalated', // Human or higher-tier decision required
]);
export type MandateResultStatus = z.infer<typeof MandateResultStatus>;

// ─── MandateSchema ────────────────────────────────────────────────────────────

/**
 * Tier-1 → Tier-2: A Mandate is dispatched by Tier-1 to a Tier-2 Deep Analyst.
 * Contains the context for the analyst to decompose into Tier-3 sub-questions.
 *
 * NOT written to disk directly — passed as argument to the runSubagent call.
 * Tier-2 agents receive this as structured input.
 */
export const MandateSchema = z.object({
  /** Unique ID for correlation between Mandate and MandateResult */
  mandate_id: z.string().uuid(),
  /** Which Tier-2 analyst receives this mandate */
  type: MandateType,
  /** Sprint or item context identifier (used as storage path segment) */
  sprint_id: z.string(),
  /** DevSteps item IDs this mandate covers (single item or batch) */
  item_ids: z.array(z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/)),
  /** Determines which sub-questions the analyst must answer */
  triage_tier: TriageTier,
  /** Optional Tier-1 context hints (e.g., shared-file conflicts, prior results paths) */
  constraints: z.record(z.string(), z.unknown()).optional(),
  /** ISO 8601 timestamp when this mandate was dispatched */
  dispatched_at: z.string().datetime(),
  /** Token budget hint for the analyst (enforcement is advisory) */
  max_tokens: z.number().int().positive().optional(),
});
export type Mandate = z.infer<typeof MandateSchema>;

// ─── MandateResultSchema (Read / Write split) ────────────────────────────────

/**
 * READ path — lenient schema for reading historical and current MandateResult files.
 *
 * Tolerates:
 * - item_ids: [] (historical files written before .min(1) was enforced)
 * - analyst names not matching the devsteps-R{N}-{name} convention
 * - findings without a character limit (historical files may be longer)
 *
 * Storage: .devsteps/cbp/[sprint_id]/[mandate_id].result.json
 *
 * @see TASK-334 Strengthen Zod validation in MandateResultSchema
 */
export const ReadMandateResultSchema = z.object({
  /** Correlates to the originating Mandate.mandate_id */
  mandate_id: z.string().uuid(),
  /** DevSteps item IDs this result covers — NO .min(1): historical files have [] */
  item_ids: z.array(z.string()),
  /** Sprint ID for file path construction */
  sprint_id: z.string().min(1),
  /** Name of the Tier-2 agent (lenient — historical files use short names) */
  analyst: z.string().min(1),
  /** Result completeness indicator */
  status: MandateResultStatus,
  /**
   * Structured synthesis. Lenient on read — no max enforced to tolerate legacy files.
   * Write path enforces the 12000-char limit via WriteMandateResultSchema.
   */
  findings: z.string(),
  /** Top-5 actionable items for Tier-1 */
  recommendations: z.array(z.string()).max(5),
  /** 0.0–1.0 confidence in the synthesis quality */
  confidence: z.number().min(0).max(1),
  /** Actual token cost of this analyst invocation (for Tier-1 budget tracking) */
  token_cost: z.number().int().min(0),
  /** ISO 8601 timestamp when this result was written */
  completed_at: z.string().datetime(),
  /** Required when status === "escalated" */
  escalation_reason: z.string().optional(),
  /** Schema version for forward compatibility */
  schema_version: z.string().default('1.0'),
  // ── Optional extension fields (TASK-326) ──────────────────────────────────
  /** Per-analyst recommendations keyed by analyst name */
  t3_recommendations: z.record(z.string(), z.string()).optional(),
  /** Number of aspect-level recommendations aggregated */
  n_aspects_recommended: z.number().int().optional(),
  /** Approaches already tried — prevents retry cycles */
  failed_approaches: z.array(z.string()).optional(),
});

/**
 * WRITE path — strict schema enforced on ALL new MandateResult writes.
 *
 * Differences from ReadMandateResultSchema:
 * - item_ids: requires at least 1 item
 * - analyst: must match devsteps-R{N}-{name} naming convention
 *
 * Used exclusively in handleWriteMandateResult.
 *
 * @see TASK-334 Strengthen Zod validation in MandateResultSchema
 */
export const WriteMandateResultSchema = ReadMandateResultSchema.extend({
  /** At least 1 DevSteps item ID required for new writes */
  item_ids: z.array(z.string()).min(1),
  /** Must follow the devsteps-R{N}-{name} agent naming convention */
  analyst: z.string().regex(/^devsteps-R\d+-/, 'analyst must match devsteps-R{N}-{name} format'),
  /** Structured synthesis, max 12000 chars (~1600 tokens) */
  findings: z.string().max(12000, 'findings must be ≤12000 chars (≈1600 tokens) — use bullet points'),
  /** Top-5 actionable items: max 300 chars each */
  recommendations: z.array(z.string().max(300, 'each recommendation must be ≤300 chars')).max(5),
  /** Sprint ID must be safe for filesystem path: no traversal chars */
  sprint_id: z.string().min(1).regex(
    /^[a-zA-Z0-9_.\-]+$/,
    'sprint_id must contain only alphanumeric, dash, underscore, or dot characters'
  ),
});

/**
 * Backward-compatible alias — consumers importing MandateResultSchema get
 * the lenient ReadMandateResultSchema. No breaking change for existing imports.
 *
 * @deprecated Use ReadMandateResultSchema (reads) or WriteMandateResultSchema (writes) directly.
 */
export const MandateResultSchema = ReadMandateResultSchema;
export type MandateResult = z.infer<typeof ReadMandateResultSchema>;

// ─── DispatchManifestSchema ───────────────────────────────────────────────────

/**
 * Single dispatch entry — one agent invocation in a fan-out.
 * Written at dispatch time with status 'pending'; patched on MandateResult receipt.
 *
 * Storage: .devsteps/cbp/[sprint_id]/dispatch-manifest-[dispatch_id].json
 *
 * @see TASK-331 Dispatch Manifest per sprint run
 */
export const DispatchEntrySchema = z.object({
  /** Correlates to the MandateResult written by this agent */
  mandate_id: z.string().uuid(),
  /** Agent name (e.g. 'analyst-archaeology') */
  agent: z.string(),
  /** Spider Web ring number (1–5) */
  ring: z.number().int().min(1).max(5),
  /** ISO 8601 timestamp when this agent was dispatched */
  dispatched_at: z.string().datetime(),
  /** ISO 8601 deadline for this agent */
  expected_by: z.string().datetime(),
  /** ISO 8601 timestamp when MandateResult was received — null until patched */
  completed_at: z.string().datetime().nullable(),
  /** Wall-clock duration in ms — null until patched */
  duration_ms: z.number().int().nullable(),
  /** Lifecycle status of this dispatch */
  status: z.enum(['pending', 'complete', 'failed', 'timeout']),
  /** Analyst confidence 0–1 — null until patched */
  confidence: z.number().min(0).max(1).nullable(),
  /** Approximate output tokens consumed — null until patched */
  output_tokens_approx: z.number().int().nullable(),
});
export type DispatchEntry = z.infer<typeof DispatchEntrySchema>;

/**
 * Top-level dispatch manifest for a single coord fan-out.
 * Written once at fan-out time (all entries status='pending');
 * individual entries are patched as MandateResults arrive.
 *
 * UUID-named file prevents last-write-wins races in multi-process scenarios.
 *
 * Storage: .devsteps/cbp/[sprint_id]/dispatch-manifest-[dispatch_id].json
 *
 * @see TASK-331 Dispatch Manifest per sprint run
 */
export const DispatchManifestSchema = z.object({
  schema_version: z.literal('1.0'),
  /** UUID uniquely identifying this fan-out run */
  dispatch_id: z.string().uuid(),
  /** Sprint or session context identifier (path segment) */
  sprint_id: z.string().min(1),
  /** Triage tier that determined the ring composition */
  triage_tier: z.enum(['QUICK', 'STANDARD', 'FULL', 'COMPETITIVE']),
  /** ISO 8601 timestamp when coord initiated the fan-out */
  session_start: z.string().datetime(),
  /** ISO 8601 deadline for coord to consider the entire dispatch timed out */
  expected_by: z.string().datetime(),
  /** One entry per dispatched agent */
  dispatches: z.array(DispatchEntrySchema),
});
export type DispatchManifest = z.infer<typeof DispatchManifestSchema>;
