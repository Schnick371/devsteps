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

**⚠️ CRITICAL: VS Code Extension Version Rules**

**npm packages**: Use full semantic version with `-next.N` suffix
- `@schnick371/devsteps-shared@0.7.0-next.4` ✅
- `@schnick371/devsteps-cli@0.7.0-next.4` ✅

**VS Code Extension**: Marketplace does NOT support `-next.N` suffix!
- Use base version WITHOUT suffix: `0.7.0`, `0.7.1`, `0.7.2`
- Pre-Release channel controlled by `--pre-release` flag, NOT version number
- **NEVER skip major versions** (0.7.x → 0.8.0 for README changes)

**Version Bump Strategy**:
- **PATCH bump** (0.7.0 → 0.7.1): README updates, documentation fixes, no code changes
- **MINOR bump** (0.7.0 → 0.8.0): New features, new functionality
- **MAJOR bump** (0.7.0 → 1.0.0): Breaking changes

**Example Progression**:
```
0.7.0 --pre-release   # Initial pre-release with new features
0.7.1 --pre-release   # README update, documentation fix
0.7.2 --pre-release   # Bug fix, no new features
0.8.0 --pre-release   # New feature added
```

**DO NOT**:
- ❌ Skip major versions (0.7.x → 0.8.0 for docs)
- ❌ Use `-next.N` suffix in extension package.json
- ❌ Publish without `--pre-release` flag during pre-release phase

## Step 1: Prepare Next Branch

**Create next branch from current work:**
```bash
# From story/STORY-XXX or dev/X.Y.Z
git checkout -b next/X.Y.Z-next.N
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

**Full build and package:**
```bash
npm run clean
npm install
npm run build
npm run package:all
npm test
```

**Verify all distribution packages:**
```bash
./scripts/verify-packages.sh
```

**Expected output:**
- ✅ All packages have correct version X.Y.Z-next.N
- ✅ Dependencies reference correct versions
- ✅ VSIX file created: `tmp/devsteps-X.Y.Z.vsix`
- ✅ npm packages in tmp/package-* directories
- ✅ No version mismatches reported

**Mandatory: Ask user to confirm successful build before publishing**

## Step 5: npm Publishing to @next Tag

**CRITICAL: Use --tag next flag!**

### 5.1 Shared Package
```bash
export BROWSER='/mnt/c/Program\ Files/Mozilla\ Firefox/firefox.exe'
cd packages/shared
npm publish --access public --tag next
```

### 5.2 CLI Package
```bash
export BROWSER='/mnt/c/Program\ Files/Mozilla\ Firefox/firefox.exe'
cd packages/cli
npm publish --access public --tag next
```

### 5.3 MCP Server
```bash
export BROWSER='/mnt/c/Program\ Files/Mozilla\ Firefox/firefox.exe'
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

**⚠️ CRITICAL: Version Number in Extension package.json**

**VS Code Marketplace does NOT support `-next.N` suffix!**

**Before publishing, set clean semantic version:**
```json
// packages/extension/package.json
{
  "version": "0.7.0"  // NO -next.N suffix!
}
```

**Version Bump Rules for Extension:**
- **README/Docs Update**: Patch bump (0.7.0 → 0.7.1)
- **Bug Fixes**: Patch bump (0.7.1 → 0.7.2)
- **New Features**: Minor bump (0.7.2 → 0.8.0)
- **Breaking Changes**: Major bump (0.8.0 → 1.0.0)

**DO NOT skip major versions for minor changes!**

**Create VSIX with pre-release flag:**
```bash
cd packages/extension
# Version already set in package.json (e.g., 0.7.1)
npm run build
vsce package --pre-release
```

**Output:** `devsteps-X.Y.Z.vsix` (clean version, no -next suffix)

**Publish to Marketplace:**
```bash
vsce publish --pre-release
```

**⚠️ VS Code Marketplace Pre-Release:**
- Pre-release controlled by `--pre-release` flag, NOT version suffix
- Version must be clean semantic version (X.Y.Z)
- Visible only to users who opt-in via "Switch to Pre-Release"
- Separate channel from stable release

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

## Iteration: Publishing Fixes/Updates to Pre-Release

**For subsequent pre-releases (fixes, README, docs):**

**⚠️ CRITICAL Version Strategy:**

**npm packages** (with -next.N suffix):
1. **Increment suffix**: `0.7.0-next.N` → `0.7.0-next.N+1`
2. **Update**: `packages/{shared,cli,mcp-server}/package.json`
3. **Publish**: `npm publish --tag next`

**VS Code Extension** (NO suffix, clean semver):
1. **Patch bump**: `0.7.0` → `0.7.1` (README, docs, minor fixes)
2. **Minor bump**: `0.7.1` → `0.8.0` (new features only)
3. **Update**: `packages/extension/package.json`
4. **Publish**: `vsce publish --pre-release`

**Example: README Update**
```bash
# npm packages: 0.7.0-next.4 → 0.7.0-next.5
cd packages/shared && update version to 0.7.0-next.5
npm publish --tag next

# Extension: 0.7.0 → 0.7.1 (PATCH bump!)
cd packages/extension && update version to 0.7.1
vsce publish --pre-release
```

**DO NOT**:
- ❌ Skip major versions (0.7.x → 0.8.0 for README)
- ❌ Use minor bump for docs/fixes
- ❌ Forget `--pre-release` flag

**Workflow**:
1. Make changes on `next/X.Y.Z-next.N` branch
2. Bump versions (npm: -next.N+1, extension: patch/minor)
3. Commit with conventional message
4. Publish npm packages with `--tag next`
5. Publish extension with `--pre-release`
6. Test installation

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
