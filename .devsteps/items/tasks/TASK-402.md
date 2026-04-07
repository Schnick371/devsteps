## Status: Accepted (2026-04-03)

> **Note:** This item should be re-typed to `doc` once the MCP server is rebuilt (crud.ts already includes `doc` enum — server needs restart after `npm run build`).

## Context
The SPIKE-043 plan mentioned `--interactive` but had no behavioral spec. Research showed that CLI readline loops are the wrong abstraction for classification dialogs: they cannot reason about document content.

## Decision
Mixed-type classification is delegated to Copilot via MCP prompt:
1. `devsteps docs import` dry-run flags mixed files with `⚠ MIXED` indicator
2. CLI optionally emits a summary: "3 files need manual classification. Run: copilot chat /devsteps-docs-classify --excerpt 'paste file content'"
3. The `devsteps-docs-classify` MCP prompt conducts the 3-question Diataxis interview
4. Copilot's answer is applied as --type override: `devsteps docs import ./path --override README.md=how-to`
5. DOC items store `metadata.classification_signals: string[]` for future `devsteps docs split` capability

## Consequences
- No Inquirer.js dependency in CLI (bundle size stays minimal)
- Requires Copilot + MCP server (not usable in pure CLI-only mode)
- `--override key=value` flag must be added to docs import command (TASK-396 update)
- classification_signals stored in metadata enables future split without re-scan