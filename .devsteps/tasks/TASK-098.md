# Update Copilot Guidance - Bug→Task implemented-by

## Objective
Copilot should use `implemented-by` for Bug→Task, NOT `relates-to`.

## Current Problem
```json
BUG-027 {
  "relates-to": ["TASK-002", "TASK-003"]  // ❌ WRONG!
}
```

## Correct Pattern
```json
BUG-027 {
  "implemented-by": ["TASK-002", "TASK-003"]  // ✅ CORRECT!
}
```

## Files to Update

### 1. devsteps.agent.md
**Location**: `.github/agents/devsteps.agent.md`

Add section after "Item Hierarchy":
```markdown
## Relationship Patterns

**Bug Fixes:**
- Bug → Epic (implements) - Epic-level systemic bugs
- Bug → Story (implements) - Feature-specific bugs  
- Bug → Task (implemented-by) - Fix is executed by tasks

**Example:**
\`\`\`
BUG-027: FileSystemWatcher not created
- implements: EPIC-003 (VS Code Extension)
- implemented-by: TASK-097, TASK-098
\`\`\`

**NEVER use relates-to for Bug→Task!** Use implemented-by instead.
```

### 2. devsteps-plan-work.prompt.md
**Location**: `.github/prompts/devsteps-plan-work.prompt.md`

Update Step 3 section:
```markdown
### Step 3: Structure Work

**Bug Planning:**
- Bug → Epic OR Story (implements) - Where bug is found
- Bug → Tasks (implemented-by) - How bug is fixed
- NEVER Bug → Task (relates-to) - Use implemented-by!
```

### 3. devsteps-workflow.prompt.md
Add to relationship guidance section.

## Acceptance Criteria
- [ ] All agent/prompt files updated with Bug→Task pattern
- [ ] Clear "NEVER relates-to" warning included
- [ ] Examples show correct usage
- [ ] Files redeployed to CLI/MCP packages

## Affected Files
- `.github/agents/devsteps.agent.md`
- `.github/prompts/devsteps-plan-work.prompt.md`
- `.github/prompts/devsteps-workflow.prompt.md`
- `packages/cli/.github/agents/devsteps.agent.md` (copy)
- `packages/mcp-server/.github/agents/devsteps.agent.md` (copy)