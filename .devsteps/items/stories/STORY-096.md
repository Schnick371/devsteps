# Story: Git Branch Hygiene Enforcement - Stale Branch Detection & Cleanup Prompts

## User Value

**As a** DevSteps developer,  
**I want** automated detection and warnings for stale feature branches,  
**so that** I maintain clean repository hygiene per documented Copilot standards.

## Context

The new `devsteps-git-hygiene.instructions.md` defines strict branch lifecycle rules:
- Feature branches are ephemeral (temporary)
- Merge immediately after work item reaches `done` status
- Delete branch after successful merge
- **Red Flag**: Branch older than 1 day without merge indicates workflow failure

## Acceptance Criteria

### 1. Stale Branch Detection
- [ ] CLI command: `devsteps doctor --check-branches`
- [ ] Detect feature branches (`story/*`, `epic/*`, `bug/*`, `task/*`)
- [ ] Flag branches older than configurable threshold (default: 1 day)
- [ ] Cross-reference with DevSteps item status:
  - Item `done` but branch not merged → **CRITICAL**
  - Item `in-progress` with old branch → **WARNING**
  - Item `draft` with branch → **ERROR** (branch shouldn't exist yet)

### 2. Branch Age Reporting
- [ ] Group by severity:
  - 🚨 CRITICAL: Done items with unmerged branches
  - ⚠️ WARNING: In-progress branches >1 day old
  - ℹ️ INFO: Recent branches (<1 day)
- [ ] Show last commit date and time
- [ ] Display associated work item ID and status

### 3. Interactive Cleanup Mode
- [ ] CLI: `devsteps branch-cleanup --interactive`
- [ ] Present stale branches one-by-one
- [ ] Options for each:
  - Merge to main (if tests pass)
  - Delete branch (if abandoned)
  - Keep (mark as exception with reason)
  - Skip (review later)

### 4. Git Integration
- [ ] Check remote branches (not just local)
- [ ] Verify branch is pushed before suggesting merge
- [ ] Warn about unpushed commits
- [ ] Prevent deletion of branches with unpushed work

### 5. Configuration
- [ ] `.devsteps/config.json` settings:
  ```json
  {
    "git": {
      "staleBranchThresholdHours": 24,
      "autoCleanupEnabled": false,
      "branchPatterns": ["story/*", "epic/*", "bug/*", "task/*"]
    }
  }
  ```

### 6. Pre-Status Check Integration
- [ ] `devsteps status` shows stale branch warnings
- [ ] Count displayed in health summary
- [ ] Link to `devsteps doctor --check-branches`

### 7. Merge Protocol Enforcement
- [ ] Verify `--no-ff` flag used for merges
- [ ] Check commit message includes `Implements: <ID>`
- [ ] Validate .devsteps/ status synced to main
- [ ] Prompt for branch deletion after successful merge

## Definition of Done

- Feature implemented and tested
- CLI commands work correctly
- Configuration options functional
- Unit tests pass (branch detection logic)
- Integration tests added (git operations)
- No linting errors
- Documentation updated
- Committed with conventional format

## Technical Implementation

**Packages affected:**
- `packages/cli/src/commands/doctor.ts` - Add branch checking
- `packages/cli/src/commands/branch-cleanup.ts` - New command
- `packages/shared/src/git/branch-utils.ts` - Git operations
- `packages/shared/src/types/config.ts` - Configuration

**Git Integration:**
```typescript
import { simpleGit } from 'simple-git';

async function detectStaleBranches(thresholdHours: number) {
  const git = simpleGit();
  const branches = await git.branch(['-a']); // All branches
  const cutoff = Date.now() - (thresholdHours * 60 * 60 * 1000);
  
  return branches.all
    .filter(b => /^(story|epic|bug|task)\//.test(b))
    .map(async branch => {
      const log = await git.log(['-1', branch]);
      const lastCommit = new Date(log.latest.date);
      return {
        branch,
        age: Date.now() - lastCommit.getTime(),
        isStale: lastCommit.getTime() < cutoff
      };
    });
}
```

## Dependencies

- Existing git integration
- DevSteps item status tracking

## Reference

Source: `.github/instructions/devsteps-git-hygiene.instructions.md`

## Estimated Effort

**Complexity:** Medium-High (git operations + DevSteps integration)
**Timeline:** 4-5 days
**Risk:** Medium (git operations can be complex)