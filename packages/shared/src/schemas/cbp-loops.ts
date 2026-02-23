/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Context Budget Protocol (CBP) — Loop Control Schemas
 * Zod schemas for rejection feedback, iteration signals, and escalation.
 *
 * @see EPIC-028 CBP Tier-2 Mandate Tools
 */

import { z } from 'zod';

/**
 * Context Budget Protocol (CBP) — Loop Control Schemas
 *
 * These schemas enable bounded loops across all tiers without infinite recursion.
 * Every loop MUST have a hard termination bound enforced in the handler.
 *
 * Loop types:
 * - TDD inner loop: test → impl → test (max 3 iterations, Tier-3)
 * - Review-Fix loop: review → rejection → impl → review (max 3 iterations, Tier-2↔Tier-3)
 * - Clarification loop: research → ambiguity → re-research (max 2 iterations, Tier-2)
 * - Adaptive replanning: every 5 items or on risk drift (max once per 5 items, Tier-1)
 *
 * @see EPIC-028 N-Tier Agent Hierarchy
 * @see STORY-108 MandateResult CBP Extension
 * @see SPIKE-015 Tier-4 + Loop Pattern Formalization
 */

// ─── Loop Types ───────────────────────────────────────────────────────────────

export const LoopType = z.enum([
  'tdd', // Red-Green-Refactor inner loop
  'review-fix', // Reviewer rejects → impl agent fixes → reviewer re-checks
  'clarification', // Analyst encounters ambiguity → requests clarification
  'replanning', // Sprint executor replans after accumulated drift
]);
export type LoopType = z.infer<typeof LoopType>;

export const LoopStatus = z.enum([
  'continuing', // Loop will execute another iteration
  'resolved', // Loop terminated with success
  'exhausted', // Max iterations reached without resolution
  'escalated', // Loop escalated to human or higher tier
]);
export type LoopStatus = z.infer<typeof LoopStatus>;

// ─── RejectionFeedbackSchema ──────────────────────────────────────────────────

/**
 * Written by deep-analyst-quality (Tier-2) when a Tier-3 implementation
 * fails the quality gate. Tier-1 reads this and re-dispatches the Tier-3
 * impl agent with the rejection context attached.
 *
 * Storage: .devsteps/cbp/[sprint_id]/[item_id].rejection-[iteration].json
 * Iteration files are append-only (never overwrite) for audit trail.
 */
export const RejectionIssueSchema = z.object({
  /** Relative file path where the issue was found */
  file: z.string(),
  /** Line number (optional — for precise targeting) */
  line: z.number().int().positive().optional(),
  /** Human-readable description of the issue */
  issue: z.string().max(300),
  /** Concrete suggestion for the impl agent to fix */
  suggestion: z.string().max(300),
});
export type RejectionIssue = z.infer<typeof RejectionIssueSchema>;

export const RejectionType = z.enum([
  'quality-insufficient', // Score too low, general quality issues
  'wrong-approach', // Architectural or pattern decision is wrong
  'missing-requirement', // One or more acceptance criteria not met
  'test-failure', // Tests fail (TypeScript errors, assertion failures)
  'type-error', // TypeScript strict mode violations
]);
export type RejectionType = z.infer<typeof RejectionType>;

export const RejectionFeedbackSchema = z.object({
  /** Which Tier-3 agent produced the rejected output */
  target_subagent: z.string(),
  /** Current loop iteration (1-based) */
  iteration: z.number().int().min(1).max(5),
  /** Classification of the rejection reason */
  rejection_type: RejectionType,
  /** Which acceptance criteria from the story/task were violated */
  violated_criteria: z.array(z.string()).min(1),
  /** Specific, actionable issues for the impl agent */
  specific_issues: z.array(RejectionIssueSchema).min(1).max(20),
  /** How many more iterations remain (countdown) */
  max_iterations_remaining: z.number().int().min(0).max(4),
  /** If remaining iterations ≤ this value, escalate instead of retrying */
  escalate_if_remaining: z.number().int().min(0).max(3).default(0),
  /** Sprint ID for file path construction */
  sprint_id: z.string(),
  /** Which DevSteps item this rejection applies to */
  item_id: z.string(),
  /** ISO 8601 timestamp */
  created_at: z.string().datetime(),
  /** Schema version */
  schema_version: z.literal('1.0').default('1.0'),
});
export type RejectionFeedback = z.infer<typeof RejectionFeedbackSchema>;

// ─── IterationSignalSchema ────────────────────────────────────────────────────

/**
 * Written by any agent in a loop to signal the current loop state to Tier-1.
 * Tier-1 checks this file before each iteration to detect stuck/resolved loops.
 *
 * Storage: .devsteps/cbp/[sprint_id]/[item_id].loop-signal.json
 * OVERWRITES previous signal — represents CURRENT state (not history).
 * Use iteration field to reconstruct history if needed.
 */
export const IterationSignalSchema = z.object({
  /** Which loop type is signaling */
  loop_type: LoopType,
  /** Current loop state */
  status: LoopStatus,
  /** Current iteration number (1-based) */
  iteration: z.number().int().min(1),
  /** Hard maximum — never execute iteration > max_iterations */
  max_iterations: z.number().int().min(1).max(5),
  /** Sprint ID for file path construction */
  sprint_id: z.string(),
  /** Which DevSteps item this loop is for */
  item_id: z.string(),
  /** Optional context for debugging or escalation messages */
  notes: z.string().max(500).optional(),
  /** ISO 8601 timestamp of this signal */
  signaled_at: z.string().datetime(),
  /** Schema version */
  schema_version: z.literal('1.0').default('1.0'),
});
export type IterationSignal = z.infer<typeof IterationSignalSchema>;

// ─── EscalationSignalSchema ───────────────────────────────────────────────────

/**
 * Written by any agent (any tier) when it cannot proceed without external input.
 * Tier-1 checks for pending escalations before each phase.
 * Escalations PAUSE execution — never silently continue.
 *
 * Storage: .devsteps/cbp/[sprint_id]/escalations/[escalation_id].json
 * Files are NOT overwritten — each escalation gets a unique ID.
 */
export const EscalationType = z.enum([
  'human-required', // Cannot continue without user decision
  'contradicting-requirements', // Two requirements conflict (needs user priority)
  'budget-exhausted', // Token or time budget depleted
  'architectural-decision', // Requires architecture choice beyond agent scope
  'scope-ambiguous', // Acceptance criteria are genuinely unclear
]);
export type EscalationType = z.infer<typeof EscalationType>;

export const EscalationSignalSchema = z.object({
  /** Unique ID for this escalation — used as filename */
  escalation_id: z.string().uuid(),
  /** Which agent triggered the escalation */
  source_agent: z.string(),
  /** Classification of what decision is needed */
  escalation_type: EscalationType,
  /**
   * What led to this escalation — max ~400 tokens.
   * Must be self-contained (no file path references — Tier-1 reads this inline).
   */
  context: z.string().max(3000),
  /** Specific yes/no or choice question for the human or Tier-1 */
  decision_needed: z.string().max(500),
  /** DevSteps item IDs blocked by this escalation */
  blocking_items: z.array(z.string()).min(1),
  /** What the agent suggests (included but not authoritative) */
  suggested_resolution: z.string().max(500).optional(),
  /** Sprint ID for file path construction */
  sprint_id: z.string(),
  /** ISO 8601 timestamp */
  escalated_at: z.string().datetime(),
  /** Schema version */
  schema_version: z.literal('1.0').default('1.0'),
});
export type EscalationSignal = z.infer<typeof EscalationSignalSchema>;
