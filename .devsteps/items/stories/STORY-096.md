# Story: Git Branch Hygiene Enforcement - Stale Branch Detection & Cleanup Automation

## User Value

**As a** DevSteps developer,  
**I want** automated detection and cleanup for stale feature branches,  
**so that** I maintain clean repository hygiene per documented Copilot standards.

## Context

The `devsteps-git-hygiene.instructions.md` defines strict branch lifecycle rules:
- Feature branches are ephemeral (temporary)
- Merge immediately after work item reaches `done` status
- **Remote**: Delete after merge (clean remote)
- **Local**: Rename to `archive/merged/<name>` (preserve history)
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
- [ ] Check both local and remote branches

### 2. Branch Age Reporting
- [ ] Group by severity:
  - 🚨 CRITICAL: Done items with unmerged branches
  - ⚠️ WARNING: In-progress branches >1 day old
  - ℹ️ INFO: Recent branches (<1 day)
- [ ] Show last commit date and time
- [ ] Display associated work item ID and status
- [ ] Separate local vs. remote branches

### 3. Interactive Cleanup Mode
- [ ] CLI: `devsteps branch-cleanup --interactive`
- [ ] Present stale branches one-by-one
- [ ] Options for each:
  - **Merge & Cleanup**: Merge to main, delete remote, archive locally
  - **Archive as Abandoned**: Rename local to `archive/abandoned/<name>`, delete remote
  - **Keep Active**: Mark as exception with reason
  - **Skip**: Review later

### 4. Automated Cleanup Workflow
- [ ] After successful merge:
  1. Delete remote branch: `git push origin --delete <branch>`
  2. Rename local branch: `git branch -m <branch> archive/merged/<branch>`
  3. Confirm cleanup in summary
- [ ] Handle errors gracefully:
  - Remote already deleted
  - Local rename conflicts
  - No remote tracking branch

### 5. Git Integration
- [ ] Check remote branches via `git branch -r`
- [ ] Verify branch is pushed before suggesting merge
- [ ] Warn about unpushed commits
- [ ] Prevent deletion of branches with unpushed work
- [ ] List archived branches: `git branch --list 'archive/*'`

### 6. Configuration
- [ ] `.devsteps/config.json` settings:
  ```json
  {
    "git": {
      "staleBranchThresholdHours": 24,
      "autoCleanupRemote": true,
      "archiveLocalBranches": true,
      "branchPatterns": ["story/*", "epic/*", "bug/*", "task/*"]
    }
  }
  ```

### 7. Pre-Status Check Integration
- [ ] `devsteps status` shows stale branch warnings
- [ ] Count displayed in health summary
- [ ] Link to `devsteps doctor --check-branches`
- [ ] Show archived branch count

### 8. Merge Protocol Enforcement
- [ ] Verify `--no-ff` flag used for merges
- [ ] Check commit message includes `Implements: <ID>`
- [ ] Validate .devsteps/ status synced to main
- [ ] Automatic cleanup prompt after successful merge

### 9. Git Alias Generation
- [ ] Generate recommended git aliases:
  ```gitconfig
  [alias]
      merge-done = "!f() { \
          git merge --no-ff $1 && \
          git branch -m $1 archive/merged/$1 && \
          git push origin --delete $1; \
      }; f"
      
      stale = "for-each-ref --sort=-committerdate refs/heads/ --no-merged main"
      archived = "branch --list 'archive/*'"
  ```
- [ ] Add to `.git/config` with user confirmation

## Definition of Done

- Feature implemented and tested
- CLI commands work correctly
- Remote delete + local archive workflow functional
- Configuration options documented
- Unit tests pass (branch detection logic)
- Integration tests added (git operations)
- No linting errors
- Documentation updated
- Committed with conventional format

## Technical Implementation

**Packages affected:**
- `packages/cli/src/commands/doctor.ts` - Branch checking
- `packages/cli/src/commands/branch-cleanup.ts` - Cleanup automation
- `packages/shared/src/git/branch-utils.ts` - Git operations
- `packages/shared/src/types/config.ts` - Configuration

**Branch Cleanup Logic:**
```typescript
async function cleanupBranch(branchName: string) {
  const git = simpleGit();
  
  // 1. Delete remote branch
  try {
    await git.push(['origin', '--delete', branchName]);
    console.log(`✓ Remote branch deleted: ${branchName}`);
  } catch (err) {
    console.warn(`Remote branch already deleted or doesn't exist`);
  }
  
  // 2. Rename local branch to archive
  const archiveName = `archive/merged/${branchName}`;
  await git.branch(['-m', branchName, archiveName]);
  console.log(`✓ Local branch archived: ${archiveName}`);
  
  return { remote: 'deleted', local: archiveName };
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