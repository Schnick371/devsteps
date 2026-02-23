---
agent: 'devsteps'
model: 'Claude Sonnet 4.6'
description: 'Execute pre-release deployment to @next tag - testing and validation before stable release'
tools: ['vscode/runCommand', 'execute/getTerminalOutput', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runTask', 'execute/runNotebookCell', 'execute/testFailure', 'execute/runInTerminal', 'read', 'agent', 'playwright/*', 'bright-data/*', 'upstash/context7/*', 'edit', 'search', 'web', 'devsteps/*', 'remarc-insight-mcp/*', 'todo']
---

# 🧪 Pre-Release Workflow - @next Tag Deployment

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.


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

---

## Execution Model: Parallel Subagent Architecture

> This prompt is explicitly designed for subagent parallelization.
> Each Phase marked with ⚡ PARALLEL dispatches multiple `#runSubagent` calls simultaneously.
> Sequential phases are labeled accordingly and depend on prior phase outputs.

---

## Phase 0 ⚡ PARALLEL — Pre-Flight Checks

> Launch ALL three as simultaneous `#runSubagent` calls. Merge results before proceeding.

**DUAL REPOSITORY CONTEXT:**
- 🔒 **origin-private**: Full development (main branch, default remote)
- 🌍 **origin**: PUBLIC releases only (explicit push)
- @next releases go to PUBLIC origin with `-next.N` tag

---

### Subagent A — Auth & Registry Check

```bash
npm whoami
npm view @schnick371/devsteps-shared dist-tags
npm view @schnick371/devsteps-cli dist-tags
npm view @schnick371/devsteps-mcp-server dist-tags
```

- Determine next @next version number: `currentLatest_minor + 1` → `X.Y+1.0-next.1`
- If a @next already exists, increment `.N` suffix

**Returns:** `{ npmUser, currentLatest, currentNext, proposedVersion }`

---

### Subagent B — Git State Analysis

```bash
git remote -v
git log origin/main..main --oneline   # commits to cherry-pick
git status --short
git tag -l "v*" | tail -5             # recent tags
```

**Returns:** `{ remoteStatus, commitsToCherryPick[], proposedBranchName }`

---

### Subagent C — Codebase Quality Gate

```bash
# Verify all 4 packages have matching versions
cat packages/shared/package.json | grep '"version"'
cat packages/cli/package.json | grep '"version"'
cat packages/mcp-server/package.json | grep '"version"'
cat packages/extension/package.json | grep '"version"'

# Check if CHANGELOGs already have the proposed @next entry
grep -l "next" packages/*/CHANGELOG.md || echo "No existing next entry"

# Verify clean build
npm run build 2>&1 | tail -5

# Verify tests pass
npm test 2>&1 | tail -10
```

**Returns:** `{ versions, changelogStatus, buildOk, testsOk }`

---

### After Merging Phase 0 Results

- If `npmUser` is blank or auth fails → **STOP**, surface to user
- If `buildOk` is false → **STOP**, surface build errors to user
- If `testsOk` is false → **STOP**, surface test failures to user
- If versions don't all match → **WARN**, proceed with caution
- Compute final: `proposedVersion = "X.Y.Z-next.N"` using Subagent A output

---

## Phase 1 — Branch Creation & Cherry-Pick (Sequential)

> Depends on Phase 0: `proposedVersion` and `commitsToCherryPick[]` from Subagents A & B.

```bash
git fetch origin
git checkout -b next/{proposedVersion} origin/main
```

Cherry-pick each commit from Subagent B's `commitsToCherryPick` list (ONLY clean code — no private data):

```bash
git cherry-pick <commit-hash>
# Repeat for each commit in the list
```

**CRITICAL: Remove private files before any publish step:**

```bash
git rm --cached -r .devsteps/ .vscode/ docs/branding/ LessonsLearned/ 2>/dev/null || true
git status   # verify only expected files remain
```

**CRITICAL: Verify .github was synced by build:**

```bash
ls packages/cli/.github/prompts/devsteps-*.prompt.md
ls packages/mcp-server/.github/prompts/devsteps-*.prompt.md
```

---

## Phase 2 ⚡ PARALLEL — Version Bump + CHANGELOG

> Launch both as simultaneous `#runSubagent` calls. Both are independent file edits.

---

### Subagent D — Version Bump (all 4 packages)

Update each `package.json` to `X.Y.Z-next.N`:

```
packages/shared/package.json      → X.Y.Z-next.N
packages/cli/package.json         → X.Y.Z-next.N
packages/mcp-server/package.json  → X.Y.Z-next.N
packages/extension/package.json   → X.Y.Z-next.N
```

Then commit:

```bash
git add packages/*/package.json
git commit -m "chore: bump version to X.Y.Z-next.N"
```

**Returns:** commit hash

---

### Subagent E — CHANGELOG Updates (all 4 packages)

Add pre-release section to top of each CHANGELOG:

```markdown
## [X.Y.Z-next.N] - YYYY-MM-DD (Pre-release)

### ⚠️ Experimental Features
- Dual-bundle MCP server architecture (EPIC-015)
- VS Code native MCP registration API

### Fixed
- [List fixed bugs]

### Known Issues
- [List any known limitations]

### Testing Needed
- [What needs validation]
```

**Files:**

```
packages/shared/CHANGELOG.md
packages/cli/CHANGELOG.md
packages/mcp-server/CHANGELOG.md
packages/extension/CHANGELOG.md
```

**Returns:** confirmation all 4 files updated

---

### After Both Phase 2 Subagents Complete

```bash
git add packages/*/CHANGELOG.md
git commit -m "docs: add CHANGELOG entries for X.Y.Z-next.N pre-release"
```

---

## Phase 3 — Build Validation (Sequential)

> Depends on Phase 2 commits being in place.

**Full build test:**

```bash
npm run clean
npm install
npm run build
npm test
```

**Dual-target extension build + VSIX:**

```bash
cd packages/extension
npm run build
vsce package --pre-release
```

**Verify outputs:**
- ✅ Extension bundle: `dist/extension.js` (~340 KB)
- ✅ MCP server bundle: `dist/mcp-server/index.js` (~500 KB)
- ✅ VSIX created: `devsteps-X.Y.Z-next.N.vsix`

If any output is missing → **STOP**, investigate before publishing.

---

## Phase 4 ⚡ PARALLEL — npm Publishing + Verification

> **CRITICAL:** `shared` must publish first (cli and mcp-server depend on it). Then cli + mcp-server launch in parallel.

### Step 4.1 — Publish `shared` (Sequential)

```bash
cd packages/shared
npm publish --access public --tag next
```

Verify immediately:

```bash
npm view @schnick371/devsteps-shared dist-tags
```

---

### Step 4.2 ⚡ — Then cli + mcp-server in Parallel

Launch as simultaneous `#runSubagent` calls after Step 4.1 confirms success:

**Subagent F — Publish CLI:**

```bash
cd packages/cli
npm publish --access public --tag next
npm view @schnick371/devsteps-cli dist-tags   # verify
```

**Subagent G — Publish MCP Server:**

```bash
cd packages/mcp-server
npm publish --access public --tag next
npm view @schnick371/devsteps-mcp-server dist-tags   # verify
```

**`--tag next` is mandatory** — prevents overwriting `@latest`.  
Users must explicitly opt-in: `npm install @schnick371/devsteps-cli@next`

---

### After Phase 4 — Verify @latest is Unchanged

```bash
npm view @schnick371/devsteps-shared dist-tags
npm view @schnick371/devsteps-cli dist-tags
npm view @schnick371/devsteps-mcp-server dist-tags
```

Expected output per package:

```
latest: X.Y.Z          ← must not change
next:   X.Y.Z-next.N   ← newly published
```

**VS Code Extension — Manual Upload:**

```bash
# VSIX already built in Phase 3
# Upload via: https://marketplace.visualstudio.com/manage
# Check "Pre-Release" option when uploading
```

---

## Phase 5 ⚡ PARALLEL — Git Tagging + Verification Report

> Both are fully independent. Launch as simultaneous `#runSubagent` calls.

---

### Subagent H — Git Tag & Push

```bash
git tag -a vX.Y.Z-next.N -m "Pre-release X.Y.Z-next.N

Experimental Features:
- STORY-056: Dual-bundle architecture

Testing: @next tag on npm, pre-release on Marketplace"

git push origin vX.Y.Z-next.N
```

---

### Subagent I — Verification Report

```bash
# Confirm all dist-tags
npm view @schnick371/devsteps-shared dist-tags
npm view @schnick371/devsteps-cli dist-tags
npm view @schnick371/devsteps-mcp-server dist-tags

# Install and smoke-test
npm install -g @schnick371/devsteps-cli@next
devsteps --version   # should print X.Y.Z-next.N

# Confirm @latest still stable
npm view @schnick371/devsteps-cli@latest version
```

Generate announcement (see Communication Template below).

**Returns:** full verification report + announcement markdown

---

## Communication Template

**Announce to testers after Phase 5 completes:**

````markdown
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
````

---

## Iteration: Publishing Next.2, Next.3…

For subsequent pre-releases on the same branch:

1. **Make changes** on `next/X.Y.Z-next.N` branch
2. **Increment suffix**: `X.Y.Z-next.N` → `X.Y.Z-next.N+1`
3. **Commit**: `git commit -m "chore: bump to X.Y.Z-next.N+1"`
4. **Run Phase 2–5** again with new version string
5. **Package**: `vsce package --pre-release`
6. **Test**: Verify installation and functionality

**No need for new branches** — iterate on same `next/` branch.

## Promoting @next to Stable

When ready for stable release:

1. **Final testing** of latest @next version
2. **Create `dev/X.Y.Z` branch** from next/ branch
3. **Remove `-next.N` suffix** from all `package.json`
4. **Follow standard release workflow** (`devsteps-x-release.prompt.md`)
5. **Publish without `--tag` flag** (becomes @latest)
6. **Tag as stable**: `vX.Y.Z`

```
npm view @schnick371/devsteps-cli dist-tags
latest: X.Y.Z
next:   X.Y.Z-next.N
```

---

## Rollback @next

**If @next version has critical issues:**

**Unpublish specific @next:**

```bash
npm unpublish @schnick371/devsteps-cli@X.Y.Z-next.N
npm unpublish @schnick371/devsteps-shared@X.Y.Z-next.N
npm unpublish @schnick371/devsteps-mcp-server@X.Y.Z-next.N
```

**Or move @next tag back to previous version:**

```bash
npm dist-tag add @schnick371/devsteps-cli@X.Y.Z-next.N-1 next
npm dist-tag add @schnick371/devsteps-shared@X.Y.Z-next.N-1 next
npm dist-tag add @schnick371/devsteps-mcp-server@X.Y.Z-next.N-1 next
```

**Stable (`@latest`) remains unaffected!**

---

## Success Criteria

**Before declaring @next successful:**

1. ✅ Version suffix `-next.N` in all 4 packages
2. ✅ npm published with `--tag next` flag (never without)
3. ✅ `@latest` tag unchanged (verified by Subagent I)
4. ✅ Extension VSIX uploaded as pre-release to Marketplace
5. ✅ `devsteps --version` shows `X.Y.Z-next.N` after install
6. ✅ Testers notified with opt-in instructions
7. ✅ Known issues documented in CHANGELOG

---

## Common Issues

**Accidentally published to @latest:**

```bash
# Move latest back to stable
npm dist-tag add @schnick371/devsteps-cli@X.Y.Z latest

# Unpublish the wrong version
npm unpublish @schnick371/devsteps-cli@X.Y+1.Z-next.N
```

**Version already exists on @next:**

```bash
# Increment suffix: X.Y.Z-next.N → X.Y.Z-next.N+1
# Update package.json, commit, then:
npm publish --tag next
```

**Users install @next by accident:**
- Not possible — requires explicit `@next` suffix
- Default `npm install` always uses `@latest`

---

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
