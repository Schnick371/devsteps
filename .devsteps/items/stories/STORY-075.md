# User Story

**As a** DevSteps user (especially AI agents like GitHub Copilot)  
**I want** to perform batch operations on multiple work items simultaneously  
**So that** I can reduce token usage by 50-70%, improve execution speed by 40-60%, and work more efficiently with parallel workflows.

## Background

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

## Acceptance Criteria

### CLI Batch Operations
- [ ] `devsteps add --batch items.json` - Create multiple items from JSON file
- [ ] `devsteps link TASK-001 TASK-002 TASK-003 --to STORY-069` - Link multiple items (variadic args)
- [ ] `devsteps update TASK-001 TASK-002 --status done` - Bulk status updates
- [ ] Support for pipe input: `cat task-ids.txt | devsteps update --status done`
- [ ] Detailed progress reporting: `[3/5] Created TASK-198, [4/5] Failed TASK-199: Duplicate title`

### MCP Batch Tools
- [ ] `mcp_devsteps_add_batch` - Create multiple items in one call
- [ ] `mcp_devsteps_update_batch` - Update multiple items atomically
- [ ] `mcp_devsteps_link_batch` - Create multiple relationships
- [ ] Follow JSON-RPC 2.0 batching specification (MCP requirement)
- [ ] Response format includes success/failure per item

### Error Handling Strategy
- [ ] **Best-effort approach:** Continue on partial failures, report all results
- [ ] `stopOnError` option for atomic all-or-nothing behavior
- [ ] Pre-flight validation: Check for duplicate IDs, invalid references
- [ ] Idempotency: Prevent duplicate items if batch is retried
- [ ] Rollback support: Compensating transactions for atomic mode

### Transaction Guarantees
- [ ] Per-file atomic writes (leverages refs-style index from EPIC-018)
- [ ] Example: Adding 5 tasks to `by-type/tasks.json` = 1 atomic write operation
- [ ] No partial state: Either all items added to index or none
- [ ] Lock-based concurrency control for index updates

### Performance Targets
- [ ] Batch of 10 items: <500ms total execution
- [ ] Batch of 100 items: <3s total execution
- [ ] Memory efficient: Stream processing for large batches
- [ ] Token usage: 50%+ reduction vs sequential calls

## Examples

### CLI Usage
```bash
# Batch creation from JSON
cat > batch-tasks.json << EOF
[
  {"type": "task", "title": "Implement batch-add tool", "priority": "high"},
  {"type": "task", "title": "Add CLI batch support", "priority": "high"},
  {"type": "task", "title": "Write batch tests", "priority": "medium"}
]
EOF
devsteps add --batch batch-tasks.json --parent STORY-075

# Variadic linking
devsteps link TASK-198 TASK-199 TASK-200 --to STORY-075 --relation implements

# Bulk status update
devsteps update TASK-150 TASK-151 TASK-152 --status done --assignee dev@example.com
```

### MCP Usage
```typescript
// Batch item creation
const result = await mcp_devsteps_add_batch({
  items: [
    { type: "task", title: "Task 1", priority: "high" },
    { type: "task", title: "Task 2", priority: "medium" }
  ],
  parentId: "STORY-075",
  stopOnError: false  // Continue on failures
})

// Response format
{
  success: true,
  total: 2,
  successful: 2,
  failed: 0,
  results: [
    { id: "TASK-198", status: "created", item: {...} },
    { id: "TASK-199", status: "created", item: {...} }
  ]
}

// Batch linking
await mcp_devsteps_link_batch({
  links: [
    { source: "TASK-198", target: "STORY-075", relation: "implements" },
    { source: "TASK-199", target: "STORY-075", relation: "implements" }
  ]
})
```

## Technical Architecture

### Batch Operations Core (`packages/shared/src/core/batch-operations.ts`)
```typescript
export interface BatchOperation<T> {
  items: T[]
  stopOnError?: boolean
  maxConcurrent?: number  // For parallel processing
}

export interface BatchResult<T> {
  success: boolean
  total: number
  successful: number
  failed: number
  results: Array<{
    id?: string
    status: 'created' | 'updated' | 'failed'
    error?: string
    item?: T
  }>
}

export class BatchOperationExecutor {
  async executeBatch<T>(
    operation: (item: T) => Promise<any>,
    config: BatchOperation<T>
  ): Promise<BatchResult<T>>
}
```

### Integration Points
1. **CLI:** Extend `packages/cli/src/commands/bulk.ts`
2. **MCP:** New tools in `packages/mcp-server/src/tools/batch-*.ts`
3. **Shared:** Core logic in `packages/shared/src/core/batch-operations.ts`
4. **Validation:** Schemas in `packages/shared/src/schemas/batch.schema.ts`

## Dependencies
- **EPIC-018:** Refs-style index enables atomic batch updates (relates-to)
- **STORY-069:** Foundation for batch operations on new index structure (depends-on)

## Success Metrics
- 50%+ reduction in token usage for multi-item operations
- 40%+ reduction in execution time vs sequential calls
- Zero merge conflicts during parallel batch operations
- Successful batch of 100 items in <3 seconds

## Testing Strategy
- Unit tests: Batch executor with various failure scenarios
- Integration tests: CLI + MCP batch operations
- Performance tests: 10, 50, 100, 500 item batches
- Conflict tests: Parallel batches on refs-style index
- Error recovery tests: Rollback on atomic mode

## References
- **MCP 2025-11-25 Spec:** JSON-RPC 2.0 batching (mandatory)
- **MCP BatchIt:** Open-source reference implementation (ryanjoachim/mcp-batchit)
- **AWS CLI:** Batch patterns (`--resources id1 id2`)
- **Shopify GraphQL:** 100 items in 1 mutation pattern
- **Research:** 8 Tavily searches, 80+ sources on batch operations best practices
