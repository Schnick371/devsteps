## Objective

Add superseded notice to STORY-049.md correcting Azure DevOps "affects" misinformation.

## Implementation Complete ✅

**Changes Made:**

**File: .devsteps/stories/STORY-049.md**
- Added prominent superseded notice at top of file
- Corrected industry research claims with factual annotations
- Referenced correct solution: STORY-053 (remove affects) + STORY-054 (blocks hierarchy)
- Linked to EPIC-014 for complete Jira 2025 alignment

**Key Corrections:**
1. **Jira Standard**: NO "affects" link type exists (CMMI-only in Azure DevOps)
2. **Correct approach**: Use `blocks` for hierarchy/impact, `relates-to` for context
3. **Historical context**: Original research was incomplete, not intentionally wrong

**Impact:**
- Future readers understand why affects was removed
- Clear path to correct implementation via EPIC-014
- Maintains done status (was valid based on available info at time)