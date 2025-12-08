# Document Branch Lifecycle Management

## User Value
Provide clear guidance for branch cleanup using Git tags, integrated with DevSteps status workflow. Users know exactly when and how to archive branches.

## Acceptance Criteria
- [ ] Documentation in `.github/prompts/git-workflow.instructions.md` updated
- [ ] Status → Tag mapping clearly defined (done/cancelled/obsolete)
- [ ] Archive command examples for all 3 final states
- [ ] Branch restoration instructions included
- [ ] Copilot can execute workflow automatically

## Context
Current problem: Branches accumulate after work completion (story/STORY-036, story/STORY-062, story/STORY-063 already merged but still exist). Need standardized cleanup workflow.

## Git Tag-based Archiving Strategy

**Status → Tag Prefix Mapping:**
```
done       → archive/merged/       (successfully completed & merged)
cancelled  → archive/abandoned/    (work aborted)
obsolete   → archive/superseded/   (replaced by newer approach)
```

**Why Git Tags (not CLI command):**
- Standard Git workflow
- Copilot can execute via prompts
- Users can customize
- No new CLI features needed

## Workflow Integration

**Copilot reads work item status and executes:**

1. **Status = done:**
   ```bash
   git tag archive/merged/<branch> <branch>
   git push origin archive/merged/<branch>
   git branch -D <branch>
   git push origin --delete <branch>
   ```

2. **Status = cancelled:**
   ```bash
   git tag archive/abandoned/<branch> <branch>
   git push origin archive/abandoned/<branch>
   git branch -D <branch>
   git push origin --delete <branch>
   ```

3. **Status = obsolete:**
   ```bash
   git tag archive/superseded/<branch> <branch>
   git push origin archive/superseded/<branch>
   git branch -D <branch>
   git push origin --delete <branch>
   ```

**Branch Restoration:**
```bash
git checkout -b <branch> archive/<type>/<branch>
```

## Success Metrics
- Copilot automatically suggests archiving when status changes to final state
- Users understand tag-based archiving
- Old branches don't accumulate
- Archived branches easily discoverable via `git tag -l "archive/*"`