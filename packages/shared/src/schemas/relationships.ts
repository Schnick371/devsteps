/**
 * Relationship type definitions
 * Separates hierarchy relationships (strict validation) from flexible relationships (no validation)
 */

/**
 * Hierarchy relationships enforce parent-child rules
 * - implements/implemented-by: Standard hierarchy (Epic→Story→Task)
 * - blocks/blocked-by: Jira 2025 hierarchy for Bug (Bug blocks Story)
 *   Note: Other types (Story→Story, Task→Task) bypass validation (flexible)
 *   Scrum: Bug blocks Story | Waterfall: Bug blocks Feature
 */
export const HIERARCHY_RELATIONSHIPS = [
  'implements',
  'implemented-by',
  'blocks',
  'blocked-by',
] as const;

/**
 * Flexible relationships allow connections between any item types
 * Note: blocks/blocked-by moved to HIERARCHY for Bug validation (Jira 2025)
 * - relates-to: Generic association
 * - depends-on/required-by: Technical dependencies
 * - tested-by/tests: Testing relationships
 * - supersedes/superseded-by: Version/replacement tracking
 */
export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  'depends-on',
  'required-by',
  'tested-by',
  'tests',
  'supersedes',
  'superseded-by',
] as const;

export type HierarchyRelation = (typeof HIERARCHY_RELATIONSHIPS)[number];
export type FlexibleRelation = (typeof FLEXIBLE_RELATIONSHIPS)[number];
export type RelationType = HierarchyRelation | FlexibleRelation;

/**
 * Check if a relation type requires hierarchy validation
 */
export function isHierarchyRelation(relationType: string): relationType is HierarchyRelation {
  return HIERARCHY_RELATIONSHIPS.includes(relationType as HierarchyRelation);
}

/**
 * Check if a relation type is flexible (no validation)
 */
export function isFlexibleRelation(relationType: string): relationType is FlexibleRelation {
  return FLEXIBLE_RELATIONSHIPS.includes(relationType as FlexibleRelation);
}
