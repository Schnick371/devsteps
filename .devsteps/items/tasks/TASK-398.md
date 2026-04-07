Add 4 prompts to `packages/mcp-server/src/handlers/prompts.ts` (existing file with 3 prompts already).

Prompts to add:
1. `devsteps-docs-diataxis-explain` — explain Diataxis quadrant for a given doc path
2. `devsteps-docs-write-howto` — scaffold a how-to guide for a task
3. `devsteps-docs-write-reference` — scaffold a reference page for an API/config
4. `devsteps-docs-classify` — classify an existing .md file into Diataxis type

Pattern: add to DEVSTEPS_PROMPTS[] array + switch case in handler (matching existing file structure)4 MCP prompts added to prompts.ts. Commit: ea6f2f8