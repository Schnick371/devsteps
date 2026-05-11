# ADR-002 — Mixed-type dialog is MCP prompt (Copilot-led), not CLI readline

**Status:** Accepted  
**Date:** 2026-04-03  
**Supersedes:** None  
**Relates to:** STORY-236, TASK-398, SPIKE-043

---

## Context

The SPIKE-043 plan mentioned a `--interactive` flag but provided no behavioural specification. Research showed that CLI `readline` loops are the wrong abstraction for classification dialogs: they cannot reason about document content. A user being asked "is this a tutorial or a how-to?" still has to read the file themselves to answer — the CLI adds no value over a manual override flag.

Copilot, by contrast, can read the file content as part of the same conversation and answer the question directly.

## Decision

Mixed-type classification is delegated to Copilot via an MCP prompt:

1. `devsteps docs import` dry-run flags mixed files with a `⚠ MIXED` indicator.
2. CLI optionally emits a summary: _"3 files need manual classification. Run: `copilot chat /devsteps-docs-classify --excerpt 'paste file content'`"_.
3. The `devsteps-docs-classify` MCP prompt conducts the 3-question Diataxis interview.
4. Copilot's answer is applied as a `--type` override:
   `devsteps docs import ./path --override README.md=how-to`
5. DOC items store `metadata.classification_signals: string[]` for future `devsteps docs split` capability.

## Consequences

- No `Inquirer.js` dependency in the CLI — bundle size stays minimal.
- Requires Copilot + MCP server; not usable in pure CLI-only mode (acceptable trade-off — pure CLI users can pass `--type` directly without the dialog).
- `--override key=value` flag must be added to `docs import` command (tracked under TASK-396 update).
- `classification_signals` stored in metadata enables future `devsteps docs split` without a re-scan.
