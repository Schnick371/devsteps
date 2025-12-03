/**
 * Relationship type definitions
 * Separates hierarchy relationships (strict validation) from flexible relationships (no validation)
 */

/**
 * Hierarchy relationships enforce parent-child rules
 * - implements/implemented-by: Enforces proper parent-child hierarchy
 *   Scrum: Epic → Story/Spike → Task, Bug → Epic, Task → Bug
 *   Waterfall: Requirement → Feature/Spike → Task, Bug → Requirement, Task → Bug
 */
export const HIERARCHY_RELATIONSHIPS = ['implements', 'implemented-by'] as const;

/**
 * Flexible relationships allow connections between any item types
 * - relates-to: Generic association
 * - blocks/blocked-by: Blocking dependencies (will move to hierarchy)
 * - depends-on/required-by: Technical dependencies
 * - tested-by/tests: Testing relationships
 * - supersedes/superseded-by: Version/replacement tracking
 */
export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  'blocks',
  'blocked-by',
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
