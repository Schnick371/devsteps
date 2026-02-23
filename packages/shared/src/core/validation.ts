/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Relationship validation
 * Enforces hierarchy rules and flexible relationship constraints
 * based on the active project methodology.
 */

import { ITEM_TYPE, METHODOLOGY, RELATIONSHIP_TYPE } from '../constants/index.js';
import type { ItemType, LinkedItems, Methodology } from '../schemas/index.js';
import { isFlexibleRelation, isHierarchyRelation } from '../schemas/relationships.js';

/**
 * Validation result with detailed error messaging
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Minimal work item info needed for validation
 */
export interface WorkItem {
  id: string;
  type: ItemType;
}

/**
 * Validate relationship between two items based on methodology
 * Only validates "implements" relationships - all other relations are flexible
 *
 * @param source - Item creating the relationship (child in hierarchy)
 * @param target - Item being referenced (parent in hierarchy)
 * @param relationType - Type of relationship
 * @param methodology - Project methodology (scrum, waterfall, hybrid)
 * @returns ValidationResult with valid flag and optional error/suggestion
 */
export function validateRelationship(
  source: WorkItem,
  target: WorkItem,
  relationType: string,
  methodology: Methodology
): ValidationResult {
  // Flexible relationships always allowed
  if (isFlexibleRelation(relationType)) {
    return { valid: true };
  }

  // Only validate hierarchy relationships
  if (!isHierarchyRelation(relationType)) {
    return { valid: false, error: `Unknown relationship type: ${relationType}` };
  }

  // Special case: blocks relation (Jira 2025 - hybrid flexible/hierarchy)
  // Non-Bug blocks: Flexible (Story→Story, Task→Task allowed)
  // Bug blocks: Hierarchy validation (Bug→Epic/Story/Requirement/Feature only)
  if (relationType === RELATIONSHIP_TYPE.BLOCKS) {
    if (source.type !== ITEM_TYPE.BUG) {
      return { valid: true }; // Flexible for non-Bug types
    }
    // Bug blocks: validate as hierarchy below
  }

  // Only validate "implements" direction (implemented-by, blocked-by are automatic reverse)
  if (
    relationType === RELATIONSHIP_TYPE.IMPLEMENTED_BY ||
    relationType === RELATIONSHIP_TYPE.BLOCKED_BY
  ) {
    return { valid: true }; // Reverse relationships auto-created, no validation needed
  }

  // Validate based on methodology
  if (methodology === METHODOLOGY.SCRUM) {
    return validateScrumHierarchy(source, target);
  }

  if (methodology === METHODOLOGY.WATERFALL) {
    return validateWaterfallHierarchy(source, target);
  }

  if (methodology === METHODOLOGY.HYBRID) {
    // Try Scrum rules first
    const scrumResult = validateScrumHierarchy(source, target);
    if (scrumResult.valid) {
      return scrumResult;
    }

    // Try Waterfall rules
    const waterfallResult = validateWaterfallHierarchy(source, target);
    if (waterfallResult.valid) {
      return waterfallResult;
    }

    // Neither worked - return Scrum error (more common)
    return scrumResult;
  }

  return {
    valid: false,
    error: `Unknown methodology: ${methodology}`,
  };
}

/**
 * Validate Scrum hierarchy rules
 * Epic → Story|Spike → Task
 * Bug/Test can implement Epic or Story
 */
function validateScrumHierarchy(source: WorkItem, target: WorkItem): ValidationResult {
  const { type: sourceType } = source;
  const { type: targetType } = target;

  // Task → Story, Spike, or Bug
  if (sourceType === ITEM_TYPE.TASK) {
    if (
      targetType === ITEM_TYPE.STORY ||
      targetType === ITEM_TYPE.SPIKE ||
      targetType === ITEM_TYPE.BUG
    ) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tasks can only implement Stories, Spikes, or Bugs in Scrum',
      suggestion: `Change ${target.id} to a Story/Bug or create one first, then link Task → Story/Bug`,
    };
  }

  // Story → Epic
  if (sourceType === ITEM_TYPE.STORY) {
    if (targetType === ITEM_TYPE.EPIC) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Stories can only implement Epics in Scrum',
      suggestion: `Change ${target.id} to an Epic or create an Epic first, then link Story → Epic`,
    };
  }

  // Spike → Epic
  if (sourceType === ITEM_TYPE.SPIKE) {
    if (targetType === ITEM_TYPE.EPIC) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Spikes can only implement Epics in Scrum',
      suggestion: `Change ${target.id} to an Epic or create an Epic first, then link Spike → Epic`,
    };
  }

  // Bug → Story only (Jira 2025)
  if (sourceType === ITEM_TYPE.BUG) {
    if (targetType === ITEM_TYPE.STORY) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Bugs can only implement/block Stories in Scrum',
      suggestion: `Link Bug → Story. Bug is always a child of Story, never Epic. Use Task to implement the fix (Task implements Bug).`,
    };
  }

  // Test → Epic or Story (flexible)
  if (sourceType === ITEM_TYPE.TEST) {
    if (targetType === ITEM_TYPE.EPIC || targetType === ITEM_TYPE.STORY) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tests can only implement Epics or Stories in Scrum',
      suggestion: `Use "tested-by" relationship or create Epic/Story first`,
    };
  }

  // Epic cannot implement anything (top-level)
  if (sourceType === ITEM_TYPE.EPIC) {
    return {
      valid: false,
      error: 'Epics are top-level items and cannot implement other items',
      suggestion: 'Consider using "relates-to" to link Epics together',
    };
  }

  return {
    valid: false,
    error: `Invalid Scrum relationship: ${sourceType} → ${targetType}`,
    suggestion: 'Check Scrum hierarchy: Epic → Story|Spike → Task',
  };
}

