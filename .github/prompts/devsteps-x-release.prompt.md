---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.5'
description: 'Execute production release workflow - version bump, CHANGELOG, build, npm publish, and git tagging'
tools: ['vscode/runCommand', 'execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/createAndRunTask', 'execute/runInTerminal', 'execute/runTests', 'read/problems', 'read/readFile', 'read/terminalSelection', 'read/terminalLastCommand', 'edit', 'search', 'web/fetch', 'devsteps/*', 'tavily/*', 'agent', 'todo']
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

**Dual-target extension build validation:**
```bash
cd packages/extension
npm run build  # Builds both extension.js + mcp-server/index.js
npm run package
```

**Verify outputs:**
- ✅ All TypeScript compiled
- ✅ No errors in dist/
- ✅ Extension bundle: dist/extension.js (~340 KB)
- ✅ MCP server bundle: dist/mcp-server/index.js (~500 KB)
- ✅ MCP server is executable (chmod 755)
- ✅ VSIX created successfully (<10 MB target)
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

### 5.3 MCP Server (for non-VS Code IDEs)
```bash
cd packages/mcp-server
npm publish --access public
```

**⚠️ Architecture Note:**
- **VS Code users**: MCP server bundled in extension (zero-config)
- **Other IDEs** (Cursor, Windsurf, Claude Desktop): Use npm package
- **Both must have same version** for consistency

**Verify on npm:**
```bash
npm view @schnick371/devsteps-shared version
npm view @schnick371/devsteps-cli version
npm view @schnick371/devsteps-mcp-server version
```

**All versions must match X.Y.Z!**

## Step 6: Extension Package

**Create VSIX with bundled MCP server:**
```bash
cd packages/extension
npm run build  # CRITICAL: Must build dual-target bundles first!
vsce package
```

**Output:** `devsteps-X.Y.Z.vsix`

**Verify VSIX contents:**
```bash
unzip -l devsteps-X.Y.Z.vsix | grep -E "(extension.js|mcp-server)"
```

**Expected:**
- ✅ `extension/dist/extension.js` (~340 KB)
- ✅ `extension/dist/mcp-server/index.js` (~500 KB, executable)
- ✅ Total VSIX size <10 MB

**⚠️ New Architecture:**
- **Bundled MCP server** for VS Code users (zero-config)
- **Native registration** via `vscode.lm.registerMcpServerDefinitionProvider`
- **No npx dependency** - instant startup

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

# Global MCP (for non-VS Code IDEs)
npm install -g @schnick371/devsteps-mcp-server@X.Y.Z
devsteps-mcp --version

# VS Code Extension (bundled MCP server)
code --install-extension devsteps-X.Y.Z.vsix
```

**Verify bundled MCP server in VS Code:**
```bash
# After extension installation
code --list-extensions --show-versions | grep devsteps
# Should show: schnick371.devsteps@X.Y.Z
```

**Test MCP server startup:**
- Open VS Code
- Check DevSteps output channel for "MCP server started"
- Verify no npx download delays
- Confirm instant startup (<1 second)

**Version consistency check:**
```bash
# All must report X.Y.Z
devsteps --version
devsteps-mcp --version
code --list-extensions --show-versions | grep devsteps
npm view @schnick371/devsteps-shared version
npm view @schnick371/devsteps-cli version
npm view @schnick371/devsteps-mcp-server version
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
3. ✅ Versions bumped in all packages (shared, cli, mcp-server, extension)
4. ✅ CHANGELOGs updated with format compliance
5. ✅ Build successful (clean + build + test)
6. ✅ **Dual-target extension build** (extension.js + mcp-server/index.js)
7. ✅ npm packages published (shared → cli → mcp-server)
8. ✅ **VSIX <10 MB** with bundled MCP server
9. ✅ VSIX created (manual upload pending)
10. ✅ Squash merge to main (clean history)
11. ✅ Git tag created and pushed
12. ✅ **Version consistency** verified across all packages
13. ✅ Installation verification passed (bundled + npm)

**Architecture Verification:**
- ✅ Extension contains dist/mcp-server/index.js
- ✅ MCP server executable (chmod 755)
- ✅ No npx dependencies in extension
- ✅ Standalone npm package still works for other IDEs

**Documentation:**
- Release notes in CHANGELOG
- Breaking changes highlighted (if upgrading from v1.x)
- Migration guide (bundled vs npm architecture)
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

**Extension dual-target build fails:**
```bash
cd packages/extension
npm run clean
npm run build
# Check both bundles exist:
ls -lh dist/extension.js dist/mcp-server/index.js
```

**MCP server bundle not executable:**
```bash
cd packages/extension
chmod +x dist/mcp-server/index.js
# Test execution:
./dist/mcp-server/index.js
```

**VSIX size >10 MB:**
```bash
# Check what's included
unzip -l devsteps-X.Y.Z.vsix | sort -k4 -n
# Verify .vscodeignore excludes dev files
cat .vscodeignore
```

**Version mismatch between packages:**
```bash
# Verify all match
grep '"version"' packages/*/package.json
# Update all to match:
# packages/shared/package.json
# packages/cli/package.json
# packages/mcp-server/package.json
# packages/extension/package.json
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

**Dual Architecture Strategy (EPIC-015):**
- **VS Code Extension**: Bundles MCP server internally
  - Zero-config installation
  - Instant startup via native VS Code API
  - Users never see MCP server details
- **npm Package**: Standalone MCP server for other IDEs
  - Cursor, Windsurf, Claude Desktop compatibility
  - Manual configuration required
  - Same codebase, different distribution
- **Version Synchronization**: All packages must have identical version
  - Ensures compatibility across deployment scenarios
  - Simplifies support and debugging
  - Single source of truth for capabilities

---

**Related:** See `NPM-PUBLISH-GUIDE.md` for npm specifics. See `DEPLOYMENT.md` for infrastructure deployment.
