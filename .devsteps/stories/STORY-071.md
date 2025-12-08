## Problem Statement

Current ID format uses 3-digit padding (TASK-001 to TASK-999), limiting projects to 999 items per type. With TASK counter at 166, approaching capacity concerns for large long-term projects.

## Solution

Expand to 4-digit format (TASK-0001 to TASK-9999) providing 10x capacity (9999 items per type).

## Impact Analysis

**Current State:**
- Total Items: ~299 (TASK-166, STORY-070, EPIC-017, BUG-032, SPIKE-007, FEAT-005, REQ-002)
- Regex: `\d{3,}` (3+ digits minimum)
- Generation: `padStart(3, '0')`
- Counters: Tracked in index.json

**Migration Strategy (Backwards Compatible):**
1. Update regex to `\d{3,4}` (allow both 3 and 4 digits during transition)
2. Update generation to `padStart(4, '0')` (new items: TASK-0167+)
3. Existing items remain unchanged (TASK-001 through TASK-166)
4. Optional: Bulk migration tool to rename existing items (TASK-001 → TASK-0001)

**Files Affected:**
- `packages/shared/src/schemas/index.ts` (regex validation, line 133)
- `packages/shared/src/utils/index.ts` (generateItemId, line 112)
- `packages/shared/src/utils/index.ts` (parseItemId, line 122)

## Acceptance Criteria

- Schema accepts both 3 and 4 digit IDs (backwards compatible)
- New items generated with 4-digit padding (TASK-0167, STORY-0071, etc.)
- Existing items (001-166) remain valid and functional
- No breaking changes to CLI, MCP server, or extension
- Optional migration tool provided for bulk renaming (if desired)

## Priority

Medium - Q2 (not-urgent-important): Improvement for long-term scalability, no immediate user-facing breakage.