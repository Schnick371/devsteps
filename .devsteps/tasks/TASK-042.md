# Copilot Instructions: Mandatory Commit After Task Completion

## Problem
No clear guidance in Copilot instructions on when/how to commit after completing work items.

## Solution
Document mandatory commit workflow in `.github/instructions/devsteps.instructions.md`.

## Implementation

### 1. Update devsteps.instructions.md
**Section: Status Tracking**

```markdown
## Status Tracking

**Before starting work:**
\`\`\`
#mcp_devsteps_update <ID> --status in-progress
\`\`\`

**After validation/testing:**
\`\`\`
#mcp_devsteps_update <ID> --status done
\`\`\`

**MANDATORY: Commit immediately after marking done:**
\`\`\`bash
git add .
git commit -m "feat(<ID>): <brief description>

<detailed context if needed>

Implements: <ID>"
\`\`\`

**NEVER skip commit** - Every completed work item MUST be committed for traceability.
```

### 2. Add Commit Message Standards
**New Section: Commit Standards**

```markdown
## Commit Message Standards

### Format
\`\`\`
<type>(<work-item-id>): <subject>

[optional body]

<footer>
\`\`\`

### Type
- **feat**: New feature (most common)
- **fix**: Bug fix
- **refactor**: Code restructuring
- **docs**: Documentation only
- **test**: Test changes
- **chore**: Build/config changes

### Examples

**Task completion:**
\`\`\`
feat(TASK-037): Add TreeView state persistence

Implemented StateManager using VS Code Memento API.
All view state now persists across sessions.

Implements: TASK-037
\`\`\`

**Bug fix:**
\`\`\`
fix(BUG-007): Preserve expanded state in flat view

Changed TreeGroupNode to use dynamic collapsibleState
instead of hardcoded Collapsed.

Fixes: BUG-007
Related: TASK-034
\`\`\`

**Multiple items:**
\`\`\`
feat(TASK-038,TASK-039): Add validation engine and CLI integration

- Implemented validateRelationship() in shared
- Integrated validation in CLI link command
- Added --force flag for overrides

Implements: TASK-038, TASK-039
\`\`\`

### Subject Guidelines
- Max 50 characters
- Imperative mood ("Add" not "Added")
- No period at end
- Concise but descriptive

### Body Guidelines
- Wrap at 72 characters
- Explain "what" and "why", not "how"
- Reference work items
- Max 15 lines (details in work item)

### Footer Guidelines
- \`Implements: <ID>\` - Primary work item
- \`Fixes: <ID>\` - For bug fixes
- \`Related: <ID>\` - Related work items
```

### 3. Update Workflow Section
**Section: Prohibited Practices**

```markdown
## Prohibited Practices

**Never:**
- Edit \`.devsteps/\` files manually (use CLI/MCP only)
- Skip status updates (in-progress/done tracking)
- **Skip commit after marking done (MANDATORY)**
- Proceed with failing tests or errors
- Batch multiple work items in one commit
- Create backup files: \`.old\`, \`.bak\`, \`_neu\` (use git!)
```

### 4. Add to copilot-instructions.md
**Quick reference at top:**

```markdown
## Critical Workflow Rules

1. **Status Tracking:** Update before starting, after completing
2. **Commit After Done:** MANDATORY - never skip
3. **Atomic Commits:** One work item per commit
4. **Validation:** Check errors, run tests before commit
5. **Never Edit .devsteps/:** Use tools only
```

### 5. MCP Response Integration
When MCP tools return after marking item done, include git hint:

```typescript
// In devsteps-update handler
if (args.status === 'done') {
  return {
    success: true,
    message: `✅ Updated ${args.id} to done`,
    git_hint: `NEXT: Commit immediately:\ngit commit -am "feat(${args.id}): <description>\n\nImplements: ${args.id}"`,
    reminder: 'Committing after task completion is MANDATORY'
  };
}
```

## Testing
- Review instructions for clarity
- Test with AI following instructions
- Verify commit messages follow format
- Check traceability in git history

## Success Criteria
- ✅ Clear commit standards documented
- ✅ Examples provided
- ✅ MCP tools remind about commits
- ✅ Instructions tested with AI
- ✅ Copilot follows workflow consistently

## Dependencies
- Depends on: TASK-041 (git workflow documented)
