## Context

Comprehensive code review (Feb 2026) identified multiple files exceeding the 400-line hard limit mandated by code quality standards. These must be split to maintain maintainability.

## Files to Split

| File | Lines | Action |
|------|-------|--------|
| `extension/src/commands/index.ts` | 1233 | Split into 4 command group files |
| `mcp-server/src/tools/index.ts` | 887 | Split by domain: crud, relationships, analysis, system |
| `extension/src/treeView/devstepsTreeDataProvider.ts` | 695 | Extract filter state + tree builder |
| `cli/src/commands/index.ts` | 707 | Split by function family |
| `cli/src/commands/doctor.ts` | 483 | Extract output formatter |
| `shared/src/core/index-refs.ts` | 552 | Split read/write operations |
| `shared/src/core/auto-migrate.ts` | 543 | Split migration steps |

## Definition of Done
- All source files ≤ 400 lines
- Build passes, no TypeScript errors  
- All exports preserved (no breaking changes)
- Tests pass
