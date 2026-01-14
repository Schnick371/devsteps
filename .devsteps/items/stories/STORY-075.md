# User Story

**As a** DevSteps user (especially AI agents like GitHub Copilot)  
**I want** to perform batch operations on multiple work items simultaneously  
**So that** I can reduce token usage by 50-70%, improve execution speed by 40-60%, and work more efficiently with parallel workflows.

## Status: CANCELLED

Branch `story/STORY-075-strengthen-prompts` archived to `archive/abandoned/` - contained old Copilot file improvements that are now outdated by current .github/ structure.

The batch operations feature described in this story remains valid but was never implemented. The archived branch contained unrelated work (copilot file fixes).

---

## Original Description

[Original content preserved for reference]

Current implementation requires sequential tool calls for each operation:
```typescript
// Sequential: High token cost, slow execution
await mcp_devsteps_add({ type: "task", title: "Task 1" })
await mcp_devsteps_add({ type: "task", title: "Task 2" })
await mcp_devsteps_add({ type: "task", title: "Task 3" })
await mcp_devsteps_link({ source: "TASK-001", target: "STORY-069" })
await mcp_devsteps_link({ source: "TASK-002", target: "STORY-069" })
```

**Research findings (8 Tavily searches, 80+ sources):**
- **MCP 2025-11-25 Spec:** JSON-RPC 2.0 batching is **mandatory**
- **Token savings:** 50-70% reduction (Smart Context Optimizer study)
- **Performance:** 40-60% latency reduction (MCP BatchIt)
- **Industry standard:** AWS CLI, Shopify GraphQL, GitHub API use batching
- **Refs-style index (EPIC-018):** Enables atomic batch writes without conflicts

This feature should be re-planned if needed in the future.