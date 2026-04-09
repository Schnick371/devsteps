Implement a new top-level CLI subcommand for managing agent output artifacts in tmp/. Three commands:
1. devsteps artifacts status — table view of tmp/ files by category/age/size/linked-item, orphan count
2. devsteps artifacts clean [--older-than <days>] [--dry-run] — archives files past TTL (default 30d)
3. devsteps artifacts archive <file> [--item-id <ID>] — promotes file to docs/research/ via git mv, creates DOC item with documents relation

Affected: packages/cli/src/commands/ (new artifacts command), packages/shared/src/core/ (artifact management logic)

Note: Never delete directly — always archive to tmp/archive/YYYY-MM/ first.