import type { ItemType, Methodology } from '../schemas/index.js';
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

  // Only validate "implements" direction (implemented-by is automatic reverse)
  if (relationType === 'implemented-by') {
    return { valid: true }; // Reverse relationships auto-created, no validation needed
  }

  // Validate based on methodology
  if (methodology === 'scrum') {
    return validateScrumHierarchy(source, target);
  }

  if (methodology === 'waterfall') {
    return validateWaterfallHierarchy(source, target);
  }

  if (methodology === 'hybrid') {
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
  if (sourceType === 'task') {
    if (targetType === 'story' || targetType === 'spike' || targetType === 'bug') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tasks can only implement Stories, Spikes, or Bugs in Scrum',
      suggestion: `Change ${target.id} to a Story/Bug or create one first, then link Task → Story/Bug`,
    };
  }

  // Story → Epic
  if (sourceType === 'story') {
    if (targetType === 'epic') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Stories can only implement Epics in Scrum',
      suggestion: `Change ${target.id} to an Epic or create an Epic first, then link Story → Epic`,
    };
  }

  // Spike → Epic
  if (sourceType === 'spike') {
    if (targetType === 'epic') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Spikes can only implement Epics in Scrum',
      suggestion: `Change ${target.id} to an Epic or create an Epic first, then link Spike → Epic`,
    };
  }

  // Bug cannot use "implements" - must use flexible relationships
  if (sourceType === 'bug') {
    return {
      valid: false,
      error: 'Bugs cannot use "implements" relationship',
      suggestion: `Use "relates-to" (context) or "affects" (impact) to link Bug → Epic. Use Task to implement the fix (Task implements Bug).`,
    };
  }

  // Test → Epic or Story (flexible)
  if (sourceType === 'test') {
    if (targetType === 'epic' || targetType === 'story') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tests can only implement Epics or Stories in Scrum',
      suggestion: `Use "tested-by" relationship or create Epic/Story first`,
    };
  }

  // Epic cannot implement anything (top-level)
  if (sourceType === 'epic') {
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
  if (sourceType === 'task') {
    if (targetType === 'feature' || targetType === 'spike' || targetType === 'bug') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tasks can only implement Features, Spikes, or Bugs in Waterfall',
      suggestion: `Change ${target.id} to a Feature/Bug or create one first, then link Task → Feature/Bug`,
    };
  }

  // Feature → Requirement
  if (sourceType === 'feature') {
    if (targetType === 'requirement') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Features can only implement Requirements in Waterfall',
      suggestion: `Change ${target.id} to a Requirement or create a Requirement first, then link Feature → Requirement`,
    };
  }

  // Spike → Requirement
  if (sourceType === 'spike') {
    if (targetType === 'requirement') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Spikes can only implement Requirements in Waterfall',
      suggestion: `Change ${target.id} to a Requirement or create a Requirement first, then link Spike → Requirement`,
    };
  }

  // Bug cannot use "implements" - must use flexible relationships
  if (sourceType === 'bug') {
    return {
      valid: false,
      error: 'Bugs cannot use "implements" relationship',
      suggestion: `Use "relates-to" (context) or "affects" (impact) to link Bug → Requirement. Use Task to implement the fix (Task implements Bug).`,
    };
  }

  // Test → Requirement or Feature (flexible)
  if (sourceType === 'test') {
    if (targetType === 'requirement' || targetType === 'feature') {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Tests can only implement Requirements or Features in Waterfall',
      suggestion: `Use "tested-by" relationship or create Requirement/Feature first`,
    };
  }

  // Requirement cannot implement anything (top-level)
  if (sourceType === 'requirement') {
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
