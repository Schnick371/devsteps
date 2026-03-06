## Problem

No `.vscodeignore` file exists in `packages/extension/`. Without it, `npm run package` includes:
- `node_modules/` (hundreds of MB)
- `.devsteps/research/` (research documents with potentially sensitive internal findings)
- Test files, source maps, dev configs

This violates VS Code Marketplace guidelines and the Wiz Research finding (Oct 2025) that 550+ VSIX packages ship secrets in bundled files.

## Required Content

 Minimum `.vscodeignore`:
```
node_modules/**
.vscode-test/**
src/**
esbuild.js
esbuild.mjs
tsconfig.json
*.map
.devsteps/**
.github/**
scripts/**
tests/**
```

## Validation
- `npm run package` in `packages/extension/`
- Verify VSIX file size < 10MB
- `unzip -l *.vsix | grep node_modules` → empty
- `unzip -l *.vsix | grep .devsteps` → empty

## References
- Research: `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` §Security Assessment QG-21
- Wiz Research Oct 2025: 550+ secrets in VSIX files