# Story: Centralize Relationship Management in Shared Core

## User Need
As a **developer**, I need **relationship operations consolidated** so that link/unlink/validate logic is reusable across CLI, MCP, and Extension.

## Current Pain
- `link.ts` handler contains 120+ lines of relationship logic
- `update.ts` duplicates sibling-checking for parent completion
- `trace.ts` re-implements traversal
- No single source of truth for relationship rules
- **NO UNLINK CAPABILITY** - Users must manually edit JSON files (violates "never edit manually" principle)

## Research Findings (20+ Sources)

### Industry Best Practices Analyzed

**Neo4j Graph Database Pattern:**
- Store relationships in ONE direction only, query bidirectionally
- DELETE operations: `MATCH (a)-[r:TYPE]->(b) DELETE r`
- DevSteps inefficiency: Stores bidirectional links TWICE

**JSON Patch RFC 6902 Standard:**
- Atomic operations with validation: `test` + `remove` pattern
- ETags + `If-Match` for optimistic concurrency
- Challenge: Array index-based (indices shift on removal)

**MongoDB Graph Patterns:**
- Value-based array removal: `$pull` operator (not index-based)
- Atomic operations without race conditions
- Requires explicit bidirectional sync logic

**Key Finding:** All graph systems provide explicit DELETE/REMOVE operations for relationships. DevSteps is missing this critical capability.

## Acceptance Criteria
1. New `packages/shared/src/core/relationships.ts` module
2. Functions: `createLink()`, **`removeLink()`**, `getRelated()`, `traverseRelationships()`
3. All handlers delegate to shared relationships module
4. Relationship validation reused from existing `validation.ts`
5. Bidirectional link creation/removal handled in one place
6. 100% code coverage for relationship operations
7. **MCP/CLI `unlink` command** for safe relationship removal

## Technical Design

### Core API
```typescript
// Link Management
export async function createLink(
  devstepsDir: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType
): Promise<LinkResult>;

export async function removeLink(
  devstepsDir: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType
): Promise<LinkResult>;

// Query Helpers
export async function getRelatedItems(
  devstepsDir: string,
  itemId: string,
  relationType?: RelationType
): Promise<RelatedItem[]>;

export async function traverseRelationships(
  devstepsDir: string,
  startId: string,
  options: TraversalOptions
): Promise<TraversalResult>;
```

### removeLink() Implementation Details

**Atomic Bidirectional Removal:**
1. Validate both items exist
2. Validate link exists (fail early if not)
3. Remove target from source.linked_items[relationType]
4. Resolve inverse relationship type
5. Remove source from target.linked_items[inverseType]
6. Update timestamps on BOTH items
7. Write both files atomically
8. Return success with affected items

**Error Handling:**
- Item not found → Clear error message
- Link doesn't exist → Idempotent success (already removed)
- File system errors → Rollback-safe (read before write)

**Validation:**
- Reuse `getBidirectionalRelation()` from shared
- Prevent partial updates (all-or-nothing)
- Maintain referential integrity

## Definition of Done
- [x] Research industry best practices (Neo4j, JSON Patch, MongoDB)
- [ ] relationships.ts module created with 4 core functions
- [ ] createLink() extracts existing link.ts logic
- [ ] **removeLink() implements bidirectional removal**
- [ ] getRelated() helper for queries
- [ ] traverseRelationships() for trace operations
- [ ] link.ts handler refactored (<30 LOC, delegates to shared)
- [ ] update.ts uses getRelated() for parent checks
- [ ] trace.ts uses traverseRelationships()
- [ ] **unlink.ts handler created** (MCP/CLI)
- [ ] **unlinkTool added to MCP tools**
- [ ] **CLI unlink command** implemented
- [ ] Tests: 100% coverage for relationships.ts
- [ ] Tests: Integration tests for unlink scenarios
- [ ] Handler LOC reduced by >60%
- [ ] Documentation updated

## Impact
**Enables:**
- Safe cleanup of erroneous relationships
- Backlog hygiene workflows (e.g., devsteps-55-item-cleanup)
- Refactoring work items without manual JSON editing
- Simplified handler implementations

**Unlocks:**
- STORY-044 (Move Trace Logic)
- Future doctor --fix capabilities
- Advanced relationship management features