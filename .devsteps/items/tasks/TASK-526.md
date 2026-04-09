Create the `devsteps artifacts archive <file> [--item-id <ID>]` subcommand. Process:
1. Validate the file exists in tmp/
2. Execute git mv to docs/research/
3. If --item-id given: create DOC item via MCP tool mcp_devsteps_add (type: doc), link it to the specified item via documents relation
4. Validate that the target item ID exists before creating the DOC item

Affected: packages/cli/src/commands/artifacts.ts, packages/shared/src/core/artifacts.ts (shared logic)