import { z } from 'zod';

// Re-export project context schemas
export * from './project.js';

/**
 * Methodology types
 */
export const Methodology = z.enum(['scrum', 'waterfall', 'hybrid']);
export type Methodology = z.infer<typeof Methodology>;

/**
 * Item types in devcrumbs system
 * Scrum: epic, story, task, bug, spike, test
 * Waterfall: requirement, feature, task, bug, test
 * Hybrid: all of the above
 */
export const ItemType = z.enum([
  'epic',
  'story',
  'task',
  'requirement',
  'feature',
  'bug',
  'spike',
  'test',
]);
export type ItemType = z.infer<typeof ItemType>;

/**
 * Item status lifecycle
 */
export const ItemStatus = z.enum([
  'draft',
  'planned',
  'in-progress',
  'review',
  'done',
  'obsolete',
  'blocked',
  'cancelled',
]);
export type ItemStatus = z.infer<typeof ItemStatus>;

/**
 * Priority levels
 */
export const Priority = z.enum(['critical', 'high', 'medium', 'low']);
export type Priority = z.infer<typeof Priority>;

/**
 * Eisenhower Matrix quadrants for prioritization
 * Q1: Urgent + Important = Do First
 * Q2: Not Urgent + Important = Schedule/Plan
 * Q3: Urgent + Not Important = Delegate
 * Q4: Not Urgent + Not Important = Eliminate/Later
 */
export const EisenhowerQuadrant = z.enum([
  'urgent-important', // Q1: Do First
  'not-urgent-important', // Q2: Schedule
  'urgent-not-important', // Q3: Delegate
  'not-urgent-not-important', // Q4: Eliminate
]);
export type EisenhowerQuadrant = z.infer<typeof EisenhowerQuadrant>;

/**
 * Relationship types between items
 */
export const RelationType = z.enum([
  'implements',
  'implemented-by',
  'tested-by',
  'tests',
  'blocks',
  'blocked-by',
  'relates-to',
  'depends-on',
  'required-by',
  'supersedes',
  'superseded-by',
]);
export type RelationType = z.infer<typeof RelationType>;

/**
 * Linked items structure
 */
export const LinkedItems = z
  .object({
    implements: z.array(z.string()),
    'implemented-by': z.array(z.string()),
    'tested-by': z.array(z.string()),
    tests: z.array(z.string()),
    blocks: z.array(z.string()),
    'blocked-by': z.array(z.string()),
    'relates-to': z.array(z.string()),
    'depends-on': z.array(z.string()),
    'required-by': z.array(z.string()),
    supersedes: z.array(z.string()),
    'superseded-by': z.array(z.string()),
  })
  .default({
    implements: [],
    'implemented-by': [],
    'tested-by': [],
    tests: [],
    blocks: [],
    'blocked-by': [],
    'relates-to': [],
    'depends-on': [],
    'required-by': [],
    supersedes: [],
    'superseded-by': [],
  });
export type LinkedItems = z.infer<typeof LinkedItems>;

/**
 * Git commit reference
 */
export const GitCommit = z.object({
  hash: z.string(),
  message: z.string(),
  author: z.string(),
  timestamp: z.string(),
  branch: z.string().optional(),
});
export type GitCommit = z.infer<typeof GitCommit>;

/**
 * Core item schema - metadata stored as JSON
 */
export const ItemMetadata = z.object({
  id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/),
  type: ItemType,
  category: z.string().default('general'),
  title: z.string().min(1).max(200),
  status: ItemStatus.default('draft'),
  priority: Priority.default('medium'),
  eisenhower: EisenhowerQuadrant.optional(),
  superseded_by: z.string().optional(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  author: z.string().email().optional(),
  assignee: z.string().email().optional(),
  affected_paths: z.array(z.string()).default([]),
  linked_items: LinkedItems,
  tags: z.array(z.string()).default([]),
  estimated_effort: z.string().optional(),
  actual_effort: z.string().optional(),
  commits: z.array(GitCommit).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type ItemMetadata = z.infer<typeof ItemMetadata>;

/**
 * Configuration schema for .devcrumbs/config.json
 */
export const DevCrumbsConfig = z.object({
  version: z.string().default('0.1.0'),
  project_name: z.string(),
  project_id: z.string(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  settings: z
    .object({
      methodology: Methodology.default('scrum'),
      auto_increment: z.boolean(),
      git_integration: z.boolean(),
      default_author: z.string().email().optional(),
      item_types: z.array(ItemType),
      item_prefixes: z.record(z.string(), z.string()),
    })
    .default({
      methodology: 'scrum',
      auto_increment: true,
      git_integration: true,
      item_types: ['epic', 'story', 'task', 'bug', 'spike', 'test'],
      item_prefixes: {
        epic: 'EPIC',
        story: 'STORY',
        task: 'TASK',
        bug: 'BUG',
        spike: 'SPIKE',
        test: 'TEST',
      },
    }),
});
export type DevCrumbsConfig = z.infer<typeof DevCrumbsConfig>;

/**
 * Index schema for .devcrumbs/index.json
 */
export const DevCrumbsIndex = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      type: ItemType,
      title: z.string(),
      status: ItemStatus,
      priority: Priority,
      updated: z.string().datetime(),
    })
  ),
  last_updated: z.string().datetime(),
  counters: z.record(z.string(), z.number()).default({}),
  archived_items: z
    .array(
      z.object({
        id: z.string(),
        type: ItemType,
        title: z.string(),
        archived_at: z.string().datetime(),
        original_status: ItemStatus,
      })
    )
    .default([]),
  stats: z
    .object({
      total: z.number(),
      by_type: z.record(z.string(), z.number()),
      by_status: z.record(z.string(), z.number()),
      archived: z.number().optional(),
    })
    .optional(),
});
export type DevCrumbsIndex = z.infer<typeof DevCrumbsIndex>;
