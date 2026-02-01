---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Execute pre-release deployment to @next tag - testing and validation before stable release'
tools: ['execute/getTerminalOutput', 'execute/runTask', 'execute/createAndRunTask', 'execute/runInTerminal', 'read/problems', 'read/readFile', 'read/terminalSelection', 'read/terminalLastCommand', 'edit', 'search', 'web/fetch', 'devsteps/*', 'agent']
---

# 🧪 Pre-Release Workflow - @next Tag Deployment

## Mission

**Execute pre-release to @next** - deploy development builds for testing without consuming stable version numbers.

## When to Use @next

**Perfect for:**
- ✅ Testing major architectural changes (like EPIC-015)
- ✅ Early adopter feedback before stable release
- ✅ Iterating on breaking changes
- ✅ Validating features in production-like environment

**NOT for:**
- ❌ Hotfixes to stable version
- ❌ Final production releases
- ❌ Bug fixes to current stable

## Version Numbering Strategy

**@next versions use `-next.N` suffix:**
```
Current stable: X.Y.Z
Next pre-release: X.Y+1.0-next.1
                  X.Y+1.0-next.2
                  X.Y+1.0-next.3
Final stable:     X.Y+1.0
```

**Increment rules:**
- First @next: `X.Y.0-next.1` (based on target version)
- Subsequent: Increment `.N` suffix (X.Y.0-next.2, X.Y.0-next.3...)
- Final release: Remove `-next.N` suffix

## Step 1: Prepare Next Branch

**DUAL REPOSITORY CONTEXT:**
- 🔒 **origin-private**: Full development (main branch, default remote)
- 🌍 **origin**: PUBLIC releases only (explicit push)
- @next releases go to PUBLIC origin with `-next.N` tag

**Create next branch from public main:**
```bash
git fetch origin  # Fetch PUBLIC repo
git checkout -b next/X.Y.Z-next.N origin/main
```

**Cherry-pick from private main:**
```bash
# Review commits in private main not in public
git log origin/main..main --oneline

# Cherry-pick selected commits (ONLY clean code!)
git cherry-pick <commit-hash>
```

**CRITICAL: Remove private files:**
```bash
git status
# Remove private directories
git rm --cached -r .devsteps/ .vscode/ docs/branding/ LessonsLearned/ 2>/dev/null || true
```

**Verify clean state:**
```bash
git status
npm run build  # Includes .github sync from root
npm test
```

**CRITICAL: Verify .github was synced:**
```bash
ls packages/cli/.github/prompts/devsteps-*.prompt.md
ls packages/mcp-server/.github/prompts/devsteps-*.prompt.md
```

## Step 2: Version Bump to @next

**Update all package.json versions to X.Y.Z-next.N:**
```
packages/shared/package.json      → X.Y.Z-next.N
packages/cli/package.json         → X.Y.Z-next.N
packages/mcp-server/package.json  → X.Y.Z-next.N
packages/extension/package.json   → X.Y.Z-next.N
```

**Commit version bump:**
```bash
git add packages/*/package.json
git commit -m "chore: Bump version to X.Y.Z-next.N"
```

## Step 3: Update CHANGELOGs

**Add pre-release section to all package CHANGELOGs:**
```markdown
## [X.Y.Z-next.N] - YYYY-MM-DD (Pre-release)

### ⚠️ Experimental Features
- Dual-bundle MCP server architecture (EPIC-015)
- VS Code native MCP registration API

### Known Issues
- [List any known limitations]

### Testing Needed
- [What needs validation]
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
git commit -m "docs: Add CHANGELOG for X.Y.Z-next.N pre-release"
```

## Step 4: Build Validation

**Full build test:**
```bash
npm run clean
npm install
npm run build
npm test
```

**Dual-target extension build:**
```bash
cd packages/extension
npm run build
npm run package
```

**Verify outputs:**
- ✅ Extension bundle: dist/extension.js (~340 KB)
- ✅ MCP server bundle: dist/mcp-server/index.js (~500 KB)
- ✅ VSIX created: devsteps-X.Y.Z-next.N.vsix

## Step 5: npm Publishing to @next Tag

**CRITICAL: Use --tag next flag!**

### 5.1 Shared Package
```bash
cd packages/shared
npm publish --access public --tag next
```

### 5.2 CLI Package
```bash
cd packages/cli
npm publish --access public --tag next
```

### 5.3 MCP Server
```bash
cd packages/mcp-server
npm publish --access public --tag next
```

**⚠️ Important:**
- `--tag next` prevents overwriting `latest` tag
- Users must explicitly opt-in: `npm install @schnick371/devsteps-cli@next`

**Verify on npm:**
```bash
npm view @schnick371/devsteps-shared dist-tags
npm view @schnick371/devsteps-cli dist-tags
npm view @schnick371/devsteps-mcp-server dist-tags
```

**Should show:**
```
latest: X.Y.Z
next: X.Y+1.Z-next.N
```

## Step 6: Extension Pre-Release Package

**Create VSIX with pre-release flag:**
```bash
cd packages/extension
npm run build
vsce package --pre-release
```

**Output:** `devsteps-X.Y.Z-next.N.vsix`

