---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Execute production release workflow - version bump, CHANGELOG, build, npm publish, and git tagging'
tools: ['vscode/runCommand', 'execute/getTerminalOutput', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runTask', 'execute/runNotebookCell', 'execute/testFailure', 'execute/runInTerminal', 'read', 'agent', 'playwright/*', 'bright-data/*', 'upstash/context7/*', 'edit', 'search', 'web', 'devsteps/*', 'remarc-insight-mcp/*', 'todo']
---

# 🚀 Release Workflow — Parallel Subagent Orchestration

> **Reasoning:** Think through scope, risks, and approach before any action. Launch independent subagents in parallel wherever tasks have no data dependency. Only sequence what truly must be ordered.

## Mission

**Execute production release** — systematic version bump, CHANGELOG updates, build validation, npm publishing, and git tagging with squash merge to main. Maximise throughput via `#runSubagent` parallelism.

## ⚠️ CRITICAL RULES — Read Before Any Action

**DUAL REPOSITORY STRATEGY:**
- 🔒 **origin-private** (devsteps-private): Full development with `.devsteps/`, `.vscode/`, `docs/`, `LessonsLearned/`
- 🌍 **origin** (devsteps): PUBLIC — only clean code for releases
- ✅ ONE `main` branch, TWO remotes
- ✅ Daily work: `git push` → origin-private (default)
- ✅ Public releases: `git push origin main` (explicit)
- ❌ NEVER accidentally push to origin (public) during development!

**Remote Configuration:**
- `main` branch tracks **origin-private/main** by default
- `git push` → pushes to origin-private (private repo)
- `git push origin main` → pushes to origin (PUBLIC repo)
- `dev/X.Y.Z` = release preparation branch (clean code only)

---

## Phase 0 ⚡ PARALLEL — Pre-Flight Authentication & State

> Launch all three subagents simultaneously. Collect all results before proceeding.
> **If any GATE fails → STOP immediately and surface the error to the user.**

### Subagent A — npm Auth + Registry

```
#runSubagent
Goal: Verify npm authentication and collect current published versions.

Commands:
  npm whoami                                   # → npmUser (401 = STOP immediately)
  npm view @schnick371/devsteps-shared version  # → sharedLatest
  npm view @schnick371/devsteps-cli version     # → cliLatest
  npm view @schnick371/devsteps-mcp-server version  # → mcpLatest

Return: { npmUser, sharedLatest, cliLatest, mcpLatest }
GATE: If npm whoami returns 401 or fails → emit STOP signal.
```

### Subagent B — Git State & Commits

```
#runSubagent
Goal: Verify repository state and collect commits pending public release.

Commands:
  git remote -v                              # verify origin = public, origin-private = private
  git log origin/main..main --oneline        # → commitList (commits to cherry-pick)
  git status --short                         # must be empty (clean working tree)
  git tag -l "v*" | sort -V | tail -5        # → lastTag

Return: { remotes, commitList, isClean, lastTag }
GATE: If git status --short is non-empty → emit STOP signal.
```

### Subagent C — Code Quality Gate

```
#runSubagent
Goal: Verify versions, changelogs, build, and tests before touching git.

Commands:
  grep '"version"' packages/*/package.json   # → versions (must all match target X.Y.Z)
  grep -l "\[X\.Y\.Z\]" packages/*/CHANGELOG.md  # → changelogOk
  npm run build 2>&1 | tail -10              # → buildOk
  npm test 2>&1 | tail -10                   # → testsOk

Return: { versions, changelogOk, buildOk, testsOk }
GATE: If build output contains "error" or tests fail → emit STOP signal.
```

### Phase 0 Gate — Aggregate Results

Collect Subagent A + B + C results. Apply gates in order:
1. **npm auth** (A): If failed → STOP. Run `npm login` then retry.
2. **git clean** (B): If dirty → STOP. Commit or stash changes first.
3. **build/test** (C): If failures → STOP. Fix before proceeding.
4. **versions** (C): If package versions don't all match X.Y.Z → STOP. Align versions first.

Only proceed to Phase 1 when all four gates are green.

---

## Phase 1 — Branch Prep *(Sequential — depends on Phase 0)*

> Uses `commitList` from Subagent B. Runs after Phase 0 gate is green.

```bash
git checkout main
git fetch origin                               # fetch public repo (DO NOT pull)
git checkout -b dev/X.Y.Z origin/main          # branch from PUBLIC main

# Cherry-pick commits from Phase 0 Subagent B commitList (ONLY clean code!)
git cherry-pick <commit> [<commit> ...]

# Remove private files that may have been pulled in
git rm --cached -r .devsteps/ .vscode/ docs/branding/ LessonsLearned/ 2>/dev/null || true
git checkout origin/main -- .gitignore         # ensure correct .gitignore

git status   # must be clean before proceeding
```

**Cherry-pick conflicts:**
```bash
# Resolve manually if needed
git status          # check conflicted files
# Edit → resolve → stage
git add <resolved-files>
git cherry-pick --continue
```

---

## Phase 2 ⚡ PARALLEL — Version Bump + CHANGELOG

> Both subagents work on different files simultaneously. Launch together.

### Subagent D — Version Bump (all 4 packages)

```
#runSubagent
Goal: Update version field in all package.json files and commit.

Actions:
  Edit packages/shared/package.json      → set "version": "X.Y.Z"
  Edit packages/cli/package.json         → set "version": "X.Y.Z"
  Edit packages/mcp-server/package.json  → set "version": "X.Y.Z"
  Edit packages/extension/package.json   → set "version": "X.Y.Z"

  git add packages/*/package.json
  git commit -m "chore: bump version to X.Y.Z"

Return: { commitHash }
```

### Subagent E — CHANGELOG Updates (all 4 packages)

```
#runSubagent
Goal: Prepend release entry to all four CHANGELOGs.

Format (Keep a Changelog):
  ## [X.Y.Z] - YYYY-MM-DD

  ### Added
  - New features (from git log since lastTag and known work items)

  ### Changed
  - Modifications to existing features

  ### Fixed
  - Bug fixes

  ### Breaking Changes ⚠️
  - Changes requiring user action (if any)

Files to update:
  packages/shared/CHANGELOG.md
  packages/cli/CHANGELOG.md
  packages/mcp-server/CHANGELOG.md
  packages/extension/CHANGELOG.md

Draw content from: git log since lastTag (Phase 0 Subagent B) + DevSteps work items.

Return: { filesUpdated: 4 }
```

**After both D and E complete:**
```bash
git add packages/*/CHANGELOG.md
git commit -m "docs: update CHANGELOGs for X.Y.Z"
```

---

## Phase 3 — Build Validation *(Sequential)*

> Full clean build with dual-target extension verification.

```bash
npm run clean
npm install
npm run build   # builds all packages + syncs .github/ from root to packages
npm test
```

**Verify .github sync:**
```bash
ls packages/cli/.github/prompts/devsteps-*.prompt.md
ls packages/mcp-server/.github/prompts/devsteps-*.prompt.md
```

**Dual-target extension build:**
```bash
cd packages/extension
npm run build     # builds both extension.js + mcp-server/index.js
vsce package      # output: devsteps-X.Y.Z.vsix
```

**Verify outputs:**
- ✅ Extension bundle: `dist/extension.js` (~340 KB)
- ✅ MCP server bundle: `dist/mcp-server/index.js` (~500 KB, executable)
- ✅ VSIX exists and size <10 MB

```bash
ls -lh packages/extension/devsteps-X.Y.Z.vsix
unzip -l packages/extension/devsteps-X.Y.Z.vsix | grep -E "(extension.js|mcp-server)"
```

**⏸️ Manual Upload Required (async — can proceed):**
- VS Code Marketplace: https://marketplace.visualstudio.com/manage
- Upload VSIX → publish after review

---

## Phase 4 — npm Publishing *(Ordered by Dependency)*

> `shared` must land first. `cli` and `mcp-server` can then publish in parallel.

### Step 4.1 — Shared Package *(sequential, first)*

```bash
cd packages/shared
npm publish --access public
npm view @schnick371/devsteps-shared version   # verify = X.Y.Z
```

### Step 4.2 ⚡ PARALLEL — CLI + MCP Server

> Launch after Step 4.1 succeeds. Both depend only on `shared` being published.

#### Subagent F — CLI Publish

```
#runSubagent
Goal: Publish CLI package and verify registry reflects X.Y.Z.

Commands:
  cd packages/cli
  npm publish --access public
  npm view @schnick371/devsteps-cli version    # must = X.Y.Z

Return: { cliPublished: true, version: "X.Y.Z" }
GATE: If publish fails → emit STOP signal.
```

#### Subagent G — MCP Server Publish

```
#runSubagent
Goal: Publish MCP Server package and verify registry reflects X.Y.Z.

Commands:
  cd packages/mcp-server
  npm publish --access public
  npm view @schnick371/devsteps-mcp-server version   # must = X.Y.Z

Return: { mcpPublished: true, version: "X.Y.Z" }
GATE: If publish fails → emit STOP signal.

Architecture note:
  VS Code users  → MCP server bundled in extension (zero-config)
  Other IDEs     → Cursor, Windsurf, Claude Desktop use this npm package
  Both must have identical version X.Y.Z.
```

**After F and G complete:** Verify all three npm versions equal X.Y.Z:
```bash
npm view @schnick371/devsteps-shared version
npm view @schnick371/devsteps-cli version
npm view @schnick371/devsteps-mcp-server version
```

---

## Phase 5 — Squash Merge to PUBLIC Main *(Sequential — critical path)*

> ⚠️ This pushes to the PUBLIC repository. Double-check remotes before every push.

```bash
git fetch origin

git checkout -B public-main origin/main

# Squash merge the release branch
git merge --squash dev/X.Y.Z

# Craft comprehensive release commit
git commit -m "release: Version X.Y.Z

Major changes:
- Feature 1 (STORY-XXX)
- Feature 2 (EPIC-YYY)
- Bug fix (BUG-ZZZ)

Breaking Changes:
- [List breaking changes if any]

Full traceability in dev/X.Y.Z branch commits.

Refs: EPIC-XXX, STORY-YYY"

# DOUBLE-CHECK: Must be public repo before pushing
git remote -v | grep "^origin\s"
# Expected: origin  https://github.com/Schnick371/devsteps.git

git push origin public-main:main
```

**Merge release back to private main:**
```bash
git checkout main                    # private main (tracks origin-private)
git merge public-main --ff-only      # fast-forward to include public release commit
git push                             # → origin-private (safe default)
```

---

## Phase 6 ⚡ PARALLEL — Git Tagging + Verification Report

> Both subagents run simultaneously after Phase 5 completes.

### Subagent H — Git Tag

```
#runSubagent
Goal: Create annotated tag and push to public remote.

Commands:
  git tag -a vX.Y.Z -m "Release X.Y.Z

Key Changes:
- Feature summary
- Breaking changes (if any)
- Bug fixes

Full CHANGELOG: packages/*/CHANGELOG.md"

  git push origin vX.Y.Z
  git tag -l -n9 vX.Y.Z              # verify tag exists

Return: { tag: "vX.Y.Z", pushed: true }
```

### Subagent I — Full Verification Report

```
#runSubagent
Goal: Confirm all artifacts are present and consistent at X.Y.Z.

Commands:
  npm view @schnick371/devsteps-shared version    # must = X.Y.Z
  npm view @schnick371/devsteps-cli version       # must = X.Y.Z
  npm view @schnick371/devsteps-mcp-server version  # must = X.Y.Z
  npm view @schnick371/devsteps-shared dist-tags   # @latest must = X.Y.Z
  npm view @schnick371/devsteps-cli dist-tags      # @latest must = X.Y.Z
  npm view @schnick371/devsteps-mcp-server dist-tags  # @latest must = X.Y.Z
  git tag -l "v*" | sort -V | tail -5             # confirm vX.Y.Z present

Generate: Release notes summary (version, date, key changes, npm links)

Return: { verificationReport }
```

### Cleanup (after H and I complete — optional)

```bash
git branch -d dev/X.Y.Z
git push origin --delete dev/X.Y.Z
# Alternatively: keep dev/X.Y.Z for historical reference and bisecting
```

---

## Post-Release Verification

**Test installations:**
```bash
npm install -g @schnick371/devsteps-cli@X.Y.Z
devsteps --version

npm install -g @schnick371/devsteps-mcp-server@X.Y.Z
devsteps-mcp --version

code --install-extension devsteps-X.Y.Z.vsix
code --list-extensions --show-versions | grep devsteps
# Expected: schnick371.devsteps@X.Y.Z
```

**Test MCP server startup in VS Code:**
- Open VS Code with extension installed
- Check DevSteps output channel for "MCP server started"
- Confirm instant startup (<1 second, no npx download delays)

**Version consistency check:**
```bash
devsteps --version
devsteps-mcp --version
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

---

## Rollback Plan

**Within 72 hours of publish:**
```bash
npm unpublish @schnick371/devsteps-cli@X.Y.Z
npm unpublish @schnick371/devsteps-shared@X.Y.Z
npm unpublish @schnick371/devsteps-mcp-server@X.Y.Z
```

**After 72 hours:**
```bash
npm deprecate @schnick371/devsteps-cli@X.Y.Z "Critical bug — use X.Y.Z+1"
npm deprecate @schnick371/devsteps-shared@X.Y.Z "Critical bug — use X.Y.Z+1"
npm deprecate @schnick371/devsteps-mcp-server@X.Y.Z "Critical bug — use X.Y.Z+1"
```

**Git revert:**
```bash
git checkout main
git revert HEAD   # revert squash commit
git push origin main
```

---

## Success Criteria

Before declaring the release complete, all 13 must be green:

1. ✅ `dev/X.Y.Z` branch created from PUBLIC `origin/main`
2. ✅ All commits cherry-picked from private main
3. ✅ Versions bumped in all packages (shared, cli, mcp-server, extension)
4. ✅ CHANGELOGs updated in all packages with format compliance
5. ✅ Full build successful (`clean` + `build` + `test`)
6. ✅ **Dual-target extension build** (`extension.js` + `mcp-server/index.js`)
7. ✅ npm packages published in order (shared → cli ‖ mcp-server)
8. ✅ **VSIX <10 MB** with bundled MCP server
9. ✅ VSIX created (manual Marketplace upload pending)
10. ✅ Squash merge to PUBLIC `main` (clean history)
11. ✅ Git tag `vX.Y.Z` created and pushed
12. ✅ **Version consistency** verified across all npm packages (`@latest` = X.Y.Z)
13. ✅ Installation verification passed (bundled extension + standalone npm)

**Architecture Verification:**
- ✅ Extension contains `dist/mcp-server/index.js` (bundled, executable)
- ✅ No npx dependencies in extension
- ✅ Standalone npm package works for Cursor / Windsurf / Claude Desktop

---

## Common Issues

**npm publish 403:**
```bash
npm login
npm whoami   # verify logged in
```

**Version already exists on npm:**
```bash
# Bump patch version, then re-run full workflow
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
npm run clean && npm run build
ls -lh dist/extension.js dist/mcp-server/index.js
```

**MCP server bundle not executable:**
```bash
chmod +x packages/extension/dist/mcp-server/index.js
./packages/extension/dist/mcp-server/index.js
```

**VSIX size >10 MB:**
```bash
unzip -l devsteps-X.Y.Z.vsix | sort -k4 -n
cat packages/extension/.vscodeignore   # verify dev files excluded
```

**Version mismatch between packages:**
```bash
grep '"version"' packages/*/package.json
# All must match X.Y.Z — edit any that differ, re-commit
```

**Cherry-pick conflicts:**
```bash
git status              # check conflicted files
# Edit → resolve → stage
git add <resolved-files>
git cherry-pick --continue
```

---

## Notes

**Why squash merge?**
- Clean `main` branch history — single atomic release commit
- Easier bisecting and reverting
- Detailed history preserved in `dev/X.Y.Z` branch

**Why `dev/X.Y.Z` branch?**
- Isolates release preparation from daily development
- Cherry-pick lets you select only clean, public-safe commits
- Preserves full commit traceability
- Clear naming convention: version in branch name

**Version strategy:**
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes only

**Dual Architecture Strategy (EPIC-015):**
- **VS Code Extension**: Bundles MCP server internally
  - Zero-config installation, instant startup via native VS Code API
  - Users never interact with MCP server directly
- **npm Package**: Standalone MCP server for other IDEs
  - Cursor, Windsurf, Claude Desktop — manual configuration required
  - Same codebase, different distribution channel
- **Version Synchronization**: All packages must have identical version
  - Ensures compatibility across all deployment scenarios
  - Single source of truth for capabilities and changelog

---

**Related:** See `NPM-PUBLISH-GUIDE.md` for npm specifics. See `DEPLOYMENT.md` for infrastructure deployment.
