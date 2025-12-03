## Problem

STORY-049 documented `affects/affected-by` as "Jira Standard", but research revealed this is **Azure DevOps CMMI only**.

## Correction Needed

**Original (INCORRECT):**
> - **Jira Standard**: "relates to" for general context, "affects" for impact traceability

**Corrected:**
> - **Jira 2025**: Uses "relates to" for context, "blocks" for hierarchy/impact (NO "affects"!)
> - **Azure DevOps**: "Affects/Affected By" in CMMI process only (Microsoft.VSTS.Common.Affects)

## Actions

1. Add superseded note to STORY-049.md
2. Reference STORY-053 (removes affects) and STORY-054 (blocks as hierarchy)
3. Update description with correct Jira 2025 findings
4. Keep status "done" (was valid at the time, learned better later)

## Content

```markdown
## SUPERSEDED by STORY-053 + STORY-054

**Research Update (2025-12-03):**
Initial research incorrectly identified "affects" as Jira standard. Comprehensive analysis revealed:
- **Jira 2025**: NO "affects" link type exists. Uses `blocks/is blocked by` for hierarchy + impact.
- **Azure DevOps**: `affects/affected-by` is CMMI process ONLY (Microsoft.VSTS.Common.Affects).

**Correct Solution:**
- Bug → Epic: Use `blocks` (Jira standard for hierarchy + blocking)
- Bug context: Use `relates-to` (flexible cross-reference)
- Remove `affects/affected-by` entirely (see STORY-053)

See EPIC-014 for complete Jira 2025 alignment.
```