# Add Branch Archiving to General Workflow Prompt

## Objective
Reference branch archiving in devsteps-workflow.prompt.md for general workflow understanding.

## Implementation

**File:** `.github/prompts/devsteps-workflow.prompt.md`

**Location:** Add to "After Implementation" section

**Content to add:**

```markdown
## Branch Cleanup (After Completion)

**When work item reaches final status:**

| Status | Branch Action | Tag Prefix |
|--------|---------------|------------|
| `done` | Archive & Delete | `archive/merged/` |
| `cancelled` | Archive & Delete | `archive/abandoned/` |
| `obsolete` | Archive & Delete | `archive/superseded/` |
| `blocked` | Keep (resolve blocker first) | - |

**Archive command sequence:**
\`\`\`bash
git tag archive/<type>/<branch-name> <branch-name>
git push origin archive/<type>/<branch-name>
git branch -D <branch-name>
git push origin --delete <branch-name>
\`\`\`

**Why:** Keeps branch list clean while preserving history via tags.

**Details:** See `git-workflow.instructions.md` for complete archiving workflow.
```

## Validation
- [ ] Section appears in logical location
- [ ] Table format clear and scannable
- [ ] Links to detailed documentation
- [ ] Copilot understands when to archive

## Notes
- Keep this high-level (details in git-workflow.instructions.md)
- Focus on "when" and "why", not "how"
- Table format for quick reference