**⚠️ VS Code Marketplace Pre-Release:**
- Upload to Marketplace with "Pre-Release" flag
- Visible only to users who opt-in
- Separate from stable channel

**Manual Upload:**
- VS Code Marketplace: https://marketplace.visualstudio.com/manage
- Check "Pre-Release" option
- Upload VSIX file

## Step 7: Git Tagging (Optional)

**Tag pre-release for tracking:**
```bash
git tag -a vX.Y.Z-next.N -m "Pre-release X.Y.Z-next.N

Experimental Features:
- STORY-056: Dual-bundle architecture

Testing: @next tag on npm, pre-release on Marketplace"

git push origin vX.Y.Z-next.N
```

## Step 8: Communication

**Announce to testers:**
```markdown
🧪 **Pre-Release Available: X.Y.Z-next.N**

**Install:**
```bash
# npm packages
npm install -g @schnick371/devsteps-cli@next
npm install -g @schnick371/devsteps-mcp-server@next

# VS Code Extension
# Switch to "Pre-Release" in extension marketplace
```

**What's New:**
- Dual-bundle MCP server architecture
- Zero-config VS Code installation

**Known Issues:**
- [List issues]

**Feedback:** GitHub Issues or Discussions
```

## Post-Release Verification

**Test @next installations:**
```bash
# Verify npm tags
npm view @schnick371/devsteps-cli@next version
npm view @schnick371/devsteps-mcp-server@next version

# Install and test
npm install -g @schnick371/devsteps-cli@next
devsteps --version  # Should show X.Y.Z-next.N
```

**Verify stable unaffected:**
```bash
npm view @schnick371/devsteps-cli@latest version
# Should still be X.Y.Z (previous stable)
```

## Iteration: Publishing Next.2, Next.3...

**For subsequent pre-releases:**

1. **Make changes** on next/X.Y.Z-next.N branch
2. **Increment suffix**: X.Y.Z-next.N → X.Y.Z-next.N+1
3. **Commit**: `git commit -m "chore: Bump to X.Y.Z-next.N+1"`
4. **Publish**: `npm publish --tag next` (all packages)
5. **Package**: `vsce package --pre-release`
6. **Test**: Verify installation and functionality

**No need for new branches** - iterate on same next/ branch.

## Promoting @next to Stable

**When ready for stable release:**

1. **Final testing** of latest @next version
2. **Create dev/X.Y.Z branch** from next/ branch
3. **Remove -next suffix** from all package.json
4. **Follow standard release workflow** (devsteps-x-release.prompt.md)
5. **Publish without --tag flag** (becomes @latest)
6. **Tag as stable**: vX.Y.Z

**Result:**
```
npm view @schnick371/devsteps-cli dist-tags
latest: X.Y.Z
next: X.Y.Z-next.N
```

## Rollback @next

**If @next version has issues:**

**Unpublish specific @next:**
```bash
npm unpublish @schnick371/devsteps-cli@X.Y.Z-next.N
npm unpublish @schnick371/devsteps-shared@X.Y.Z-next.N
npm unpublish @schnick371/devsteps-mcp-server@X.Y.Z-next.N
```

**Or move @next tag to previous version:**
```bash
npm dist-tag add @schnick371/devsteps-cli@X.Y.Z-next.N-1 next
```

**Stable (@latest) remains unaffected!**

## Success Criteria

**Before declaring @next successful:**

1. ✅ Version suffix `-next.N` in all packages
2. ✅ npm publish with `--tag next` flag
3. ✅ `@latest` tag unchanged (still stable version)
4. ✅ Extension uploaded as pre-release
5. ✅ Installation tested from @next tag
6. ✅ Testers notified with opt-in instructions
7. ✅ Known issues documented

## Common Issues

**Accidentally published to @latest:**
```bash
# Move latest back to stable
npm dist-tag add @schnick371/devsteps-cli@X.Y.Z latest

# Unpublish wrong version
npm unpublish @schnick371/devsteps-cli@X.Y+1.Z-next.N
```

**Version already exists on @next:**
```bash
# Increment suffix: X.Y.Z-next.N → X.Y.Z-next.N+1
# Update package.json
npm publish --tag next
```

**Users install @next by accident:**
- Not possible - requires explicit `@next` suffix
- Default `npm install` always uses `@latest`

## Notes

**Why @next tag?**
- Protects stable users from experimental changes
- Enables rapid iteration without version pollution
- VS Code Marketplace has native pre-release support
- npm dist-tags are standard practice (React, TypeScript, etc.)

**Version strategy:**
- **@next**: `X.Y.0-next.N` (target version + next suffix)
- **Stable**: `X.Y.0` (final release, no suffix)
- **Patches**: `X.Y.Z` (bug fixes to stable)

**When to use @next:**
- Major features (EPIC-015)
- Breaking changes
- Architectural transformations
- Early testing with community

**Migration path:**
```
Current:  X.Y.Z (stable)
          ↓
Next:     X.Y+1.0-next.1, X.Y+1.0-next.2, X.Y+1.0-next.3 (testing)
          ↓
Stable:   X.Y+1.0 (promoted from @next)
```

---

**Related:** See `devsteps-x-release.prompt.md` for stable release workflow.
