## Objective

Update all tool descriptions and resource documentation in MCP server, Extension, and CLI packages to reflect correct Bug hierarchy: Bug is ONLY child of Story/Feature, never Epic/Requirement.

## Scope

**Files to Update:**
1. `packages/mcp-server/src/tools/index.ts` - linkTool description
2. `packages/mcp-server/src/index.ts` - hierarchy resource description
3. `packages/extension/src/mcp-server/tools/index.ts` - linkTool description
4. `packages/cli/src/index.ts` - link command description

**Changes:**
- Current: `Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task`
- Correct: `Epic→Story|Spike, Story→Task, Story→Bug (blocks), Bug→Task`

## Rationale

Validation logic already correct (Bug→Story/Feature only), but tool/command descriptions still reference old hierarchy where Bug could be child of Epic. This creates confusion between documentation and actual validation behavior.

## Success Criteria

- ✅ All tool descriptions match validation logic
- ✅ CLI help text shows correct hierarchy
- ✅ MCP resource descriptions accurate
- ✅ Build passes with no errors
- ✅ No TypeScript compilation issues