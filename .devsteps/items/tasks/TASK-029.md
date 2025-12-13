# Prepare Clean Git Repository

Prepare the repository for a clean initial commit to GitHub, following best practices.

## Objectives

1. **Backup current state** - Full backup before any destructive operations
2. **Extend .gitignore** - Exclude local artifacts and temporary files
3. **Clean working directory** - Remove untracked files that shouldn't be committed
4. **Reset Git history** - Create fresh repository with clean history
5. **Prepare branch structure** - Set up main branch properly

## Pre-Flight Checklist

### Backup
- [ ] Create full backup: `tar -czf devsteps-backup-$(date +%Y%m%d-%H%M%S).tar.gz .`
- [ ] Store backup outside repository directory
- [ ] Verify backup integrity

### .gitignore Updates
Current .gitignore is minimal. Add:

```gitignore
# Dependencies
node_modules/
package-lock.json  # Optional: Can be committed for reproducible builds

# Build outputs
dist/
build/
*.vsix  # VS Code extension packages

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/settings.json  # Keep config but not personal settings
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp

# Local documentation artifacts (NOT production docs)
docs/DATENSCHUTZ-*.txt
docs/PRIVACY-POLICY-*.md
docs/WEBSITE-CONTENT.md
docs/images/  # If these are just screenshots/local assets

# Test projects (example/demo projects)
test-project/
examples/*/node_modules/
```

### Decision Points

**What to KEEP (.devsteps/ tracked):**
- ✅ `.devsteps/` - Work items (show workflow usage)
- ✅ `packages/` - All source code
- ✅ `.github/` - Workflows, templates, instructions
- ✅ Root config files (package.json, tsconfig.json, biome.json)
- ✅ LICENSE.md, README.md
- ✅ `packages/mcp-server/README.md` (NEW - npm documentation)

**What to EXCLUDE (docs/ ignored):**
- ❌ `docs/DATENSCHUTZ-*.txt` - Local website artifacts
- ❌ `docs/PRIVACY-POLICY-DE.md` - Local website artifacts
- ❌ `docs/WEBSITE-CONTENT.md` - Local website artifacts
- ❌ `docs/images/` - Local screenshots
- ❌ `test-project/` - Test data
- ⚠️  `docs/TODO.md` - Keep or move to issues?
- ⚠️  `docs/SAFETY_AUDIT.md` - Keep or move to issues?

### Reset Git History

**Method: Orphan Branch (Clean Start)**

```bash
# 1. Ensure all valuable changes are backed up
git log --oneline  # Review current history

# 2. Create orphan branch (no history)
git checkout --orphan main-clean

# 3. Stage only production files
git add .gitignore
git add LICENSE.md README.md
git add package.json tsconfig.json biome.json
git add packages/
git add .github/
git add .devsteps/

# 4. Verify staged files
git status
git diff --cached --name-only

# 5. Create initial commit
git commit -m "chore: initial project setup"

# 6. Delete old branch, rename new one
git branch -D main
git branch -m main

# 7. Force push to GitHub (overwrites history)
git remote add origin https://github.com/Schnick371/devsteps.git
git push -f origin main
```

## Current Uncommitted Changes

```
Modified:
- .devsteps/index.json (TASK-028)
- package-lock.json
- packages/mcp-server/package.json (v0.4.1 metadata)

New files:
- docs/DATENSCHUTZ-MINIMAL-WEBSITE.txt (exclude)
- docs/DATENSCHUTZ-WEBSITE-TEXT.txt (exclude)
- docs/PRIVACY-POLICY-DE.md (exclude)
- docs/WEBSITE-CONTENT.md (exclude)
- docs/images/ (exclude)
- packages/mcp-server/README.md (INCLUDE!)
- .devsteps/tasks/TASK-028.* (INCLUDE!)
```

## Steps

1. **Update .gitignore** - Add comprehensive exclusions
2. **Clean untracked files** - `git clean -fdX` (dry-run first: `-n`)
3. **Create backup** - Full tar.gz backup
4. **Review staged files** - Ensure only production files
5. **Create orphan branch** - Fresh start
6. **Initial commit** - Clean, professional
7. **Verify before push** - Double-check with `git log`, `git status`

## Validation

- [ ] .gitignore includes all local artifacts
- [ ] Backup created and verified
- [ ] Only production-ready files staged
- [ ] Git history is clean (single initial commit)
- [ ] No sensitive data in repository
- [ ] All package READMEs present

## Links

- GitHub Best Practices: https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories
- Gitignore Guide: https://www.atlassian.com/git/tutorials/saving-changes/gitignore

## Priority

**CRITICAL** - Required before GitHub publication

## Eisenhower

**Q1 (Urgent-Important)** - Blocking npm package updates and GitHub visibility
