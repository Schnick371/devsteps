## Objective

Update `linkTool` description in MCP server tool definitions to reflect correct Bug hierarchy.

## Files

- `packages/mcp-server/src/tools/index.ts` (line ~233)

## Changes

**Current description:**
```
HIERARCHY RULES (implements): Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task, Spike→Task. Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task, Spike→Task.
```

**Correct description:**
```
HIERARCHY RULES (implements): Scrum: Epic→Story|Spike, Story→Task, Bug→Task, Spike→Task. Story→Bug (blocks). Waterfall: Requirement→Feature|Spike, Feature→Task, Bug→Task, Spike→Task. Feature→Bug (blocks).
```

## Validation

- Build passes: `npm run build`
- No TypeScript errors
- Description matches validation.ts logic