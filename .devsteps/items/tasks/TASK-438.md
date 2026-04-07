Wire the `exportCommand` stub in `packages/cli/src/commands/search-commands.ts` (lines ~149–162) to the actual `exportHandler` from `packages/shared/src/core/export.ts`. Import `exportHandler` and pass `devstepsDir` + options (output path, `heading_offset_mode` from CLI flag `--heading-mode`). Add a `--heading-mode` flag to the CLI's `export` command definition (parsing in `packages/cli/src/index.ts` or wherever the export command is registered) accepting `'auto' | 'manual' | 'none'` with default `'none'`. Remove stub `spinner.succeed('Export completed')` and replace with real output stats (files written, item count).

Pre-condition: TASK-437 (export.ts handler) must be complete.

## Acceptance Criteria
- `devsteps export` no longer emits a stub; writes actual markdown to default output path
- `devsteps export --output custom.md --heading-mode auto` writes to `custom.md` with level adjustments
- `devsteps export --help` shows `--heading-mode` flag documentation