# Story: Move Status Calculation to Shared Core

## User Need
As a **developer**, I need **status/stats calculation centralized** so that CLI and extension can display project health without duplicating logic.

## Current Pain
- `status.ts` handler calculates stats inline (70+ lines)
- No reusable stats module for dashboard widgets
- CLI cannot show detailed status without code duplication
- Stale item detection scattered

## Acceptance Criteria
1. New `packages/shared/src/core/status.ts` module
2. Functions: `getProjectStatus()`, `calculateStats()`, `detectStaleItems()`
3. Handler becomes thin wrapper (<15 LOC)
4. Stats include: totals, by-type, by-status, stale warnings, velocity
5. CLI status command enhanced with shared module

## Technical Design
```typescript
export interface ProjectStatus {
  project: ProjectInfo;
  stats: ProjectStats;
  warnings?: Warning[];
  recentUpdates?: ItemSummary[];
}

export async function getProjectStatus(
  devstepsDir: string,
  options: { detailed?: boolean }
): Promise<ProjectStatus> {
  // Move current status.ts logic here
}
```

## Definition of Done
- [ ] status.ts module in shared/core
- [ ] Handler refactored to <15 LOC
- [ ] Tests cover all stat calculations
- [ ] CLI status matches MCP output
