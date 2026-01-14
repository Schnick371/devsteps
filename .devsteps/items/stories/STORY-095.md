# Story: Automated Obsolescence Detection & Backlog Health

## User Value

**As a** DevSteps Product Owner,  
**I want** automated detection of potentially obsolete backlog items,  
**so that** I can maintain a clean, focused backlog without manual tracking.

## Context

Research shows that **50% item obsolescence is healthy** (Don Reinertsen). Industry best practice recommends quarterly backlog grooming with automatic flagging of stale items. DevSteps should proactively help teams identify candidates for `obsolete` status.

## Acceptance Criteria

### 1. Stale Item Detection
- [ ] CLI command: `devsteps doctor --check-stale`
- [ ] Flag items not updated in configurable period (default: 90 days)
- [ ] Exclude items in active states (`in-progress`, `review`)
- [ ] Group by category and priority
- [ ] Show last update timestamp

### 2. Backlog Health Report
- [ ] Overall backlog statistics:
  - Total items by status
  - Items older than 90/180/365 days
  - Obsolescence rate percentage
  - Health score (optimal ~40-50% active)
- [ ] Warning for backlogs with >100 draft items
- [ ] Suggestions for grooming

### 3. Interactive Grooming Mode
- [ ] CLI: `devsteps groom --interactive`
- [ ] Present stale items one-by-one
- [ ] Options for each item:
  - Mark `obsolete`
  - Keep (updates timestamp)
  - Change priority
  - Add notes
- [ ] Batch operations support

### 4. Configuration
- [ ] `.devsteps/config.json` settings:
  ```json
  {
    "backlog": {
      "staleThresholdDays": 90,
      "maxDraftItems": 100,
      "autoGroomingEnabled": true
    }
  }
  ```

### 5. MCP Integration
- [ ] Tool: `mcp_devsteps_health` returns stale item count
- [ ] Tool: `mcp_devsteps_groom` suggests obsolescence
- [ ] AI agents can recommend backlog cleanup

### 6. Reporting
- [ ] Include in status reports
- [ ] Export grooming candidates to CSV
- [ ] Track obsolescence trends over time

## Definition of Done

- Feature implemented and tested
- CLI commands work correctly
- MCP tools integrated
- Configuration options documented
- Unit tests pass
- Integration tests added
- No linting errors
- Committed with conventional format

## Technical Implementation

**Packages affected:**
- `packages/cli/src/commands/doctor.ts` - Stale detection
- `packages/cli/src/commands/groom.ts` - New interactive command
- `packages/mcp-server/src/tools/health.ts` - MCP integration
- `packages/shared/src/types/config.ts` - Configuration schema

**Algorithm:**
```typescript
function detectStaleItems(items: Item[], thresholdDays: number): StaleItem[] {
  const cutoff = Date.now() - (thresholdDays * 24 * 60 * 60 * 1000);
  return items.filter(item => 
    !['in-progress', 'review', 'done', 'obsolete'].includes(item.status) &&
    new Date(item.updated).getTime() < cutoff
  );
}
```

## Dependencies

- None (uses existing data structures)

## Research Evidence

From 60+ sources:
- **Atlassian:** "Remove outdated items quarterly"
- **Simon Schreiber:** "Auto-close items not updated in 90 days"
- **Scrum.org:** "Product backlog is living document"
- **Agile Modeling:** "Stale items are waste"

## Estimated Effort

**Complexity:** Medium
**Timeline:** 3-4 days (implementation + tests)
**Risk:** Low