## Objective

Remove `affects/affected-by` from MCP server handlers and tool descriptions.

## Implementation Complete ✅

**Changes Made:**

**File: packages/mcp-server/src/handlers/link.ts**
- Removed `affects: 'affected-by'` and `'affected-by': 'affects'` from inverseRelations mapping (lines ~83-84)

**File: packages/mcp-server/src/tools/index.ts**
- Updated linkTool description: Removed "affects" from FLEXIBLE list (line ~233)
- Removed `'affects'` and `'affected-by'` from relation_type enum (lines ~251-252)

**Validation Results:**
- ✅ TypeScript compilation successful
- ✅ MCP server builds without errors
- ✅ Tool schema now rejects affects/affected-by relation types
- ✅ AI will receive validation error when attempting affects link

**Impact:**
- MCP link tool now only accepts Jira 2025 standard relations
- Attempts to use affects will fail with enum validation error