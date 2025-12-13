# Agent.md: Update Bug Workflow for relates-to + affects

## Task
Update Copilot agent instructions to reflect new flexible Bug relationship types.

## Changes Required

### 1. Update "Bug Workflow (MANDATORY)" Section
```markdown
**Bug Workflow (MANDATORY):**
1. Create Bug with problem description (what's broken, how to reproduce)
2. Bug uses "affects" (impact) to Epic/Requirement
3. Bug uses optional "relates-to" (context) to other Epic/Requirement then its own Epic
4. Create Task(s) for solution implementation (how to fix)
5. Task `implements` Bug (solution fixes the reported problem) *
6. **Implement solution in Task, NOT in Bug item!**
```

### 2. Update "Relationship Rules" Section
```markdown
**Bug → Epic/Requirement (Context):**
- ✅ Bug `relates-to` Epic/Requirement (general context - Bug is part of Epic scope)
- ✅ Bug `affects` Epic/Requirement (impact traceability - Bug impacts deliverables)
- ❌ Bug `implements` Epic/Requirement (semantically incorrect!)
```

### 3. Add Semantic Guidance
```markdown
**When to use:**
- **"relates-to"**: Bug is contextually part of Epic scope (e.g., "User Auth Bug" relates to "Auth Epic")
- **"affects"**: Bug impacts Epic deliverables (e.g., "Performance Bug" affects "Dashboard Epic performance")
```

## Acceptance Criteria
- [ ] Bug Workflow section updated with both relationship types
- [ ] Relationship Rules show ✅/❌ examples for both
- [ ] Semantic guidance explains when to use each type
- [ ] File remains under 150 lines (current optimization)