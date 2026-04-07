Existing projects have no `items/docs/` directory, no `docs.json` in the by-type index, and no `DOC` key in `counters.json`.

Implement a one-time migration that:
1. Creates `.devsteps/items/docs/` directory
2. Creates `.devsteps/index/by-type/docs.json` (empty items array)
3. Adds `DOC: 0` to `.devsteps/index/counters.json`
4. Git-commits the migration as `chore(storage): init docs directory and index for doc item type`

Migration should be idempotent (safe to run twice). Can be CLI command `devsteps migrate` or inline in `devsteps init --repair`.

**Depends on:** BUG-075 (7 DOC defects fix) being merged first.Done: ensureFullMigration phase 4 added + current project migrated. Commit 69d8e35.