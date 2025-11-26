# Story: Code Quality Improvements for Extension Codebase

## Objective
Address code quality violations identified in comprehensive code review:
- Split oversized files (843+ lines)
- Improve type safety

## Background
Code review of VS Code extension (`packages/extension/`) revealed violations of devsteps-code-standards.instructions.md:
- **2 files exceed 400-line limit** (devstepsTreeDataProvider.ts: 843 lines, dashboardPanel.ts: 739 lines)
- **Type safety issues** (extensive use of `any[]`)

**Note:** Dependencies (chart.js/d3) handled separately in SPIKE-005 (architecture decision, not bug)

## Scope
### In Scope
- Refactor devstepsTreeDataProvider.ts into smaller modules
- Refactor dashboardPanel.ts into separate renderers/providers
- Replace `any[]` with `WorkItem[]` types

### Out of Scope
- Functional changes (UI/UX improvements)
- New features (lazy loading handled in STORY-016)
- Dashboard visualization strategy (SPIKE-005)
- Error handling improvements (STORY-016)

## Implementation Tasks
1. **TASK-052**: Split devstepsTreeDataProvider.ts (843 → <300 lines)
2. **TASK-053**: Split dashboardPanel.ts (739 → <300 lines)
3. **TASK-054**: Replace any[] with proper TypeScript types

## Acceptance Criteria
- [ ] All files < 400 lines (target: < 300)
- [ ] TypeScript strict mode passes
- [ ] All existing tests pass
- [ ] Extension builds and loads successfully
- [ ] TreeView and Dashboard functionality unchanged

## Dependencies
- Must complete before STORY-016 (refactoring simplifies testing)
- Relates to SPIKE-005 (dashboard architecture research)

## Deliverables
- Refactored extension codebase following Single Responsibility Principle
- Improved type safety for maintainability

## Success Metrics
- File line count: 843 → <300 (devstepsTreeDataProvider)
- File line count: 739 → <300 (dashboardPanel)
- Type safety: 0 `any[]` in main files
