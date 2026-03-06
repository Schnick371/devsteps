## Problem
`packages/mcp-server/` contains a `.github/` directory (66 files) that is a manual copy of the root `.github/`. There is no automated sync mechanism — if root `.github/` agent files are updated, the `mcp-server/.github/` copy will silently diverge.

This is a maintenance risk: `.mcp.json` may reference agents from the mcp-server package's local `.github/` copy, which becomes stale as the root is updated.

## Fix
Add a `prepack` npm hook to `packages/mcp-server/package.json` that runs `rsync` to sync the root `.github/` into `packages/mcp-server/.github/` before packaging:

```json
{
  "scripts": {
    "prepack": "rsync -av --delete ../../.github/ .github/"
  }
}
```

Also consider: CI step that runs the sync on every push to `main` to keep the distributed copy current even outside packaging.

## Alternative
If the mcp-server `.github/` copy is not required for `plugin.json` bundling, evaluate removing it entirely and referencing the root `.github/` via relative path in plugin manifest.

## Acceptance Criteria
- `packages/mcp-server/package.json` has a `prepack` hook that runs rsync from root `.github/` → `packages/mcp-server/.github/`
- OR: the duplicate `.github/` is removed and replaced with a reference to root
- CI run confirms the mcp-server package build produces a current copy of agent files
- Divergence check: `diff -r .github/ packages/mcp-server/.github/` returns empty after sync

## Risks
- `rsync` may not be available in all CI environments — add a fallback `cp -r` with `--update` flag
- Windows CI compatibility: may need `robocopy` or Node.js-based sync script instead