/**
 * Validate Waterfall hierarchy rules
 * Requirement → Feature|Spike → Task
 * Bug/Test can implement Requirement or Feature
 */
function validateWaterfallHierarchy(source: WorkItem, target: WorkItem): ValidationResult {
  const { type: sourceType } = source;
  const { type: targetType } = target;

  // Task → Feature, Spike, or Bug
  if (sourceType === ITEM_TYPE.TASK) {
    if (
      targetType === ITEM_TYPE.FEATURE ||
      targetType === ITEM_TYPE.SPIKE ||
      targetType === ITEM_TYPE.BUG
    ) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tasks can only implement Features, Spikes, or Bugs in Waterfall',
      suggestion: `Change ${target.id} to a Feature/Bug or create one first, then link Task → Feature/Bug`,
    };
  }

  // Feature → Requirement
  if (sourceType === ITEM_TYPE.FEATURE) {
    if (targetType === ITEM_TYPE.REQUIREMENT) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Features can only implement Requirements in Waterfall',
      suggestion: `Change ${target.id} to a Requirement or create a Requirement first, then link Feature → Requirement`,
    };
  }

  // Spike → Requirement
  if (sourceType === ITEM_TYPE.SPIKE) {
    if (targetType === ITEM_TYPE.REQUIREMENT) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Spikes can only implement Requirements in Waterfall',
      suggestion: `Change ${target.id} to a Requirement or create a Requirement first, then link Spike → Requirement`,
    };
  }

  // Bug → Feature only (Jira 2025)
  if (sourceType === ITEM_TYPE.BUG) {
    if (targetType === ITEM_TYPE.FEATURE) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Bugs can only implement/block Requirements or Features in Waterfall',
      suggestion: `Link Bug → Requirement (requirement-level defect) or Bug → Feature (feature-level defect). Use Task to implement the fix (Task implements Bug).`,
    };
  }

  // Test → Requirement or Feature (flexible)
  if (sourceType === ITEM_TYPE.TEST) {
    if (targetType === ITEM_TYPE.REQUIREMENT || targetType === ITEM_TYPE.FEATURE) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tests can only implement Requirements or Features in Waterfall',
      suggestion: `Use "tested-by" relationship or create Requirement/Feature first`,
    };
  }

  // Requirement cannot implement anything (top-level)
  if (sourceType === ITEM_TYPE.REQUIREMENT) {
    return {
      valid: false,
      error: 'Requirements are top-level items and cannot implement other items',
      suggestion: 'Consider using "relates-to" to link Requirements together',
    };
  }

  return {
    valid: false,
    error: `Invalid Waterfall relationship: ${sourceType} → ${targetType}`,
    suggestion: 'Check Waterfall hierarchy: Requirement → Feature|Spike → Task',
  };
}
/**
 * Validate that no conflicting relation types exist between the same source and target.
 *
 * Blocks:
 * - hierarchy + any other type to same target
 * - multiple hierarchy types to same target
 *
 * Allows:
 * - bidirectional symmetric flexible relations (e.g. relates-to)
 * - multiple flexible types to same target (e.g. depends-on + relates-to)
 *
 * @param targetId - The target item ID being linked
 * @param newRelationType - The new relation type being added
 * @param existingLinks - Current linked_items of the source item
 * @returns ValidationResult indicating conflict or success
 */
export function validateRelationConflict(
  targetId: string,
  newRelationType: string,
  existingLinks: LinkedItems
): ValidationResult {
  const newIsHierarchy = isHierarchyRelation(newRelationType);

  for (const [existingType, targetIds] of Object.entries(existingLinks)) {
    // Skip same type — duplicate check is handled separately
    if (existingType === newRelationType) continue;

    // Skip if target not in this relation list
    if (!Array.isArray(targetIds) || !targetIds.includes(targetId)) continue;

    const existingIsHierarchy = isHierarchyRelation(existingType);

    // Block: both hierarchy types to same target
    if (newIsHierarchy && existingIsHierarchy) {
      return {
        valid: false,
        error: `Cannot add "${newRelationType}" to ${targetId} — already has hierarchy relation "${existingType}" to same target`,
        suggestion: `Remove the existing "${existingType}" link first, or use a different target`,
      };
    }

    // Block: hierarchy mixed with any flexible type to same target
    if (newIsHierarchy || existingIsHierarchy) {
      const hierarchyType = newIsHierarchy ? newRelationType : existingType;
      const flexibleType = newIsHierarchy ? existingType : newRelationType;
      return {
        valid: false,
        error: `Cannot mix hierarchy relation "${hierarchyType}" with flexible relation "${flexibleType}" to same target ${targetId}`,
        suggestion: `Use only "${hierarchyType}" (hierarchy takes precedence) and remove "${flexibleType}", or use a different target`,
      };
    }

    // Multiple flexible types to same target: allowed
  }

  return { valid: true };
}
