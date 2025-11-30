# Story: Move Trace/Traversal Logic to Shared Core

## User Need
As a **developer**, I need **relationship traversal centralized** so that trace functionality is reusable and testable.

## Current Pain
- `trace.ts` handler contains recursive traversal logic
- No shared traversal utilities for other features
- CLI cannot trace relationships without duplication

## Acceptance Criteria
1. New `packages/shared/src/core/trace.ts` module
2. Function: `traceRelationships(devstepsDir, itemId, options)`
3. Handler becomes thin wrapper (<20 LOC)
4. Traversal algorithm reusable for dependency analysis
5. Support configurable depth, relationship filtering

## Technical Design
```typescript
export interface TraceOptions {
  maxDepth?: number;
  relationTypes?: RelationType[];
  direction?: 'forward' | 'backward' | 'both';
}

export async function traceRelationships(
  devstepsDir: string,
  itemId: string,
  options: TraceOptions
): Promise<TraceTree> {
  // Move current trace.ts logic here
}
```

## Definition of Done
- [ ] trace.ts module in shared/core
- [ ] Handler refactored to <20 LOC
- [ ] Tests cover depth limits, cycles, missing items
- [ ] CLI trace command implemented
