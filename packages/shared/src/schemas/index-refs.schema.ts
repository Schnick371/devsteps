/**
 * Zod Validation Schemas for Refs-Style Index
 *
 * Runtime validation for the distributed index architecture.
 * Ensures data integrity across all index files.
 *
 * @see EPIC-018 Index Architecture Refactoring
 * @see STORY-069 Foundation: Refs-Style Index Schema
 */

import { z } from 'zod';

/**
 * Category index schema - base structure for all index files
 */
export const CategoryIndexSchema = z.object({
  /** Category name */
  category: z.string(),

  /** Array of item IDs */
  items: z.array(z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/)),

  /** Last update timestamp (ISO 8601) */
  updated: z.string().datetime(),
});

/**
 * Type index schema (by-type/*.json)
 */
export const TypeIndexSchema = CategoryIndexSchema.extend({
  category: z.enum(['epic', 'story', 'task', 'requirement', 'feature', 'bug', 'spike', 'test']),
});

/**
 * Status index schema (by-status/*.json)
 */
export const StatusIndexSchema = CategoryIndexSchema.extend({
  category: z.enum([
    'draft',
    'planned',
    'in-progress',
    'review',
    'done',
    'obsolete',
    'blocked',
    'cancelled',
  ]),
});

/**
 * Priority index schema (by-priority/*.json)
 */
export const PriorityIndexSchema = CategoryIndexSchema.extend({
  category: z.enum([
    'urgent-important',
    'not-urgent-important',
    'urgent-not-important',
    'not-urgent-not-important',
  ]),
});

/**
 * Counters schema (index/counters.json)
 *
 * Preserves ID generation counters from legacy index
 */
export const CountersSchema = z.record(
  z.string(), // item type key
  z
    .number()
    .int()
    .nonnegative() // counter value
);

/**
 * Index paths validation
 */
export const IndexPathsSchema = z.object({
  root: z.string(),
  byType: z.string(),
  byStatus: z.string(),
  byPriority: z.string(),
  counters: z.string(),
  legacy: z.string(),
});

/**
 * Validate category index file
 */
export function validateCategoryIndex(data: unknown): z.infer<typeof CategoryIndexSchema> {
  return CategoryIndexSchema.parse(data);
}

/**
 * Validate type index file
 */
export function validateTypeIndex(data: unknown): z.infer<typeof TypeIndexSchema> {
  return TypeIndexSchema.parse(data);
}

/**
 * Validate status index file
 */
export function validateStatusIndex(data: unknown): z.infer<typeof StatusIndexSchema> {
  return StatusIndexSchema.parse(data);
}

/**
 * Validate priority index file
 */
export function validatePriorityIndex(data: unknown): z.infer<typeof PriorityIndexSchema> {
  return PriorityIndexSchema.parse(data);
}

/**
 * Validate counters file
 */
export function validateCounters(data: unknown): z.infer<typeof CountersSchema> {
  return CountersSchema.parse(data);
}
