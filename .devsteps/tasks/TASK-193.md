# Generate ULID on Item Creation

## Objective

Update all item creation logic (CLI, MCP server) to generate and store ULID.

## Implementation

### 1. CLI Commands (packages/cli/src/commands/bulk.ts)

```typescript
import { ulid } from 'ulid';

async function createItem(data: CreateItemData) {
  const now = new Date().toISOString();
  const itemUlid = ulid(); // Generate ULID
  
  const item: DevStepsItem = {
    id: generateId(data.type),    // TASK-001
    ulid: itemUlid,               // 01EQXGPFY8...
    type: data.type,
    title: data.title,
    status: 'draft',
    priority: data.priority || 'medium',
    eisenhower: data.eisenhower || 'not-urgent-important',
    
    // Timestamps
    created: now,
    modified: now,
    version: 1,                   // Initial version
    
    // Authorship
    created_by: data.author,
    modified_by: data.author,
    
    // ... rest of fields
  };
  
  // Save to file
  await writeItemFile(item);
}
```

### 2. MCP Server (packages/mcp-server/src/tools/add.ts)

Apply same logic to MCP add tool.

### 3. Update Existing Creation Points

- `packages/cli/src/commands/init.ts` (initial items)
- `packages/mcp-server/src/tools/add.ts` (MCP tool)
- Any test fixtures that create items

## Validation

- [ ] New items have valid ULID
- [ ] `created` timestamp matches ULID timestamp (within ~1ms)
- [ ] `modified` equals `created` on creation
- [ ] `version` starts at 1
- [ ] ULID is unique across concurrent creations
- [ ] Existing tests pass with new fields

## Testing

```typescript
// Test concurrent creation
const items = await Promise.all([
  createItem({ type: 'task', title: 'A' }),
  createItem({ type: 'task', title: 'B' }),
  createItem({ type: 'task', title: 'C' }),
]);

// All ULIDs must be unique
const ulids = items.map(i => i.ulid);
assert(new Set(ulids).size === 3);

// ULIDs should be sortable by creation time
assert(ulids[0] < ulids[1] < ulids[2]);
```

## Dependencies

- Requires TASK-192 (schema update) completed first