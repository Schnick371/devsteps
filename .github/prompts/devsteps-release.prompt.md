---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Execute production release workflow - version bump, CHANGELOG, build, npm publish, and git tagging'
tools: ['edit', 'search', 'runCommands', 'runTasks', 'devsteps/*', 'GitKraken/*', 'tavily/*', 'usages', 'problems', 'changes', 'fetch', 'todos', 'runSubagent']
---

# 🚀 Release Workflow - Production Deployment

## Mission

**Execute production release** - systematic version bump, CHANGELOG updates, build validation, npm publishing, and git tagging with squash merge to main.

## ⚠️ Critical Rules

**NEVER develop on main branch!**
- ✅ All development on `dev/X.Y.Z` branch
- ✅ Squash merge to main after validation
- ✅ Tag after merge (not before)
- ❌ No direct commits to main

**Branch Protection:**
- main = production-ready only
- dev/X.Y.Z = development + testing + cherry-picks
- Squash preserves clean history

## Step 1: Prepare Development Branch

**Create dev branch from main:**
```bash
git checkout main
git pull origin main
git checkout -b dev/X.Y.Z
```

**Cherry-pick commits from story branches:**
```bash
# List commits from story branch
git log --oneline story/STORY-053

# Cherry-pick range
git cherry-pick <commit1>..<commitN>

# Or cherry-pick individual commits
git cherry-pick <commit-hash>
```

**Verify clean state:**
```bash
git status
npm run build
npm test
```

## Step 2: Version Bump

**Update all package.json versions:**
```
packages/shared/package.json      → X.Y.Z
packages/cli/package.json         → X.Y.Z
packages/mcp-server/package.json  → X.Y.Z
packages/extension/package.json   → X.Y.Z
```

**Commit version bump:**
```bash
git add packages/*/package.json
git commit -m "chore: Bump version to X.Y.Z"
```

## Step 3: Update CHANGELOGs

**Format (Keep a Changelog):**
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Modifications to existing features

### Deprecated
- Features marked for removal

### Removed
- Deleted features

### Fixed
- Bug fixes

### Security
- Security updates

### Breaking Changes ⚠️
- Changes requiring user action
```

**Update files:**
```
packages/shared/CHANGELOG.md
packages/cli/CHANGELOG.md
packages/mcp-server/CHANGELOG.md
packages/extension/CHANGELOG.md
```

**Commit CHANGELOGs:**
```bash
git add packages/*/CHANGELOG.md
git commit -m "docs: Update CHANGELOGs for X.Y.Z release"
```

## Step 4: Build Validation

**Full build test:**
```bash
npm run clean
npm install
npm run build
npm test
```

**Package validation:**
```bash
cd packages/extension
npm run package
```

**Verify outputs:**
- ✅ All TypeScript compiled
- ✅ No errors in dist/
- ✅ VSIX created successfully
- ✅ Tests passing

## Step 5: npm Publishing

**CRITICAL: Publish in dependency order!**

### 5.1 Shared Package
```bash
cd packages/shared
npm publish --access public
```

### 5.2 CLI Package
```bash
cd packages/cli
npm publish --access public
```

### 5.3 MCP Server
```bash
cd packages/mcp-server
npm publish --access public
```

**Verify on npm:**
```bash
npm view @schnick371/devsteps-shared version
npm view @schnick371/devsteps-cli version
npm view @schnick371/devsteps-mcp-server version
```

## Step 6: Extension Package

**Create VSIX:**
```bash
cd packages/extension
vsce package
```

**Output:** `devsteps-X.Y.Z.vsix`

**⏸️ Manual Upload Required:**
- VS Code Marketplace: https://marketplace.visualstudio.com/manage
- Upload VSIX file
- Publish after review

## Step 7: Squash Merge to Main

**Push dev branch:**
```bash
git push origin dev/X.Y.Z
```

**Create squashed commit on main:**
```bash
git checkout main
git merge --squash dev/X.Y.Z

# Create comprehensive commit message
git commit -m "release: Version X.Y.Z

Major changes:
- Feature 1 (STORY-XXX)
- Feature 2 (EPIC-YYY)
- Bug fix (BUG-ZZZ)

Breaking Changes:
- [List breaking changes]

Full traceability in dev/X.Y.Z branch commits.

Refs: EPIC-XXX, STORY-YYY"
```

**Push to main:**
```bash
git push origin main
```

## Step 8: Git Tagging

**Create annotated tag:**
```bash
git tag -a vX.Y.Z -m "Release X.Y.Z

Key Changes:
- Feature summary
- Breaking changes
- Bug fixes

Full CHANGELOG: packages/*/CHANGELOG.md"

