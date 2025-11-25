# Git Workflow: Epic Branch Management

## Problem
No standardized git branching strategy for Epics. Commits scattered across main branch without clear Epic association.

## Solution
Implement Epic branch pattern based on SPIKE-003 research findings.

## Implementation

### 1. Branch Naming Convention
```
epic/<EPIC-ID>-<slug>

Examples:
epic/EPIC-001-platform-launch
epic/EPIC-003-vscode-extension
epic/EPIC-005-workflow-governance
```

### 2. Branch Lifecycle

**Create Branch:**
- Trigger: Epic status changes to "in-progress"
- Options:
  - A) Manual: Document in instructions
  - B) Prompt: Ask user "Create epic branch?"
  - C) Auto: Create automatically

**Development:**
- All child items (stories/tasks) work on Epic branch
- Commit messages reference work items
- Regular pushes to keep remote updated

**Merge to Main:**
- Trigger: Epic status changes to "done"
- Process: PR/MR review → merge → delete branch

### 3. Copilot Instructions Update
**File:** `.github/instructions/git-workflow.instructions.md`

```markdown
# Git Workflow Standards

## Epic Branch Pattern

### When to Create Epic Branch
- Epic status → "in-progress"
- Branch name: `epic/<EPIC-ID>-<slug>`
- Example: `git checkout -b epic/EPIC-005-workflow-governance`

### Working on Epic
1. Checkout Epic branch: `git checkout epic/EPIC-XXX-name`
2. Implement child items (stories/tasks)
3. Commit after each task completion (see Commit Standards)
4. Push regularly: `git push origin epic/EPIC-XXX-name`

### Completing Epic
1. Ensure all child items status = "done"
2. Update Epic status to "done"
3. Create PR: `epic/EPIC-XXX-name` → `main`
4. Review and merge
5. Delete branch after merge

## Commit Standards
See: devsteps.instructions.md (TASK-042)
```

### 4. VS Code Integration (Optional)
**File:** `packages/vscode-extension/src/commands/index.ts`

Add command to create Epic branch:
```typescript
vscode.commands.registerCommand('devsteps.createEpicBranch', async (node) => {
  const item = node.item;
  if (item.type !== 'epic') {
    vscode.window.showErrorMessage('Only Epics can have branches');
    return;
  }
  
  const branchName = `epic/${item.id}-${slugify(item.title)}`;
  const create = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: `Create branch: ${branchName}?`
  });
  
  if (create === 'Yes') {
    const terminal = vscode.window.createTerminal('Git');
    terminal.sendText(`git checkout -b ${branchName}`);
    terminal.show();
  }
});
```

### 5. Decision Points (from SPIKE-003)
Based on research, recommend:
- ✅ **Manual branch creation** (documented in instructions)
- ⚠️ **Optional VS Code command** for convenience
- ❌ **No automatic creation** (too invasive)

Rationale:
- Gives developers control
- Works in all environments (CLI, VS Code, other IDEs)
- No risk of unwanted branches

## Documentation Structure

### .github/instructions/git-workflow.instructions.md
```markdown
# Git Workflow Standards

## Epic Branch Pattern
[As shown above]

## Commit Standards
[Link to TASK-042]

## Branch Protection Rules
- main: Require PR review
- epic/*: No direct commits after merge
```

### docs/architecture/git-strategy.md
```markdown
# Git Branching Strategy

## Architecture Decision
- Strategy: Epic-based feature branches
- Rationale: Traceability + Epic scope isolation
- Alternatives considered: [from SPIKE-003]

## Workflow Diagram
[Visual diagram]

## Examples
[Real scenarios]
```

## Success Criteria
- ✅ Instructions documented clearly
- ✅ VS Code command implemented (optional)
- ✅ Architecture doc with rationale
- ✅ Examples provided
- ✅ Tested with real Epic

## Dependencies
- Depends on: SPIKE-003 (research complete, decision made)
