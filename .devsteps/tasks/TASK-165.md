# Update Start-Work Prompt with Branch Cleanup

## Objective
Add branch archiving step to devsteps-start-work.prompt.md completion workflow.

## Implementation

**File:** `.github/prompts/devsteps-start-work.prompt.md`

**Location:** Update "Complete" step (Step 6) in Execution Phase

**Current Text (Step 6 - Complete):**
```markdown
6. **Complete**: Update to done + **commit immediately** (never skip!)
```

**Updated Text:**
```markdown
6. **Complete**: Update to done + **commit immediately** + **archive branch**

**After marking done:**
\`\`\`bash
# Update status
devsteps update <ID> --status done

# Commit work item status change
git commit -am "chore(<ID>): Mark as done"

# Switch to main
git checkout main

# Archive feature branch (creates tag before deletion)
git tag archive/merged/<branch-name> <branch-name>
git push origin archive/merged/<branch-name>
git branch -D <branch-name>
git push origin --delete <branch-name>
\`\`\`

**For cancelled/obsolete work:**
- `cancelled` → Use `archive/abandoned/` prefix
- `obsolete` → Use `archive/superseded/` prefix

**Never skip:** Archiving keeps repository clean without losing history.
```

## Validation
- [ ] Archiving step integrated into completion workflow
- [ ] Examples show full command sequence
- [ ] Status → tag prefix mapping clear
- [ ] Copilot executes archiving after done status

## Notes
- Position after commit, before next work item
- Emphasize "never skip" for consistency
- Link to git-workflow.instructions.md for details