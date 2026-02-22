/**
 * Centralized constants for type-safe comparisons.
 * Use these instead of string literals to get autocomplete + compile-time safety.
 *
 * @example
 * // ❌ BAD
 * if (item.type === 'task') { ... }
 *
 * // ✅ GOOD
 * if (item.type === ITEM_TYPE.TASK) { ... }
 */

/**
 * Item type constants
 */
export const ITEM_TYPE = {
  EPIC: 'epic',
  STORY: 'story',
  TASK: 'task',
  REQUIREMENT: 'requirement',
  FEATURE: 'feature',
  BUG: 'bug',
  SPIKE: 'spike',
  TEST: 'test',
} as const;

/**
 * Status constants
 */
export const STATUS = {
  DRAFT: 'draft',
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
  OBSOLETE: 'obsolete',
} as const;

/**
 * Relationship type constants
 */
export const RELATIONSHIP_TYPE = {
  IMPLEMENTS: 'implements',
  IMPLEMENTED_BY: 'implemented-by',
  BLOCKS: 'blocks',
  BLOCKED_BY: 'blocked-by',
  TESTED_BY: 'tested-by',
  TESTS: 'tests',
  RELATES_TO: 'relates-to',
  DEPENDS_ON: 'depends-on',
  REQUIRED_BY: 'required-by',
  SUPERSEDES: 'supersedes',
  SUPERSEDED_BY: 'superseded-by',
} as const;

/**
 * Methodology constants
 */
export const METHODOLOGY = {
  SCRUM: 'scrum',
  WATERFALL: 'waterfall',
  HYBRID: 'hybrid',
} as const;

/**
 * Hierarchy type constants (for TreeView)
 */
export const HIERARCHY_TYPE = {
  SCRUM: 'scrum',
  WATERFALL: 'waterfall',
  BOTH: 'both',
} as const;

/**
 * Type helpers for advanced usage
 */
export type ItemTypeValue = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];
export type StatusValue = (typeof STATUS)[keyof typeof STATUS];

/**
 * Context Budget Protocol — Loop iteration bounds
 *
 * Hard limits enforced at handler level (not just schema).
 * These values define the maximum number of iterations per loop type.
 * Changing these requires updating all Tier-2 agent files that reference them.
 *
 * @see EPIC-028 N-Tier Agent Hierarchy
 */
export const CBP_LOOP = {
  /** Max Review-Fix iterations before escalation (Tier-2 quality gate) */
  MAX_REVIEW_FIX_ITERATIONS: 3,
  /** Max TDD loop iterations (Tier-3 test-driven impl) */
  MAX_TDD_ITERATIONS: 3,
  /** Max clarification rounds in Tier-2 research analyst */
  MAX_CLARIFICATION_ROUNDS: 2,
  /** Max conflict-resolution rounds within a Tier-2 REDUCE phase */
  MAX_CONFLICT_RESOLUTION_ROUNDS: 2,
  /** Max Tier-2 parallel T3 dispatches per turn */
  MAX_PARALLEL_T3_DISPATCHES: 10,
  /** Max tokens for MandateResult findings field (~800 tokens) */
  MAX_MANDATE_FINDINGS_CHARS: 6000,
} as const;
export type RelationshipTypeValue = (typeof RELATIONSHIP_TYPE)[keyof typeof RELATIONSHIP_TYPE];
export type MethodologyValue = (typeof METHODOLOGY)[keyof typeof METHODOLOGY];
export type HierarchyTypeValue = (typeof HIERARCHY_TYPE)[keyof typeof HIERARCHY_TYPE];
