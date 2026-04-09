## User Value

**As a** DevSteps user,  
**I want** the extension and CLI to detect corrupt or inconsistent data in `.devsteps/` early,
**so that** data problems surface as actionable warnings rather than silent failures.

## Motivation

BUG-032 had a self-implements link (`implements: ["BUG-032"]`) for months. This went
undetected and, when the extension processed all 1025 items including new DOC items,
caused a silent stack overflow that wiped the flat view. A health check subsystem would
have caught this at item creation time or on extension activation.

## Checks to Implement

### Structural invariants
1. **Self-implements** — item A implements A (direct self-loop)
2. **Circular implements chain** — A→B→C→A (depth ≤ 10 per traversal)
3. **Index consistency** — every ID in `by-type/*.json` has a corresponding `.json` file
4. **Type/directory mismatch** — item with `type: bug` in `items/stories/`
5. **Unknown item type** — type not in allowed_types from config
6. **Missing required fields** — id, type, status, eisenhower null/absent

## Delivery Surface

- **Extension** — run on activation, show warning notification if any check fails
- **CLI** — `devsteps doctor` command with exit code 1 on failure
- **MCP** — `mcp_devsteps_doctor` tool returning structured check results
- **Shared** — core validation logic in `packages/shared/src/core/doctor.ts`

## Affected Paths
- packages/shared/src/core/doctor.ts (new — core validation logic)
- packages/cli/src/commands/doctor.ts (new — CLI command)
- packages/mcp-server/src/tools/doctor.ts (new — MCP tool)
- packages/extension/src/extension.ts (activate hook — run health check)