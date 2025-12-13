# Story: Fix Async/Sync Declaration Mismatch

## User Need
As a **developer**, I need **consistent async semantics** so that function signatures match their implementation and performance characteristics are transparent.

## Current Problem
Shared core functions declared `async` but use synchronous fs:
```typescript
export async function addItem(...): Promise<Result> {
  const config = JSON.parse(readFileSync(...)); // Blocking!
}
```

This is **misleading** - callers expect non-blocking behavior but get blocked event loop.

## Options Analysis

### Option A: Remove `async` (Stay Sync)
**Pros:**
- Honest API - signature matches behavior
- No migration needed for callers
- Simpler error handling (try/catch, no rejected promises)

**Cons:**
- Blocks event loop for MCP concurrent requests
- Cannot add batching/parallelism later

### Option B: Migrate to fs.promises
**Pros:**
- True async I/O - non-blocking
- Future-proof for concurrency optimizations
- Modern Node.js best practice

**Cons:**
- Migration effort across all core functions
- Callers must handle promises correctly
- Slightly more complex error handling

## Acceptance Criteria
Based on SPIKE-006 decision:
1. **If staying sync:** Remove `async` from all core functions, update return types
2. **If migrating async:** Replace all fs with fs.promises, add batching where beneficial
3. All tests updated and passing
4. Performance benchmarks show <5% regression (sync) or improvement (async)
5. Documentation updated with I/O strategy rationale

## Definition of Done
- [ ] Decision from SPIKE-006 implemented
- [ ] All core functions have consistent async semantics
- [ ] JSDoc updated with performance characteristics
- [ ] Tests pass
- [ ] Benchmark results documented
