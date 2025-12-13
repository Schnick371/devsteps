# Strengthen Step 0: Branch Preparation - Add Detailed Verification

## Task
Restore detailed branch verification steps from git commit 0cdf6e4 with explicit ❌/✅ indicators.

## Changes Required

### Update "Step 0: Branch Preparation" Section

```markdown
### Step 0: Branch Preparation (MANDATORY)

**Before planning work items:**

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```
   - ❌ NOT on `main`? → Switch to main first
   - ✅ On `main`? → Proceed

2. **Check for uncommitted changes:**
   ```bash
   git status
   ```
   - ❌ Uncommitted changes? → Commit or stash them first
   - ✅ Clean working tree? → Proceed

3. **Verify other work in feature branches:**
   ```bash
   git branch --list 'story/*' 'bug/*' 'task/*'
   ```
   - Feature branches exist? → Ensure they're committed/pushed
   - Warn user if uncommitted work exists elsewhere

**Why this matters:**
- Work items are PROJECT METADATA → belong in `main`
- Feature branches are for CODE ONLY
- Prevents work items getting lost in feature branches
- Single source of truth for all team members
```

## Acceptance Criteria
- [ ] Detailed 3-step verification process added
- [ ] ❌/✅ indicators used for all decision points
- [ ] Bash commands included for each check
- [ ] "Why this matters" explanation restored
- [ ] Explicit consequences documented

## File
`.github/prompts/devsteps-plan-work.prompt.md` - Section "Step 0"

## Reference
Git commit 0cdf6e4 has the stronger version