## Problem

`devsteps doctor` in the CLI performs comprehensive data integrity checks (asymmetric links, orphaned items, broken references, JSON validation, index ↔ item consistency). However, an AI agent has **no MCP access** to these checks — `mcp_devsteps_health` only reports server runtime status, not data consistency.

**Consequence:** After a branch merge, crash, or direct file edits, no agent can automatically detect whether the `.devsteps/` index is corrupted. The agent receives `healthy` — and then fails at the first read operation with confusing errors.

## Goal

`mcp_devsteps_doctor` as a full MCP tool that executes the same checks as the CLI — callable by AI agents, CI pipelines, and the VS Code extension.

## Acceptance Criteria

- [ ] New function `runDoctorChecks(devstepsDir, opts?)` in `packages/shared/src/core/` extracted from CLI `doctor-integrity.ts` + `doctor-checks.ts`
- [ ] `mcp_devsteps_doctor` tool registered in `packages/mcp-server/src/tools/system.ts`
- [ ] Handler in `packages/mcp-server/src/handlers/` delegates to shared function
- [ ] Return type: `{ status: 'healthy'|'warning'|'critical', checks: CheckResult[], summary: string, fixable: string[] }`
- [ ] CLI `devsteps doctor` imports `runDoctorChecks` from shared (DRY — no duplicated code)
- [ ] Option `dry_run: boolean` — run checks without auto-fix
- [ ] Option `auto_fix: boolean` — automatically repair asymmetric links + index rebuild (default: false, NEVER default true in MCP)
- [ ] Tool appears in `mcp_devsteps_context` tool catalog

## Checks Covered (migrated from CLI)

| Check | Source | Severity |
|---|---|---|
| JSON files valid | `doctor-checks.ts` | CRITICAL |
| Index↔Items consistent | `doctor-integrity.ts` | CRITICAL |
| Asymmetric bidirectional links | `doctor-integrity.ts` | WARNING |
| Orphaned items (no parent, not Epic) | `doctor-integrity.ts` | WARNING |
| Broken references (ID does not exist) | `doctor-integrity.ts` | CRITICAL |
| Context files stale | new | WARNING |
| CBP directory structure | new | INFO |

## Agent Usage Pattern

```
T1 after branch merge: mcp_devsteps_doctor({ dry_run: true })
→ status: "warning", checks: [{ name: "asymmetric-links", ... }]
→ mcp_devsteps_doctor({ auto_fix: true })
→ status: "healthy"
```