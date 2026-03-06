## Problem

worker-impl says `NEVER: Modify files` (planning-only) but exec-impl Phase 4 says \"Delegate to worker-impl for the actual commit\". Same for worker-test: `NEVER: Create test files` but exec-test Phase 4 says \"Delegate to worker-test for the actual commit\".

This architectural ambiguity means exec conductors have contradictory instructions about what their workers actually do.

## Decision Needed

Are Ring 4 workers:
- **Option A**: Plan-only agents (generate specs for conductor to execute directly)
- **Option B**: Executor agents (receive plan, make actual file changes)

Answer determines how to rewrite exec-impl/exec-test Phase 4 and worker-impl/worker-test Mission sections.