# Update devsteps-workflow.prompt.md

## Objective
Ensure intermediate commits stay in feature branch, verify branch before committing.

## Current Problem
- No branch verification before important commits
- Unclear when to commit during work
- No guidance on staying in feature branch

## Required Changes

### 1. Add Branch Verification Section
```markdown
## Branch Awareness (CRITICAL)

**Before ANY git operation:**

### Check Current Branch
\`\`\`bash
git branch --show-current
\`\`\`

**Expected branches during implementation:**
- ✅ `story/<ID>` - Story/Epic implementation
- ✅ `bug/<ID>` - Bug fix
- ✅ `task/<ID>` - Standalone task
- ❌ `main` - WRONG! Should be in feature branch

**If on main:**
1. STOP immediately
2. Check if you started work correctly (devsteps-start-work.prompt.md Step 0)
3. Create/checkout correct feature branch
4. Continue work

**Why this matters:**
- Feature code belongs in feature branches
- Main branch is for work items and final merges only
- Wrong branch = wrong place in history
```

### 2. Update "Before Committing" Section
```markdown
## Before Committing (Important Changes Only)

**When to commit:**
- ✅ Milestone reached (feature working, tests passing)
- ✅ Logical checkpoint (refactoring complete, API stable)
- ✅ Before switching tasks
- ❌ NOT after every small edit
- ❌ NOT for work-in-progress experiments

**Pre-Commit Checklist:**

1. **Verify branch:**
   \`\`\`bash
   git branch --show-current  # Must be feature branch!
   \`\`\`

2. **Check for errors:**
   - Use `problems` tool
   - No TypeScript/lint errors
   - Build succeeds

3. **Review changes:**
   \`\`\`bash
   git diff
   \`\`\`
   - Changes focused and minimal
   - No debug code or commented blocks
   - No unrelated modifications

4. **Commit to FEATURE BRANCH:**
   \`\`\`bash
   git add <files>
   git commit -m "type(<ID>): description
   
   <Optional context>
   
   Relates-to: <ID>"
   \`\`\`

**CRITICAL:**
- All commits during work go to feature branch
- DO NOT switch to main until work complete
- DO NOT merge to main during implementation
```

### 3. Update "During Implementation" Guidance
```markdown
## During Implementation

**Stay in feature branch:**
- All edits, tests, builds happen in feature branch
- Commit important checkpoints (not every edit)
- Push to remote regularly: `git push origin <branch-name>`

**Branch discipline:**
- ❌ DO NOT switch to main mid-work
- ❌ DO NOT commit work items (they're already in main)
- ❌ DO NOT merge to main until work complete
- ✅ Stay in feature branch entire time
- ✅ Commit code checkpoints as needed
- ✅ Update work item status (synced to main later)

**If you need to pause:**
\`\`\`bash
git add .
git commit -m "wip(<ID>): checkpoint before pause"
git push origin <branch-name>
\`\`\`

**If you need to switch work items:**
1. Commit current work to feature branch
2. Use devsteps-start-work.prompt.md to start new item
3. New feature branch for new item
```

### 4. Add "Completion Workflow" Section
```markdown
## Completion Workflow

**When work item is DONE:**

1. **Final commit to feature branch:**
   \`\`\`bash
   git add .
   git commit -m "feat(<ID>): Complete <feature>
   
   <Summary of implementation>
   
   Implements: <ID>"
   \`\`\`

2. **Push feature branch:**
   \`\`\`bash
   git push origin <branch-name>
   \`\`\`

3. **Update work item status:**
   \`\`\`
   #mcp_devsteps_update <ID> --status done
   \`\`\`

4. **DO NOT merge to main yet:**
   - Test implementation first
   - Get user approval if needed
   - Squash merge happens later (manual or via PR)

**Work item status:**
- Status change stored in `.devsteps/` in feature branch
- Will be synced to main during final merge
- Temporary divergence is expected
```

## Success Criteria
- [ ] Branch verification before commits
- [ ] Clear guidance on when to commit
- [ ] Feature branch discipline enforced
- [ ] Completion workflow documented
- [ ] No confusion about main vs feature branch

## Affected Files
- `.github/prompts/devsteps-workflow.prompt.md`
