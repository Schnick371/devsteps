# Update devsteps-plan-work.prompt.md

## Objective
Ensure ALL work items are created and committed to `main` branch BEFORE implementation starts.

## Current Problem
- No branch enforcement → work items can land in feature branches
- No verification that `main` is active during planning
- No check for uncommitted changes before planning

## Required Changes

### 1. Add Pre-Planning Branch Check (NEW Step 0)
```markdown
## Step 0: Branch Preparation (MANDATORY)

**Before planning work items:**

1. **Check current branch:**
   \`\`\`bash
   git branch --show-current
   \`\`\`
   - ❌ NOT on `main`? → Switch to main first
   - ✅ On `main`? → Proceed

2. **Check for uncommitted changes:**
   \`\`\`bash
   git status
   \`\`\`
   - ❌ Uncommitted changes? → Commit or stash them first
   - ✅ Clean working tree? → Proceed

3. **Verify other work in feature branches:**
   \`\`\`bash
   git branch --list 'story/*' 'bug/*' 'task/*'
   \`\`\`
   - Feature branches exist? → Ensure they're committed/pushed
   - Warn user if uncommitted work exists elsewhere

**Why this matters:**
- Work items are PROJECT METADATA → belong in `main`
- Feature branches are for CODE ONLY
- Prevents work items getting lost in feature branches
```

### 2. Update "When Complete" Section
```markdown
## Step 7: Commit Work Items to Main (MANDATORY)

**After all work items created and linked:**

1. **Verify still on main branch:**
   \`\`\`bash
   git branch --show-current  # Must be 'main'
   \`\`\`

2. **Stage devsteps changes:**
   \`\`\`bash
   git add .devsteps/
   \`\`\`

3. **Commit with planning message:**
   \`\`\`bash
   git commit -m "plan(<PRIMARY-ID>): <Brief description>
   
   Planning complete for <epic/story/bug>:
   
   Work Items Created:
   - <ID-1>: <title>
   - <ID-2>: <title>
   
   <Additional context if needed>
   
   Refs: <ID-1>, <ID-2>"
   \`\`\`

4. **Confirm completion:**
   - ✅ All work items in `main` branch
   - ✅ Ready for implementation via devsteps-start-work.prompt.md

**DO NOT:**
- ❌ Create feature branch during planning
- ❌ Leave work items uncommitted
- ❌ Switch branches before committing

**Next step:** Use `devsteps-start-work.prompt.md` to begin implementation.
```

### 3. Update Mission Statement
```markdown
## Mission

**Plan work through dialogue** - understand intent, search existing items, structure new work, establish traceability.

**CRITICAL:** This is conversation, not execution. Work items are created in `main` branch ONLY. Feature branches come later in devsteps-start-work.prompt.md.

**Branch Strategy:**
- Planning (this prompt): `main` branch for work items
- Implementation (start-work): Feature branches for code
```

## Success Criteria
- [ ] Step 0 checks branch before planning
- [ ] Step 7 commits work items to main
- [ ] Clear warnings if not on main
- [ ] Mission statement clarifies branch strategy
- [ ] "When Complete" links to start-work prompt

## Affected Files
- `.github/prompts/devsteps-plan-work.prompt.md`
