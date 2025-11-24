import { z } from 'zod';

/**
 * Schema for PROJECT.md metadata section
 */
export const ProjectMetadataSchema = z.object({
  name: z.string(),
  created: z.string().datetime(),
  last_updated: z.string().datetime(),
  version: z.string(),
});

/**
 * Schema for Quick Context (< 5K tokens target)
 */
export const QuickContextSchema = z.object({
  tech_stack: z.record(z.string(), z.string()),
  packages: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      dependencies: z.array(z.string()).optional(),
    })
  ),
  project_type: z.string(),
});

/**
 * Schema for Standard Context (< 20K tokens target)
 */
export const StandardContextSchema = QuickContextSchema.extend({
  architecture: z.string(),
  design_decisions: z.array(
    z.object({
      title: z.string(),
      decision: z.string(),
      rationale: z.string(),
      tradeoffs: z.string().optional(),
    })
  ),
  module_responsibilities: z.record(z.string(), z.string()),
});

/**
 * Schema for Deep Context (< 50K tokens target)
 */
export const DeepContextSchema = StandardContextSchema.extend({
  coding_standards: z.string(),
  testing_strategy: z.string(),
  known_issues: z.array(z.string()).optional(),
  technical_debt: z.array(z.string()).optional(),
});

/**
 * Complete PROJECT.md structure
 */
export const ProjectContextSchema = z.object({
  metadata: ProjectMetadataSchema,
  quick: QuickContextSchema,
  standard: StandardContextSchema.optional(),
  deep: DeepContextSchema.optional(),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type QuickContext = z.infer<typeof QuickContextSchema>;
export type StandardContext = z.infer<typeof StandardContextSchema>;
export type DeepContext = z.infer<typeof DeepContextSchema>;
export type ProjectContext = z.infer<typeof ProjectContextSchema>;

/**
 * Context level type
 */
export type ContextLevel = 'quick' | 'standard' | 'deep';
