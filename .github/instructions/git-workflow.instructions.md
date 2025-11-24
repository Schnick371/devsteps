---
applyTo: "**"
description: "Git workflow standards for Epic-based development with DevCrumbs"
---

# Git Workflow Standards

## Overview

DevCrumbs uses an **Epic-based branching strategy** inspired by GitFlow, optimized for traceability and structured development.

**Key Principle:** One Epic = One Feature Branch = Clear History

## Epic Branch Pattern

### Branch Naming Convention

```
epic/<EPIC-ID>-<slug>

Examples:
- epic/EPIC-001-platform-launch
- epic/EPIC-003-vscode-extension  
- epic/EPIC-005-workflow-governance
```

**Slug Generation:**
- Lowercase
- Hyphen-separated
- Max 50 characters
- Descriptive of Epic scope

### When to Create Epic Branch

**Trigger:** Epic status changes to `in-progress`

**Command:**
```bash
git checkout -b epic/<EPIC-ID>-<slug>
git push -u origin epic/<EPIC-ID>-<slug>
```

**Decision: MANUAL branch creation**
- ✅ Developer control over timing
- ✅ Works in all environments (CLI, VS Code, other IDEs)
- ✅ No risk of unwanted branches
- ⚠️ Optional VS Code helper command available

**Rationale:**
- Research shows manual creation preferred by 80% of teams
- Automated creation can interfere with local workflows
- Gives developers time to prepare (stash changes, clean state)

## Development Workflow

### 1. Start Epic Work

```bash
# Update Epic status
devcrumbs update EPIC-XXX --status in-progress

# Create and checkout Epic branch
git checkout -b epic/EPIC-XXX-name
git push -u origin epic/EPIC-XXX-name
```

### 2. Implement Child Items

**All child items (Stories/Tasks) work on Epic branch:**

```bash
# Ensure on Epic branch
git checkout epic/EPIC-XXX-name

# Implement Story/Task
devcrumbs update STORY-YYY --status in-progress
# ... code changes ...

# Commit after completion (see Commit Standards below)
devcrumbs update STORY-YYY --status done
git add .
git commit -m "feat(STORY-YYY): Implement user authentication

Added login form with validation and session management.

Implements: STORY-YYY
Relates: EPIC-XXX"

# Push regularly
git push origin epic/EPIC-XXX-name
```

### 3. Complete Epic

**Before merging:**
- ✅ All child items status = `done`
- ✅ All tests passing
- ✅ Build successful
- ✅ Documentation updated

**Merge process:**
```bash
# Update Epic status
devcrumbs update EPIC-XXX --status done

# Create Pull Request
gh pr create \
  --base main \
  --head epic/EPIC-XXX-name \
  --title "EPIC-XXX: Epic Title" \
  --body "Implements: EPIC-XXX"

# After review and merge
git checkout main
git pull
git branch -d epic/EPIC-XXX-name
git push origin --delete epic/EPIC-XXX-name
```

## Commit Standards

### Format (Conventional Commits)

```
<type>(<work-item-id>): <subject>

[optional body]

<footer>
```

### Commit Types

- **feat**: New feature (most common)
- **fix**: Bug fix
- **refactor**: Code restructuring without behavior change
- **docs**: Documentation only
- **test**: Test changes
- **perf**: Performance improvement
- **chore**: Build/config/tooling changes

### Subject Guidelines

- **Max 50 characters**
- **Imperative mood:** "Add" not "Added"
- **No period at end**
- **Concise but descriptive**

### Body Guidelines (Optional)

- Wrap at 72 characters
- Explain **what** and **why**, not **how**
- Reference related work items
- Max 15 lines (details already in work item description)

### Footer (Required)

```
Implements: <PRIMARY-ID>
Fixes: <BUG-ID>          # For bug fixes only
Relates: <RELATED-IDS>   # Optional
```

### Examples

**Feature Implementation:**
```
feat(TASK-037): Add TreeView state persistence

Implemented StateManager using VS Code Memento API.
All view state now persists across sessions.

Implements: TASK-037
Relates: EPIC-003
```

**Bug Fix:**
```
fix(BUG-007): Preserve expanded state in flat view

Changed TreeGroupNode to use dynamic collapsibleState
instead of hardcoded Collapsed value.

Fixes: BUG-007
Relates: TASK-034, TASK-037
```

**Multiple Items:**
```
feat(TASK-038,TASK-039): Add validation and CLI integration

- Implemented validateRelationship() in shared package
- Integrated validation in CLI link command
- Added --force flag for override scenarios

Implements: TASK-038, TASK-039
Relates: EPIC-005
```

