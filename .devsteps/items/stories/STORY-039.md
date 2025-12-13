# Story: Centralize Relationship Management in Shared Core

## User Need
As a **developer**, I need **relationship operations consolidated** so that link/unlink/validate logic is reusable across CLI, MCP, and Extension.

## Current Pain
- `link.ts` handler contains 120+ lines of relationship logic
- `update.ts` duplicates sibling-checking for parent completion
- `trace.ts` re-implements traversal
- No single source of truth for relationship rules

## Acceptance Criteria
1. New `packages/shared/src/core/relationships.ts` module
2. Functions: `createLink()`, `removeLink()`, `getRelated()`, `traverseRelationships()`
3. All handlers delegate to shared relationships module
4. Relationship validation reused from existing `validation.ts`
5. Bidirectional link creation handled in one place
6. 100% code coverage for relationship operations

## Technical Design
```typescript
// New API
export async function createLink(
  devstepsDir: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType
): Promise<LinkResult>;

export async function getRelatedItems(
  devstepsDir: string,
  itemId: string,
  relationType?: RelationType
): Promise<RelatedItem[]>;
```

## Definition of Done
- [ ] relationships.ts module created
- [ ] link handler refactored to use shared module (<30 LOC)
- [ ] update handler uses getRelatedItems() for parent check
- [ ] trace handler uses traverseRelationships()
- [ ] Tests pass
- [ ] Handler LOC reduced by >60%