git push origin vX.Y.Z
```

**Verify tag:**
```bash
git tag -l -n9 vX.Y.Z
```

## Step 9: Cleanup

**Delete dev branch (optional):**
```bash
git branch -d dev/X.Y.Z
git push origin --delete dev/X.Y.Z
```

**Or keep for reference:**
- Preserves detailed commit history
- Useful for bisecting issues
- Can be archived later

## Post-Release Verification

**Test installations:**
```bash
# Global CLI
npm install -g @schnick371/devsteps-cli@X.Y.Z
devsteps --version

# Global MCP
npm install -g @schnick371/devsteps-mcp-server@X.Y.Z
devsteps-mcp --version

# VS Code Extension
code --install-extension devsteps-X.Y.Z.vsix
```

**Check npm pages:**
- https://www.npmjs.com/package/@schnick371/devsteps-shared
- https://www.npmjs.com/package/@schnick371/devsteps-cli
- https://www.npmjs.com/package/@schnick371/devsteps-mcp-server

**Check Marketplace:**
- https://marketplace.visualstudio.com/items?itemName=schnick371.devsteps

## Rollback Plan

**If critical issues found:**

**Within 72 hours:**
```bash
npm unpublish @schnick371/devsteps-cli@X.Y.Z
npm unpublish @schnick371/devsteps-shared@X.Y.Z
npm unpublish @schnick371/devsteps-mcp-server@X.Y.Z
```

**After 72 hours:**
```bash
npm deprecate @schnick371/devsteps-cli@X.Y.Z "Critical bug - use X.Y.Z+1"
npm deprecate @schnick371/devsteps-shared@X.Y.Z "Critical bug - use X.Y.Z+1"
npm deprecate @schnick371/devsteps-mcp-server@X.Y.Z "Critical bug - use X.Y.Z+1"
```

**Git revert:**
```bash
git checkout main
git revert HEAD  # Revert squash commit
git push origin main
```

## Success Criteria

**Before declaring release complete:**

1. ✅ Dev branch created from main
2. ✅ All commits cherry-picked/included
3. ✅ Versions bumped in all packages
4. ✅ CHANGELOGs updated with format compliance
5. ✅ Build successful (clean + build + test)
6. ✅ npm packages published (shared → cli → mcp)
7. ✅ VSIX created (manual upload pending)
8. ✅ Squash merge to main (clean history)
9. ✅ Git tag created and pushed
10. ✅ Installation verification passed

**Documentation:**
- Release notes in CHANGELOG
- Breaking changes highlighted
- Migration guide (if needed)
- GitHub Release created (optional)

## Common Issues

**npm publish 403:**
```bash
npm login
npm whoami  # Verify logged in
```

**Version already exists:**
```bash
# Bump patch version
npm version patch
git push origin dev/X.Y.Z
```

**Build failures:**
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Cherry-pick conflicts:**
```bash
# Resolve conflicts manually
git status  # Check conflicted files
# Edit files, resolve conflicts
git add <resolved-files>
git cherry-pick --continue
```

## Notes

**Why squash merge?**
- Clean main branch history
- Single atomic release commit
- Easier bisecting and reverting
- Detailed history preserved in dev branch

**Why dev/X.Y.Z branch?**
- Isolates release preparation
- Cherry-pick from story branches
- Test complete release independently
- Preserves full commit traceability
- Clear naming: "development in progress"

**Version strategy:**
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes only

---

**Related:** See `NPM-PUBLISH-GUIDE.md` for npm specifics. See `DEPLOYMENT.md` for infrastructure deployment.
