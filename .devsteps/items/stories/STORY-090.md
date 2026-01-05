## User Story

**As a** developer using DevSteps with AI agents  
**I want** ephemeral sprint tasks to be tracked separately from product backlog items  
**So that** my Git history stays clean and only business-relevant work is archived

## Background

Spike SPIKE-013 evaluated strategies for handling ephemeral tasks. Decision: **Extension approach** with `sprint/` directory.

## Acceptance Criteria

### Directory Structure
- [ ] New `sprint/` directory created alongside `items/`
- [ ] `sprint/` contains subdirectories: `tasks/`, `chores/`, `bugs/`
- [ ] `.devsteps/sprint/` added to default .gitignore template

### New Item Type: chore
- [ ] `chore` type added to shared schema
- [ ] Chores have simplified structure (no linked_items, no eisenhower)
- [ ] Chores auto-route to `sprint/chores/`

### Routing Logic
- [ ] Items with `type: chore` → `sprint/chores/`
- [ ] Bugs without product parent → `sprint/bugs/`
- [ ] All other items → `items/` (unchanged)

### Lifecycle
- [ ] Sprint items deleted (not archived) when `status: done`
- [ ] No archive entries for sprint items
- [ ] Sprint items not included in export/reports (optional flag)

### AI Agent Instructions
- [ ] Updated guidelines: chore vs task distinction
- [ ] Clear rule: "No Story parent? Consider chore instead of task"

## Technical Notes

```typescript
type SprintItemType = 'chore' | 'task' | 'bug';

function getItemPath(item: WorkItem): string {
  if (item.type === 'chore') {
    return '.devsteps/sprint/chores/';
  }
  if (item.type === 'bug' && !hasProductParent(item)) {
    return '.devsteps/sprint/bugs/';
  }
  return `.devsteps/items/${item.type}s/`;
}
```

## Out of Scope
- Team synchronization of sprint items
- Sprint planning/velocity tracking
- Burndown charts