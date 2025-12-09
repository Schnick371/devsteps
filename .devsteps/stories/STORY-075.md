# Strengthen Planning Protocol Discipline in devsteps-plan-work.prompt.md

## Problem Statement
Current devsteps-plan-work.prompt.md is too weak - sections "Branch: Main Only" and "Structure Work" lack enforcement language. Planning Protocol steps read as suggestions rather than mandatory requirements.

**Impact:**
- Agents may skip branch verification
- Work items accidentally committed to feature branches
- Inconsistent hierarchy creation (weak guidance)
- Protocol steps treated as optional

## Solution
Restore stronger language from git commit 0cdf6e4 with explicit mandatory requirements:

### 1. **Planning Protocol → MANDATORY Protocol**
- Change "Planning Protocol" to "Planning Protocol (MANDATORY)"
- Add "CRITICAL:" prefix to key steps
- Include explicit "❌/✅" indicators for wrong/right states

### 2. **Strengthen "Branch: Main Only"**
- Add detailed pre-flight checks (git branch, git status, feature branch list)
- Include warning messages for wrong branch detection
- Explain WHY (metadata vs code separation)
- Add consequences of violating rule

### 3. **Strengthen "Structure Work"**
- Restore explicit hierarchy rules from 0cdf6e4:
  - Epic → Story → Task | Epic → Spike → Task
  - Story → Bug (blocks) → Task (fix)
  - Bug relates-to Epic/Requirement (context only)
- Add Spike planning guidance ("What did we learn?" → "What should we build?")
- Include dependency identification explicitly

## Scope
**In Scope:**
- Update devsteps-plan-work.prompt.md sections 0, 3, and header
- Restore stronger language from git history
- Add explicit mandatory indicators

**Out of Scope:**
- Changes to devsteps-start-work.prompt.md (separate Story if needed)
- Changes to devsteps-workflow.prompt.md (separate Story if needed)
- Automated enforcement (future: git hooks)

## Acceptance Criteria
- [ ] Planning Protocol renamed to "Planning Protocol (MANDATORY)"
- [ ] Section 0 includes detailed branch verification steps
- [ ] ❌/✅ indicators used for wrong/right states
- [ ] WHY explanations included for branch rules
- [ ] Section 3 has explicit hierarchy rules with examples
- [ ] Spike planning guidance restored
- [ ] Language is non-negotiable (not suggestive)

## Success Metrics
- Agents explicitly check branch before planning
- Clear error handling when on wrong branch
- Consistent hierarchy creation following rules
- No work items accidentally committed to feature branches

## Related Work
- EPIC-016: Workflow Branch Strategy (parent)
- STORY-062: Initial prompt updates (completed, now strengthening)
- TASK-157: Original devsteps-plan-work update (to be enhanced)