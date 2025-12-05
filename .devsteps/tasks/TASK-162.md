## Objective

Update `linkTool` description in Extension's embedded MCP server tools.

## Files

- `packages/extension/src/mcp-server/tools/index.ts` (line ~233)

## Changes

Same as MCP Server package - update linkTool description to show Bug as child of Story/Feature only.

**Current:**
```
Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task
```

**Correct:**
```
Epic→Story|Spike, Story→Task, Bug→Task. Story→Bug (blocks)
```

## Validation

- Extension builds successfully
- No TypeScript errors in extension package