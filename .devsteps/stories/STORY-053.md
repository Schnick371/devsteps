## Problem

`affects/affected-by` relationship type is **Azure DevOps CMMI only**, NOT Jira 2025 standard.

## Research Findings

**Jira 2025:**
- ❌ NO "affects" link type exists
- ✅ Uses: relates to, blocks, duplicates, clones, causes

**Azure DevOps:**
- ✅ "Affects/Affected By" in CMMI process ONLY
- Reference name: `Microsoft.VSTS.Common.Affects`
- Purpose: Change Request affects Requirement

## Current Usage

STORY-049 incorrectly documented "affects" as Jira standard. Actual codebase usage:
- `packages/shared/src/schemas/relationships.ts` - Line 25-26
- `packages/shared/src/schemas/index.ts` - Lines 78-79, 99-100, 114
- `packages/mcp-server/src/tools/index.ts` - Line 251-252
- `packages/mcp-server/src/handlers/link.ts` - Line 83-84
- `packages/cli/src/commands/index.ts` - Line 437-438
- `packages/cli/src/index.ts` - Line 93 (description)
- `packages/extension/src/treeView/nodes/workItemNode.ts` - Lines 82-84

## Solution

**Remove from all locations:**
1. Remove from FLEXIBLE_RELATIONSHIPS array
2. Remove from reverse mapping objects
3. Remove from CLI/MCP descriptions
4. Remove from schema types
5. Remove from TreeView node logic

**Migration path:**
- `affects` → `blocks` (if blocking/preventing progress)
- `affects` → `relates-to` (if general context)

## Acceptance Criteria

- [ ] `affects/affected-by` removed from relationships.ts
- [ ] Removed from shared schema (index.ts)
- [ ] Removed from MCP handlers + tool descriptions
- [ ] Removed from CLI commands + descriptions
- [ ] Removed from Extension TreeView
- [ ] Docs updated (HIERARCHY-COMPACT.md, AI-GUIDE-COMPACT.md)
- [ ] STORY-049 marked superseded with correction note
- [ ] Build passes without errors
- [ ] Tests updated for new expectations