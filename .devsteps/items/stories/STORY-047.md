# Story: Improve Copilot Hierarchy Guidance

## Problem
Copilot creates systematic hierarchy errors:
1. **Circular references**: `implements: [EPIC-003]` + `relates-to: [EPIC-003]` (redundant)
2. **Wrong Bug→Task relation**: Uses `relates-to` instead of `implemented-by`
3. **Missing documentation at init**: HIERARCHY.md + AI-GUIDE.md not deployed to new projects

## User Impact
- Polluted relationship data (circular refs confuse traceability)
- Inconsistent bug tracking (relates-to vs implemented-by)
- No guidance for new projects (Copilot guesses without docs)

## Acceptance Criteria
- [ ] Circular reference validation (prevent A→B + B→A in same relation type)
- [ ] Bug→Task uses `implemented-by` (enforced in prompts/agents)
- [ ] HIERARCHY.md deployed to `.devsteps/` on init
- [ ] AI-GUIDE.md deployed to `.devsteps/` on init
- [ ] Copilot agent/prompts updated with clear examples
- [ ] Validation errors guide Copilot to correct patterns

## Technical Approach
1. Add circular reference check to validation.ts
2. Update prompts/agents with Bug→Task `implemented-by` rule
3. Copy HIERARCHY.md + AI-GUIDE.md in init handlers (CLI + MCP)
4. Add examples to agent files showing correct patterns

## Success Metrics
- Zero circular references in new items
- Bug→Task always uses `implemented-by`
- New projects have docs immediately available