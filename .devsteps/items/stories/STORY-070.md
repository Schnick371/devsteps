# Package Integration: Update CLI, MCP, Extension for New Index

## User Story
As a **DevSteps user**, I want **all packages to use the new refs-style index** so that **I experience consistent behavior and benefit from reduced merge conflicts**.

## Background
After foundation is built (STORY-069), integrate new index operations into all three consumer packages:
- CLI (`packages/cli/`)
- MCP Server (`packages/mcp-server/`)
- VS Code Extension (`packages/extension/`)

## Acceptance Criteria

### CLI Integration
- [ ] Update `list` command to use new index
- [ ] Update `status` command to use new index
- [ ] Update `add` command to update all relevant indexes
- [ ] Update `update` command to update indexes on changes
- [ ] Update `archive` command to remove from indexes
- [ ] All CLI commands work with new index structure
- [ ] Error messages updated for new index context

### MCP Server Integration
- [ ] Update `list` tool to use new index
- [ ] Update `add` tool to update indexes
- [ ] Update `update` tool to update indexes
- [ ] Update `archive` tool to remove from indexes
- [ ] Update `status` tool to use new index
- [ ] Update `search` tool (if it uses index)
- [ ] All MCP tools work with new index structure

### Extension Integration
- [ ] Update TreeView provider to use new index
- [ ] Update item creation to update indexes
- [ ] Update item updates to sync indexes
- [ ] Update filtering/sorting to use appropriate index
- [ ] Update dashboard webview to use new index
- [ ] All extension features work with new index

### Consistency Checks
- [ ] All three packages use same index operations from `shared`
- [ ] No direct file system operations on index files
- [ ] All use centralized index functions

### Error Handling
- [ ] Graceful degradation if index files missing
- [ ] Clear error messages for index inconsistencies
- [ ] Recovery suggestions for users

### Testing
- [ ] Integration tests for CLI with new index
- [ ] Integration tests for MCP server with new index
- [ ] Manual testing of extension features
- [ ] Cross-package consistency tests

### Performance
- [ ] CLI commands respond in <500ms
- [ ] MCP tools respond in <1s
- [ ] Extension TreeView loads in <1s
- [ ] No performance regression vs. old index

## Technical Notes

**Import Pattern:**
```typescript
import { loadIndexByType, updateIndexByStatus } from '@devsteps/shared';
```

**Migration Strategy:**
1. Wrap all current index operations
2. Test with old index.json (backward compat)
3. Test with new index structure
4. Remove old code paths after migration

## Affected Paths
- `packages/cli/src/commands/*.ts` (all commands)
- `packages/mcp-server/src/tools/*.ts` (all tools)
- `packages/extension/src/treeView/` (TreeView provider)
- `packages/extension/src/webview/` (Dashboard)

## Dependencies
- Depends on: STORY-069 (Foundation complete)
- Blocks: STORY-071 (Migration needs all packages ready)

## Definition of Done
- All acceptance criteria met
- Integration tests passing
- Manual testing complete
- No regressions in functionality
- Performance benchmarks meet targets
- Code review approved