# Rename "Planning Protocol" to "Planning Protocol (MANDATORY)"

## Task
Update section header and add CRITICAL enforcement language throughout the Planning Protocol section.

## Changes Required

### 1. Update Header
```markdown
## Planning Protocol (MANDATORY)

**CRITICAL:** These steps are required - not optional. Skipping steps leads to inconsistent work items and lost traceability.
```

### 2. Add Enforcement Prefix to Each Step
- Step 0: "**MANDATORY:** Branch Preparation"
- Step 1: "Understand Context"  
- Step 2: "**MANDATORY:** Research First"
- Step 3: "**MANDATORY:** Structure Work"
- Step 4-7: Keep existing or add emphasis where needed

### 3. Add Consequences Section
```markdown
### Consequences of Skipping Steps
- ❌ Wrong branch → Work items lost in feature branches
- ❌ No research → Reinventing solved problems
- ❌ Wrong structure → Broken traceability
- ❌ No validation → Incomplete/ambiguous items
```

### 4. renumber the steps beginning with 1.

## Acceptance Criteria
- [ ] Header renamed to "Planning Protocol (MANDATORY)"
- [ ] CRITICAL note added under header
- [ ] MANDATORY prefix on steps 0, 2, 3
- [ ] Consequences section added at end
- [ ] Language is non-negotiable throughout

## File
`.github/prompts/devsteps-plan-work.prompt.md`