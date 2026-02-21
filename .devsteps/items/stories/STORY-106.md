# CLI Init: analysis/ Directory

Extend the CLI `init` command to create the `.devsteps/analysis/` directory with a `.gitignore` that excludes analysis envelopes from version control.

## Acceptance Criteria

- `'analysis'` added to directory list in `packages/cli/src/commands/init.ts`
- `.devsteps/analysis/.gitignore` created by init (excludes `*.json` envelope files)
- Existing projects can run `devsteps init` to retroactively create the directory