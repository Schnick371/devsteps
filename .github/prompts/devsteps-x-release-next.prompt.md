---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Execute pre-release deployment to @next tag - testing and validation before stable release'
tools: ['edit', 'search', 'runCommands', 'runTasks', 'devsteps/*', 'problems', 'changes']
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
Current stable: 0.6.11
Next pre-release: 0.7.0-next.1
                  0.7.0-next.2
                  0.7.0-next.3
Final stable:     0.7.0
```

**Increment rules:**
- First @next: `X.Y.0-next.1` (based on target version)
- Subsequent: Increment `.N` suffix (0.7.0-next.2, 0.7.0-next.3...)
- Final release: Remove `-next.N` suffix

## Step 1: Prepare Next Branch

**Create next branch from current work:**
```bash
# From story/STORY-056 or dev/X.Y.Z
git checkout -b next/0.7.0-next.1
```

**Verify clean state:**
```bash
git status
npm run build
npm test
```

## Step 2: Version Bump to @next

**Update all package.json versions to X.Y.Z-next.N:**
```
packages/shared/package.json      → 0.7.0-next.1
packages/cli/package.json         → 0.7.0-next.1
packages/mcp-server/package.json  → 0.7.0-next.1
packages/extension/package.json   → 0.7.0-next.1
```

**Commit version bump:**
```bash
git add packages/*/package.json
git commit -m "chore: Bump version to 0.7.0-next.1"
```

## Step 3: Update CHANGELOGs

**Add pre-release section to all package CHANGELOGs:**
```markdown
## [0.7.0-next.1] - YYYY-MM-DD (Pre-release)

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
git commit -m "docs: Add CHANGELOG for 0.7.0-next.1 pre-release"
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
- ✅ VSIX created: devsteps-0.7.0-next.1.vsix

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
latest: 0.6.11
next: 0.7.0-next.1
```

## Step 6: Extension Pre-Release Package

**Create VSIX with pre-release flag:**
```bash
cd packages/extension
npm run build
vsce package --pre-release
```

**Output:** `devsteps-0.7.0-next.1.vsix`

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
git tag -a v0.7.0-next.1 -m "Pre-release 0.7.0-next.1

Experimental Features:
- STORY-056: Dual-bundle architecture

Testing: @next tag on npm, pre-release on Marketplace"

git push origin v0.7.0-next.1
```

## Step 8: Communication

**Announce to testers:**
```markdown
🧪 **Pre-Release Available: 0.7.0-next.1**

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
devsteps --version  # Should show 0.7.0-next.1
```

**Verify stable unaffected:**
```bash
npm view @schnick371/devsteps-cli@latest version
# Should still be 0.6.11
```

## Iteration: Publishing Next.2, Next.3...

**For subsequent pre-releases:**

1. **Make changes** on next/0.7.0-next.1 branch
2. **Increment suffix**: 0.7.0-next.1 → 0.7.0-next.2
3. **Commit**: `git commit -m "chore: Bump to 0.7.0-next.2"`
4. **Publish**: `npm publish --tag next` (all packages)
5. **Package**: `vsce package --pre-release`
6. **Test**: Verify installation and functionality

**No need for new branches** - iterate on same next/ branch.

## Promoting @next to Stable

**When ready for stable release:**

1. **Final testing** of latest @next version
2. **Create dev/0.7.0 branch** from next/ branch
3. **Remove -next suffix** from all package.json
4. **Follow standard release workflow** (devsteps-x-release.prompt.md)
5. **Publish without --tag flag** (becomes @latest)
6. **Tag as stable**: v0.7.0

**Result:**
```
npm view @schnick371/devsteps-cli dist-tags
latest: 0.7.0
next: 0.7.0-next.3
```

## Rollback @next

**If @next version has issues:**

**Unpublish specific @next:**
```bash
npm unpublish @schnick371/devsteps-cli@0.7.0-next.1
npm unpublish @schnick371/devsteps-shared@0.7.0-next.1
npm unpublish @schnick371/devsteps-mcp-server@0.7.0-next.1
```

**Or move @next tag to previous version:**
```bash
npm dist-tag add @schnick371/devsteps-cli@0.7.0-next.2 next
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
npm dist-tag add @schnick371/devsteps-cli@0.6.11 latest

# Unpublish wrong version
npm unpublish @schnick371/devsteps-cli@0.7.0-next.1
```

**Version already exists on @next:**
```bash
# Increment suffix: 0.7.0-next.1 → 0.7.0-next.2
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
Current:  0.6.11 (stable)
          ↓
Next:     0.7.0-next.1, 0.7.0-next.2, 0.7.0-next.3 (testing)
          ↓
Stable:   0.7.0 (promoted from @next)
```

---

**Related:** See `devsteps-x-release.prompt.md` for stable release workflow.
