# Workflow Governance & Git Integration

## Vision
Enforce Scrum/Waterfall methodology best practices through automated validation, Git workflow integration, and improved relationship visibility.

## Business Value
- **Data Integrity:** Prevent invalid work item relationships
- **Traceability:** Git branches aligned with Epics for clear history
- **Quality:** Automated commit workflow ensures nothing forgotten
- **Visibility:** Show all relationships (parent-child + relates-to)

## Problem Statement
Currently DevCrumbs allows creating ANY relationship between ANY items without validation. This violates methodology principles:
- Scrum: Epic → Story → Task hierarchy not enforced
- Waterfall: Requirement → Feature → Task hierarchy not enforced
- Git: No branch strategy for Epics (commits scattered)
- Workflow: No guidance on when/how to commit after task completion
- UI: TreeView only shows parent-child, hides "relates-to" relationships

## Scope

### 1. Relationship Validation
Enforce methodology-specific constraints:

**Scrum Hierarchy (strict):**
- Epic → Story (implements)
- Story → Task (implements)
- Bug/Spike/Test → standalone or Story (implements)

**Waterfall Hierarchy (strict):**
- Requirement → Feature (implements)
- Feature → Task (implements)

**Flexible Relationships:**
- "relates-to" allowed between ANY item types
- "blocks", "depends-on", "tested-by" follow business logic

### 2. Git Workflow Integration
**Epic Branch Pattern:**
- Create `epic/<EPIC-ID>-<slug>` branch when Epic starts
- All child items (stories/tasks) commit to Epic branch
- Merge to main when Epic complete

**Commit Workflow:**
- Document mandatory commit after task completion
- Add to Copilot instructions
- Provide commit message templates

### 3. TreeView Enhancement
**Relationship Toggle:**
- Button to show/hide "relates-to" relationships
- Visual distinction: solid lines (parent-child), dotted lines (relates-to)
- Persist toggle state

## Child Items
1. SPIKE-003: Research Git branching strategies (validation)
2. TASK-038: Shared package - relationship validation logic
3. TASK-039: CLI - enforce validation
4. TASK-040: MCP - enforce validation  
5. TASK-041: Git workflow - Epic branch management
6. TASK-042: Copilot instructions - commit workflow
7. TASK-043: TreeView - relates-to toggle

## Success Criteria
- ✅ Invalid relationships rejected with helpful error messages
- ✅ Epic branch created automatically or with prompt
- ✅ Copilot instructions clear on commit workflow
- ✅ TreeView shows all relationships with toggle
- ✅ All validations documented with examples

## Technical Approach
**Validation Engine (Shared):**
```typescript
validateRelationship(
  source: WorkItem,
  target: WorkItem, 
  relationType: RelationType,
  methodology: 'scrum' | 'waterfall' | 'hybrid'
): ValidationResult
```

**Git Integration:**
- Use VS Code git extension API
- Document manual workflow in instructions
- Future: Consider automation hooks

**TreeView:**
- Extend getChildren() to include related items
- Add visual styling for relationship types
- Use StateManager for toggle persistence

## Dependencies
- Depends on TASK-037 (StateManager for toggle persistence)

## Risks & Mitigations
- **Risk:** Validation too strict → users frustrated
- **Mitigation:** Start with blocking validation, add override flag if needed
- **Risk:** Git automation breaks user's workflow  
- **Mitigation:** Document manual workflow, automation optional
- **Risk:** Existing invalid relationships break system
- **Mitigation:** Add migration/cleanup command

## Timeline Estimate
- SPIKE-003: 4-6 hours (research + documentation)
- Validation tasks: 8-12 hours total
- Git workflow: 4-6 hours
- TreeView toggle: 3-4 hours
- **Total:** 3-5 days

## Related Work
- EPIC-003: VS Code Extension (TreeView changes)
- TASK-037: State persistence (TreeView toggle storage)
