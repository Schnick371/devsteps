# Add Branch Archiving Section to Git Workflow

## Objective
Add comprehensive branch archiving documentation to git-workflow.instructions.md.

## Implementation

**File:** `.github/prompts/git-workflow.instructions.md`

**Location:** Add new section after "Commit Message Format" section

**Content to add:**

```markdown
## Branch Cleanup After Work Item Completion

**When work item status changes to final state, archive branch before deletion:**

### Status: done (Successfully Merged)
Work completed, tested, and merged to main.

\`\`\`bash
# 1. Create archive tag
git tag archive/merged/<branch-name> <branch-name>
git push origin archive/merged/<branch-name>

# 2. Delete branch locally and remotely
git branch -D <branch-name>
git push origin --delete <branch-name>
\`\`\`

**Example:**
\`\`\`bash
git tag archive/merged/story/STORY-036 story/STORY-036
git push origin archive/merged/story/STORY-036
git branch -D story/STORY-036
git push origin --delete story/STORY-036
\`\`\`

### Status: cancelled (Work Abandoned)
Work aborted, not pursuing this approach.

\`\`\`bash
git tag archive/abandoned/<branch-name> <branch-name>
git push origin archive/abandoned/<branch-name>
git branch -D <branch-name>
git push origin --delete <branch-name>
\`\`\`

### Status: obsolete (Superseded by Newer Solution)
Work replaced by different/better approach.

\`\`\`bash
git tag archive/superseded/<branch-name> <branch-name>
git push origin archive/superseded/<branch-name>
git branch -D <branch-name>
git push origin --delete <branch-name>
\`\`\`

**Note:** Use `supersedes` relationship to link replacement item.

### Restore Archived Branch

If you need to revisit archived work:

\`\`\`bash
# List all archived branches
git tag -l "archive/*"
git tag -l "archive/merged/*"      # Only merged
git tag -l "archive/abandoned/*"   # Only abandoned

# Restore branch from tag
git checkout -b <branch-name> archive/<type>/<branch-name>

# Example:
git checkout -b story/STORY-036 archive/merged/story/STORY-036
\`\`\`

### Benefits of Tag-based Archiving

✅ **History Preserved:** Tag points to exact commit, never lost  
✅ **Clean Branch List:** `git branch` shows only active work  
✅ **Discoverable:** Tags visible on GitHub, searchable  
✅ **Restorable:** Can recreate branch anytime from tag  
✅ **Standard:** Uses Git best practices, no custom tools needed
```

## Validation
- [ ] Section appears in correct location
- [ ] Examples are executable
- [ ] Copilot understands status → tag mapping
- [ ] Instructions clear for manual use

## Notes
- Keep language simple and action-oriented
- Provide copy-pasteable commands
- Explain "why" for each status type