## Branch Protection Rules

### main Branch

- ✅ Require pull request review
- ✅ Require status checks to pass
- ✅ Require up-to-date before merge
- ✅ Delete branch after merge
- ❌ No direct commits

### epic/* Branches

- ✅ Allow direct commits (for development)
- ✅ Require CI checks to pass
- ⚠️ Protected after PR created
- ✅ Delete after successful merge

## Alternative Strategies Considered

### GitFlow (Classic)
- **Pros:** Well-established, clear separation
- **Cons:** Complex (develop/release branches), overkill for DevCrumbs
- **Verdict:** Too heavyweight for our needs

### GitHub Flow
- **Pros:** Simple, fast iteration
- **Cons:** No Epic grouping, scattered commits
- **Verdict:** Loses traceability for large features

### Trunk-Based Development
- **Pros:** Continuous integration
- **Cons:** Requires feature flags, complex for Epics
- **Verdict:** Better for mature codebases with high CI maturity

### Our Approach: Epic-Based GitFlow
- **Pros:** Epic traceability + GitFlow simplicity + GitHub Flow speed
- **Cons:** Slightly more branches than GitHub Flow
- **Verdict:** ✅ Best fit for structured DevCrumbs workflow

## CI/CD Integration

### Epic Branch Pipeline

```yaml
# .github/workflows/epic-branch.yml
on:
  push:
    branches:
      - epic/**
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
      - run: npm run build
```

### Merge Requirements

- All tests pass
- Build succeeds
- Code coverage maintained
- No merge conflicts

## Edge Cases

### Abandoned Epic
```bash
# Mark Epic as cancelled
devcrumbs update EPIC-XXX --status cancelled

# Optional: Keep branch for reference or delete
git branch -D epic/EPIC-XXX-name
```

### Epic Scope Change
```bash
# Create new branch from current state
git checkout -b epic/EPIC-YYY-new-scope
git push -u origin epic/EPIC-YYY-new-scope

# Link old Epic as superseded
devcrumbs link EPIC-YYY supersedes EPIC-XXX
```

### Hotfix Required
```bash
# Create hotfix branch from main (not Epic branch)
git checkout main
git checkout -b hotfix/BUG-XXX-description

# After fix
git checkout main
git merge hotfix/BUG-XXX-description
git branch -d hotfix/BUG-XXX-description

# Cherry-pick to Epic branch if needed
git checkout epic/EPIC-YYY-name
git cherry-pick <commit-sha>
```

## Best Practices

### DO:
- ✅ Create Epic branch when starting work
- ✅ Commit after each completed task
- ✅ Push regularly (at least daily)
- ✅ Write descriptive commit messages
- ✅ Reference work items in commits
- ✅ Keep Epic branches focused and short-lived
- ✅ Delete branches after merge

### DON'T:
- ❌ Work directly on main
- ❌ Batch multiple tasks in one commit
- ❌ Skip commit message standards
- ❌ Leave Epic branches unmerged for weeks
- ❌ Create backup branches (.old, _backup)
- ❌ Force push to shared Epic branches

## VS Code Integration (Optional)

### Create Epic Branch Command

Available via Command Palette: `DevCrumbs: Create Epic Branch`

**Features:**
- Auto-generates branch name from Epic ID + title
- Switches to new branch automatically
- Creates remote tracking branch
- Updates Epic status to in-progress

**Manual Alternative:**
```bash
# Always works, no VS Code needed
git checkout -b epic/EPIC-XXX-$(echo "Title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
```

## Troubleshooting

### "Branch already exists"
```bash
# Switch to existing branch
git checkout epic/EPIC-XXX-name

# Or delete and recreate (if safe)
git branch -D epic/EPIC-XXX-name
git checkout -b epic/EPIC-XXX-name
```

### "Merge conflicts"
```bash
# Update Epic branch from main
git checkout epic/EPIC-XXX-name
git merge main
# Resolve conflicts
git add .
git commit -m "chore: Merge main into epic branch"
```

### "Lost commits"
```bash
# Find lost commits
git reflog

# Restore from reflog
git cherry-pick <commit-sha>
```

## Summary

**Epic-based branching provides:**
- 🎯 Clear traceability (Epic → Branch → Commits)
- 📦 Scope isolation (Epic changes don't affect main)
- 🔄 Safe collaboration (multiple developers per Epic)
- 📊 Clean history (merge commits group Epic work)
- ✅ Quality gates (PR review before main)

**Result:** Structured development with full traceability from commit to Epic to business goal.
