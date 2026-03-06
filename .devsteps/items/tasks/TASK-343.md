## Context

STORY-123 was deferred from SPRINT-PUBLISH because it depends on STORY-122 API being frozen first (now done: startHttpMcpServer(port, workspacePath) finalized).

## What needs to be built

### 1. Node.js SEA binary for Cursor / bare stdio clients

- Create `.sea.json` config: `useCodeCache: false`, `useSnapshot: false` (mandatory for cross-platform)
- Add `scripts/build-sea.sh` for building platform binaries
- Build matrix: ubuntu-latest, macos-latest, windows-latest
- Binary size target: ~35–45 MB per platform
- Output: GitHub Release assets (NOT embedded in VSIX)
- Extension: first-run download to `context.globalStorageUri`

### 2. MCPB bundle for Claude Desktop

- Claude Desktop ships its own Node.js → use `npx @anthropic-ai/mcpb pack` (not SEA)
- Output: `.mcpb` bundle file
- Update `README.md` with Claude Desktop config instructions

### 3. CI/CD matrix

GitHub Actions workflow:
```yaml
jobs:
  build-binaries:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
```

## References

- Research: `.devsteps/cbp/SPRINT-PUBLISH/a3f7e2d1-8b4c-4e9a-b162-7d3f51c8e4a9.result.json`
- Risk analysis: `.devsteps/cbp/SPRINT-PUBLISH/a7f3c1d2-5b8e-4f92-9e04-c6d7a0b13e51.result.json`

## Acceptance Criteria

- [ ] `scripts/build-sea.sh` creates binaries for linux/mac/win
- [ ] `.sea.json` config present with required safety flags
- [ ] `packages/cli/` has updated `bin/` section pointing to SEA binary
- [ ] Claude Desktop `mcpServers` config documented in README
- [ ] VSIX size unchanged (binaries distributed separately)