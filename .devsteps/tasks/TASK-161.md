## Objective

Update hierarchy resource description in MCP server index file.

## Files

- `packages/mcp-server/src/index.ts` (line ~248)

## Changes

**Current:**
```
Work item hierarchy for Scrum (Epic→Story|Spike|Bug→Task) and Waterfall (Requirement→Feature|Spike|Bug→Task)
```

**Correct:**
```
Work item hierarchy for Scrum (Epic→Story|Spike, Story→Bug→Task) and Waterfall (Requirement→Feature|Spike, Feature→Bug→Task)
```

## Validation

- Build passes
- MCP resource documentation accurate