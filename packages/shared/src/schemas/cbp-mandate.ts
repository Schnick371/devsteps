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
  'quality-review', // deep-analyst-quality: post-implementation gate
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

// ─── MandateResultSchema ──────────────────────────────────────────────────────

/**
 * Tier-2 → Tier-1: A MandateResult is written to disk by a Tier-2 Deep Analyst
 * after synthesizing all Tier-3 sub-question answers.
 *
 * Storage: .devsteps/cbp/[sprint_id]/[mandate_id].result.json
 * Tier-1 reads via read_mandate_results() — never reads T3 envelopes directly.
 *
 * Max ~800 tokens in findings field — enforced by schema.
 */
export const MandateResultSchema = z.object({
  /** Correlates to the originating Mandate.mandate_id */
  mandate_id: z.string().uuid(),
  /** DevSteps item IDs this result covers */
  item_ids: z.array(z.string()),
  /** Sprint ID for file path construction */
  sprint_id: z.string(),
  /** Name of the Tier-2 agent that produced this result */
  analyst: z.string(),
  /** Result completeness indicator */
  status: MandateResultStatus,
  /**
   * Structured synthesis — max ~800 tokens.
   * Should be a markdown table or structured paragraphs answering the mandate.
   */
  findings: z.string().max(6000), // ~800 tokens ≈ 6000 chars
  /** Top-5 actionable items for Tier-1, max 120 chars each */
  recommendations: z.array(z.string().max(200)).max(5),
  /** 0.0–1.0 confidence in the synthesis quality */
  confidence: z.number().min(0).max(1),
  /** Actual token cost of this analyst invocation (for Tier-1 budget tracking) */
  token_cost: z.number().int().nonnegative(),
  /** ISO 8601 timestamp when this result was written */
  completed_at: z.string().datetime(),
  /** Required when status === "escalated" */
  escalation_reason: z.string().optional(),
  /** Schema version for forward compatibility */
  schema_version: z.literal('1.0').default('1.0'),
});
export type MandateResult = z.infer<typeof MandateResultSchema>;
