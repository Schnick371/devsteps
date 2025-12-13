# Add Story Branch Workflow to Start-Work Prompt

## Objective
Insert Step 0 before existing Step 1 to enforce clean state and story branching.

## New Step 0: Prepare

```markdown
## Step 0: Prepare

**Check working tree:**
- Uncommitted changes? Commit or stash before proceeding
- Another story in-progress? ⚠️ Warning: Multiple story branches allowed

**Create story branch (for Story/Spike only):**
\\`\\`\\`
git checkout -b story/<STORY-ID>
\\`\\`\\`

**Branch rules:**
- Story/Spike → New branch: `story/<ID>`
- Task → Use parent story branch OR main
- Bug → Use related story branch OR main

**Skip if:** Task implements current in-progress story on same branch
```

## Integration Points
- Before existing "Step 1: Review"
- Reference in agent "Git Workflow" section
- Warn, don't block - trust developer choice

## Key Principle
Strict separation via branches. DevSteps tracks open stories → no forgotten branches.