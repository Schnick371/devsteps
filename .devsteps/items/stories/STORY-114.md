# Update Copilot Files — Safe Post-Install Update

## Problem Statement

When a new devsteps version is installed, the `.github/agents/devsteps-*.agent.md`, `.github/instructions/devsteps-*.instructions.md`, and `.github/prompts/devsteps-*.prompt.md` files in existing workspaces remain **outdated forever**.

The current `copyGithubFiles()` function in `shared/utils/init-helpers.ts` is called **only during `devsteps-init`**. The `initHandler` has a hard guard:
```typescript
if (existsSync(devstepsDir)) {
  throw new Error('Project already initialized...');
}
```
There is **no mechanism** to update managed Copilot files after initialization. Neither MCP tools nor CLI commands offer this capability.

## Research Findings (7-Agent Deep Analysis, 2026-02-23)

### Industry Patterns Evaluated
- **Yeoman Conflictor**: Per-file interactive prompt — appropriate for `--interactive` mode
- **Three-way merge (git merge-file)**: Mathematically correct — BASE + theirs + ours; requires stored BASE
- **Vendor-lock / @generated markers**: Clear ownership semantics; projen approach
- **Hash-based modification detection (Ansible model)**: SHA-256 of install-time content stored in manifest → compare current hash → if diverged, user modified
- **YAML frontmatter version embedding**: `devsteps_version` + `devsteps_hash` fields in managed files

### Chosen Approach: Hash Manifest + YAML Frontmatter + Timestamped Backup

**Modification detection** (hybrid, two independent signals cross-validated):
1. `.devsteps/.github-manifest.json` — machine-authoritative, stores `canonical_hash` (hash of file content MINUS devsteps-injected fields → no circularity)
2. YAML frontmatter fields `devsteps_managed: true`, `devsteps_version: "x.y.z"`, `devsteps_hash: "sha256:..."` — self-describing, survives manifest deletion, human-readable

**Algorithm**:
- `canonical_hash = sha256(file_content MINUS devsteps frontmatter fields)`
- If `current_hash == manifest_hash AND == embedded_hash` → **clean, safe to overwrite**
- If either differs → **user-modified → skip (warn) or --force**
- If manifest missing but embedded hash matches → **medium confidence clean**

**Backup location**: `.devsteps/backups/github-YYYY-MM-DDTHH-MM-SS/` (keep last 5)
- Rationale: `.devsteps/` is project state directory; `.github/.bak/` pollutes IDE Copilot detection
- Include `manifest.json` in backup with checksums for restore integrity verification
- Backup failure → **abort update** (partial updates are worse than stale files)
- Add `.devsteps/backups/` to `.gitignore`

## Risk Decisions

| Risk | Decision |
|---|---|
| User-modified files | Skip by default, warn. `--force` to overwrite. |
| Deleted files | Track `deleted: true` in manifest. Never auto-restore. |
| Removed from new version | Never auto-delete. Add deprecation comment only. |
| Partial updates (crash mid-run) | Write all to staging first, then atomic rename |
| Broken cross-references | Treat bundle atomically — all-or-none per category |
| Dirty git state | Warn, do not block. Offer `--auto-commit` flag. |

## Interface Design

### MCP Tool: `update_copilot_files`

**Parameters:**
- `scope: string[]` — `['agents', 'instructions', 'prompts']` (default: all)
- `dry_run: boolean` — preview changes without writing (default: false)
- `force: boolean` — overwrite user-modified files (default: false)
- `backup: boolean` — create timestamped backup before update (default: true)
- `project_path: string?` — workspace root (default: cwd)

**Returns:**
```json
{
  "summary": { "total": 49, "updated": 12, "skipped_user_modified": 3, "skipped_unchanged": 34, "backup_path": "..." },
  "files": [{ "path": "...", "status": "updated|skipped_modified|skipped_unchanged", "user_modified": false }],
  "dry_run": false,
  "devsteps_version": "1.1.0"
}
```

### CLI: `devsteps update-copilot-files [options]`

**Flags**: `--scope`, `--dry-run`, `--force`, `--no-backup`, `--path`, `--json`, `--auto-commit`

## Affected Components

### New Files (3)
| File | Purpose |
|---|---|
| `packages/shared/src/utils/backup-github-files.ts` | `backupGithubFiles()` with rotation, manifest, integrity check |
| `packages/shared/src/utils/update-copilot-files.ts` | `updateCopilotFiles()` with hash detection, 3-way skip logic |
| `packages/mcp-server/src/handlers/update-copilot-files.ts` | MCP handler, resolves packageRoot via `fileURLToPath` |
| `packages/cli/src/commands/update-copilot-files.ts` | CLI command with chalk/ora output |

### Modified Files (5)
| File | Change |
|---|---|
| `packages/shared/src/utils/init-helpers.ts` | Inject `devsteps_managed`, `devsteps_version`, `devsteps_hash` into YAML frontmatter during `copyGithubFiles()` |
| `packages/shared/src/utils/index.ts` | Export new utility functions |
| `packages/mcp-server/src/tools/system.ts` | Add `updateCopilotFilesTool` definition |
| `packages/mcp-server/src/tools/index.ts` | Re-export new tool |
| `packages/cli/src/index.ts` | Register `update-copilot-files` command |

Note: MCP server.ts does NOT need modification — dynamic handler dispatch `import('./handlers/${toolName}.js')` resolves automatically.

## Acceptance Criteria

- [ ] `devsteps-update-copilot-files` MCP tool available and documented
- [ ] `devsteps update-copilot-files` CLI command works
- [ ] Files modified by user are detected via hash comparison and skipped by default
- [ ] `--dry-run` shows exactly what would change without writing
- [ ] `--force` overwrites user-modified files
- [ ] Backup created in `.devsteps/backups/github-<timestamp>/` before any write
- [ ] Backup limited to last 5 (old ones pruned)
- [ ] Backup failure aborts update (no partial state)
- [ ] `copyGithubFiles()` (init path) injects `devsteps_hash` + `devsteps_version` into YAML frontmatter
- [ ] `.github-manifest.json` created/updated in `.devsteps/`
- [ ] `.devsteps/backups/` added to `.gitignore` by init
- [ ] CLI output: table with updated/skipped/unchanged per file
- [ ] MCP output: structured JSON with summary + per-file status