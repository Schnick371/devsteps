Create the `devsteps artifacts clean` subcommand. Features:
- Default TTL: 30 days
- --older-than <days>: override TTL
- --dry-run: print what would be archived without acting
- Archive target: tmp/archive/YYYY-MM/ subdirectory (never direct deletion)
- Atomic move via fs.rename
- Protection: never touch docs/research/ or .devsteps/ files

Affected: packages/cli/src/commands/artifacts.ts