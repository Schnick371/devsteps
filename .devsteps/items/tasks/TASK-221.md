## Objective

Document new relationship management capabilities: API reference, CLI usage, architecture decisions.

## Documentation Updates

### 1. MCP Server README

**File**: `packages/mcp-server/README.md`

Add to Tools section:
```markdown
#### devsteps_unlink

Remove a relationship between two items. Atomically removes both directions.

**Parameters:**
- `source_id` (string): Source item ID
- `relation_type` (string): Relationship type to remove
- `target_id` (string): Target item ID

**Returns:**
```json
{
  "success": true,
  "source_id": "STORY-042",
  "target_id": "TASK-216",
  "relation": "implements",
  "message": "Removed STORY-042 --implements--> TASK-216"
}
```

**Note:** Idempotent - safe to call even if link doesn't exist.
```

### 2. CLI README

**File**: `packages/cli/README.md`

Add to Commands section:
```markdown
#### unlink

Remove a relationship between two items.

**Usage:**
```bash
devsteps unlink <source-id> <relation> <target-id>
```

**Examples:**
```bash
# Remove story→task implementation
devsteps unlink STORY-042 implements TASK-216

# Remove dependency
devsteps unlink TASK-215 depends-on TASK-214

# Remove blocking relationship
devsteps unlink BUG-023 blocks STORY-039
```

**Note:** Atomically removes both source→target and target→source links.
```

### 3. Shared Package README

**File**: `packages/shared/README.md`

Add to Core Modules section:
```markdown
#### relationships.ts

Centralized relationship management with atomic operations.

**Functions:**
- `createLink(devstepsDir, sourceId, targetId, relationType)` - Create bidirectional link
- `removeLink(devstepsDir, sourceId, targetId, relationType)` - Remove bidirectional link
- `getRelatedItems(devstepsDir, itemId, relationTypes)` - Query related items
- `traverseRelationships(devstepsDir, itemId, options)` - Traverse relationship graph

**Design Principles:**
- Atomic operations (both directions succeed or fail)
- Idempotent (safe to repeat)
- Validation enforces methodology rules
- Single source of truth for relationship logic
```

### 4. Architecture Documentation

**File**: `docs/architecture/relationship-management.md` (NEW)

Document architectural decisions:
```markdown
# Relationship Management Architecture

## Design Rationale

**Why centralized module?**
- Single source of truth reduces bugs
- Reusable across CLI, MCP, Extension
- Easier to test and maintain

**Why bidirectional storage?**
- Fast reverse lookup without graph traversal
- Simpler query implementation
- Trade-off: 2x storage for O(1) lookups

**Why atomic operations?**
- Prevents orphaned relationships
- Consistent state after failures
- Follows JSON Patch RFC 6902 principles

## Research Findings

Based on research from Neo4j, MongoDB, and JSON Patch RFC 6902:
- Neo4j: Unidirectional storage + bidirectional queries
- DevSteps: Bidirectional storage (optimized for DevSteps use case)
- Atomic all-or-nothing operations (MongoDB pattern)

## Future Considerations

- Lazy deletion with tombstones
- Relationship versioning
- Event sourcing for audit trail
```

## Acceptance Criteria
- [ ] MCP Server README documents devsteps_unlink tool
- [ ] CLI README documents unlink command with examples
- [ ] Shared README documents relationships.ts module
- [ ] Architecture doc explains design rationale and research
- [ ] All code examples tested and verified
- [ ] Cross-references between docs (e.g., MCP→Shared link)