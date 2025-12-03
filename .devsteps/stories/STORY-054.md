## Problem

Jira uses `blocks/is blocked by` for **both hierarchy AND blocking dependencies**, but DevSteps treats it as flexible only.

## Jira 2025 Semantics

**blocks/is blocked by:**
- **Hierarchy purpose**: Bug is child of Epic (via Parent/Child link)
- **Blocking purpose**: Bug prevents Epic from progressing
- **Dual nature**: One link type serves both purposes in Jira

**In DevSteps context:**
- Bug `blocks` Epic = Bug is part of Epic scope AND prevents completion
- Story `blocks` Story = Sequencing dependency (not hierarchy)
- Task `blocks` Task = Technical blocker (not hierarchy)

## Solution Architecture

**Move to HIERARCHY_RELATIONSHIPS:**
```typescript
export const HIERARCHY_RELATIONSHIPS = [
  'implements', 'implemented-by',
  'blocks', 'blocked-by'  // NEW: Jira-style hierarchy + blocking
] as const;
```

**Update validation.ts:**
```typescript
// Bug → Epic/Story/Requirement/Feature via blocks
if (sourceType === 'bug' && relationType === 'blocks') {
  if (targetType === 'epic' || targetType === 'story' || 
      targetType === 'requirement' || targetType === 'feature') {
    return { valid: true };
  }
}

// Task/Story/Feature can still use blocks flexibly (bypass validation)
// via isFlexibleRelation() check already in place
```

**Key insight:** Same relation type, different validation rules based on source type!

## Acceptance Criteria

- [ ] `blocks/blocked-by` added to HIERARCHY_RELATIONSHIPS
- [ ] validation.ts updated for Bug→Epic/Story/Requirement/Feature via blocks
- [ ] Other types (Story→Story, Task→Task) still flexible (no validation)
- [ ] MCP tool descriptions updated
- [ ] CLI descriptions updated
- [ ] HIERARCHY-COMPACT.md reflects blocks as hierarchy for Bug
- [ ] AI-GUIDE-COMPACT.md explains dual nature
- [ ] Tests cover Bug blocks Epic validation
- [ ] Tests confirm Story blocks Story still works (flexible)