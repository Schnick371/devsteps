Add `--import-docs <path>` optional flag to `devsteps init` command.
After project initialization completes, if flag is provided, invoke the docs import flow.

Implementation: parse flag in `packages/cli/src/commands/init.ts`, call docsImport(path, { dryRun: false, yes: false }) after ensureFullMigration()Implemented: `--import-docs <path>` flag added to `devsteps init`. Uses dynamic import for lazy loading. Commit 0890cc5."