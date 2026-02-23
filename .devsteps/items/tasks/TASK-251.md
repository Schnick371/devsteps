## Summary

Research and implementation of the correct VS Code Marketplace pre-release workflow.

## Key Findings

### No `"preRelease": true` in package.json

**There is NO field to mark an extension as pre-release in package.json.** Docs confirm this. The only way:

```bash
vsce publish --pre-release        # Publish directly (uses VSCE_PAT env var)
vsce package --pre-release        # Package VSIX, then upload manually
```

### Manual Upload Cannot Re-Mark Pre-Release

When uploading a VSIX via the Marketplace UI, the "Pre-Release" checkbox is only shown on the FIRST upload. Subsequent uploads cannot change this via UI. **Must use `vsce publish --pre-release`.**

### Version Format Constraints

The Marketplace only accepts `N.N.N` format — no semver pre-release suffixes:
- ❌ `1.1.0-next.1` — rejected
- ✅ `1.1.1` — accepted (odd minor = pre-release convention)
- ✅ `1.0.1` — accepted (odd patch = pre-release, when using `vsce --pre-release`)

### Odd/Even Convention

VS Code docs recommend:
- `major.EVEN.patch` → stable (1.0.x, 1.2.x)
- `major.ODD.patch` → pre-release (1.1.x, 1.3.x)

Our extension uses `1.0.1` (odd patch, even minor) — valid but non-standard. Script updated.

### vsce requires VSCE_PAT env var

```bash
export VSCE_PAT=<azure-devops-personal-access-token>
# Scope: Marketplace → Manage
(cd packages/extension && npx @vscode/vsce publish --pre-release --no-dependencies)
```

## Actions Taken

- Updated `scripts/publish-next.sh` to include `vsce publish --pre-release` step
- Added `publish:next` script to `packages/extension/package.json`
- Added `VSCE_PAT` check to pre-flight in publish script
- Documented mixed version strategy (npm: 1.1.0-next.1, extension: 1.0.1)
