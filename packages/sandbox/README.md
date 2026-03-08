# @devsteps/sandbox

**Private research package — never published to npm.**

This package is the home for experimental features and research prototypes that are part of the devsteps monorepo workspace but are explicitly excluded from any release process.

## Purpose

- Experimental code that may or may not graduate to a production package
- Integration tests for research concepts (e.g. local GPU inference, new agent patterns)
- Python/polyglot code that doesn't fit the TypeScript production packages

## Rules

- `"private": true` in `package.json` permanently prevents `npm publish`
- Nothing in this package is included in VSIX, npm, or any distribution artifact
- No production package (`shared`, `cli`, `mcp-server`, `extension`) may import from here
- If a feature matures into a production decision, extract it into the appropriate published package

## Current Research Areas

| Area | Status | Reference |
|---|---|---|
| Local GPU inference (Ollama + CUDA) | Research-only | [SPIKE-032](.devsteps/research/SPIKE-032/R4-research-brief.md) |
| Spider Web AITK Agent Inspector integration | Research-only | [SPIKE-032](.devsteps/research/SPIKE-032/R4-research-brief.md) |
