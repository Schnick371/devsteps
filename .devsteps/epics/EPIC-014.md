## Business Value

Align DevSteps relationship semantics with **Jira 2025 standard** instead of Azure DevOps mix.

## Current Problem

- `affects/affected-by` is **Azure DevOps CMMI only** (NOT Jira!)
- `blocks/blocked-by` currently in FLEXIBLE, but Jira uses it for hierarchy
- Bug→Epic relationship unclear (implements vs blocks vs affects)
- Documentation references "Azure DevOps/Jira 2025" inconsistently

## Jira 2025 Standard

**Core Link Types:**
- `relates to` - Flexible cross-references
- `blocks/is blocked by` - Hierarchy + Blocking (Bug blocks Epic)
- `duplicates/is duplicated by` - Duplicate tracking
- `clones/is cloned by` - Clone tracking
- **NO "affects"** - Does not exist in Jira!

## Solution Architecture

**Move to HIERARCHY_RELATIONSHIPS:**
```typescript
HIERARCHY_RELATIONSHIPS = ['implements', 'implemented-by', 'blocks', 'blocked-by']
```

**Remove from FLEXIBLE_RELATIONSHIPS:**
```typescript
// REMOVE: affects, affected-by (Azure DevOps CMMI only!)
FLEXIBLE_RELATIONSHIPS = ['relates-to', 'depends-on', 'required-by', 'tested-by', 'tests', 'supersedes', 'superseded-by']
```

**Bug Workflow (Jira-compliant):**
1. Bug `blocks` Epic/Story/Requirement/Feature (hierarchy)
2. Task `implements` Bug (fix solution)
3. Bug can use `relates-to` for context (flexible)

## Success Criteria

- ✅ `blocks/blocked-by` in HIERARCHY_RELATIONSHIPS with validation
- ✅ `affects/affected-by` removed from all code/docs
- ✅ validation.ts updated for Bug→Epic via blocks
- ✅ All docs reference Jira 2025 only (no Azure DevOps)
- ✅ STORY-049 corrected (was based on wrong Azure DevOps research)
- ✅ CLI/MCP descriptions updated
- ✅ Tests pass with new semantics

## Impact

**Breaking Changes:**
- Existing `affects` links must migrate to `blocks` or `relates-to`
- CLI/MCP will reject `affects` relation type
- Documentation examples updated

**Benefits:**
- Industry standard compliance (Jira 2025)
- Semantic clarity (blocks = hierarchy + impediment)
- AI-friendly (no Azure DevOps confusion)