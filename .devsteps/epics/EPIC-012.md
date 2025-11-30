# Epic: Shared Core Consistency & I/O Architecture

## Problem
Current MCP handlers show inconsistency: some call shared core functions (add/update/archive/list/get/purge) while others embed direct file-system logic (link/status/search/export/trace/init). Shared core functions are declared async but use synchronous fs operations; mixed patterns reduce maintainability and future scalability.

## Pain Points
- Duplicate relationship + traversal logic in handlers (`link`, `trace`)
- Status/search/export each re-open index/config separately without caching layer
- Inconsistent error semantics (core throws; handlers wrap) complicates central tracing
- "async" mislabeling may confuse consumers expecting non-blocking behavior

## Goals
1. Establish unified layering: Handler -> Shared Service (pure I/O + domain) -> Utilities
2. Decide I/O strategy (sync small atomic vs fs.promises with batching)
3. Eliminate duplicated logic, move relationship operations to shared core
4. Introduce light caching abstraction for index/config (read-once per request scope)
5. Normalize error model (typed errors + codes)

## Success Criteria
- All handlers delegate to shared core entry points
- No direct fs usage remains in handlers except minimal path resolution
- Async functions either perform real async (fs.promises) or are made sync and not marked async
- Relationship + trace logic moved to dedicated shared module
- Measurable reduction in LOC across handlers (>25%)

## Out of Scope
- Large-scale performance optimization beyond eliminating redundancy
- Distributed cache / multi-process coordination

## Metrics
- Handler LOC before/after
- Number of shared core modules introduced
- Average handler cognitive complexity

## Next Steps
Story + Spike to research I/O path, then tasks for refactor.
