## Task

Add `devsteps update-copilot-files` CLI command.

## New File: `packages/cli/src/commands/update-copilot-files.ts`

Mirror pattern of setup.ts (chalk + ora):
```typescript
export async function updateCopilotFilesCommand(options: {
  scope?: string[];
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
  path?: string;
  json?: boolean;
  autoCommit?: boolean;
}): Promise<void>
```

### Implementation
- Resolve `sourceGithubDir`: locate mcp-server package's `.github/` via `import.meta.resolve('@schnick371/devsteps-mcp-server/package.json')` → replace `package.json` with `.github/`
- Call `updateCopilotFiles({ sourceGithubDir, projectRoot: options.path || cwd, ... })`
- Render with chalk/ora:

```
DevSteps Copilot Files Update (v1.1.0)

  ✔ Updated   agents/devsteps-t1-coordinator.agent.md
  ⚠ Skipped   agents/devsteps-t2-impl.agent.md  (user-modified)
  – Unchanged  instructions/devsteps-code-standards.instructions.md

  ─────────────────────────────────────────────
  Updated: 12   Skipped (modified): 3   Unchanged: 34

  Backup: .devsteps/backups/github-2026-02-23T22-00-00/

  3 files were NOT updated (user-modified):
    • .github/agents/devsteps-t2-impl.agent.md
  Rerun with --force to overwrite, or update manually.
```

- If `--json`: output `JSON.stringify(result, null, 2)` instead
- If `--dry-run`: prefix output with `[DRY RUN]`, no files written

## Modify `packages/cli/src/index.ts`

```typescript
program
  .command('update-copilot-files')
  .description('Update devsteps-managed .github Copilot files to installed package version')
  .option('--scope <groups>', 'Comma-separated: agents,instructions,prompts (default: all)')
  .option('--dry-run', 'Preview changes without writing')
  .option('--force', 'Overwrite user-modified files')
  .option('--no-backup', 'Skip creating a backup')
  .option('--path <dir>', 'Workspace root path (default: cwd)')
  .option('--json', 'Output JSON for scripting')
  .option('--auto-commit', 'Create a git commit after successful update')
  .action(async (options) => {
    const { updateCopilotFilesCommand } = await import('./commands/update-copilot-files.js');
    await updateCopilotFilesCommand({
      scope: options.scope?.split(','),
      dryRun: options.dryRun,
      force: options.force,
      backup: options.backup !== false,
      path: options.path,
      json: options.json,
      autoCommit: options.autoCommit,
    });
  });
```