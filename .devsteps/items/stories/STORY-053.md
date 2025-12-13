## Objective

Remove Azure DevOps-specific `affects/affected-by` relationship types from DevSteps codebase.

## Background

Research revealed `affects/affected-by` is **Azure DevOps CMMI process ONLY** (Microsoft.VSTS.Common.Affects), NOT Jira standard. Jira 2025 uses `blocks/is blocked by` for hierarchy and impact.

## Implementation Complete ✅

**Removed affects from:**
1. ✅ Shared relationships.ts - FLEXIBLE_RELATIONSHIPS array
2. ✅ Shared schemas - RelationType enum + LinkedItems
3. ✅ Shared add.ts - linked_items initialization
4. ✅ MCP handlers - inverseRelations mapping
5. ✅ MCP tools - linkTool schema
6. ✅ CLI commands - link command descriptions + mapping
7. ✅ Extension TreeView - affects relationship rendering
8. ✅ Documentation - STORY-049 superseded notice

**Commits:**
- 0f65a3b: relationships.ts removal
- a076d2a: schema types + add.ts
- cc2905f: MCP handlers + tools
- fb15073: CLI commands
- 3822158: Extension TreeView
- [current]: STORY-049 documentation

**Impact:**
- Breaking change: affects property no longer exists in schemas
- All packages validated with successful builds
- Jira 2025 standard alignment complete