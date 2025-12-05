## Objective

Update CLI `link` command description to reflect correct Bug hierarchy.

## Files

- `packages/cli/src/index.ts` (line ~91)

## Changes

**Current:**
```
HIERARCHY (implements): Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task. Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task.
```

**Correct:**
```
HIERARCHY (implements): Scrum: Epic→Story|Spike, Story→Task, Bug→Task. Story→Bug (blocks). Waterfall: Requirement→Feature|Spike, Feature→Task, Bug→Task. Feature→Bug (blocks).
```

## Validation

- CLI builds successfully
- Help text shows correct hierarchy: `devsteps link --help`
- No TypeScript errors