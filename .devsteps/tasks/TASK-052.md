# Refactor: Split devstepsTreeDataProvider.ts (843 lines → 300-400 lines)

## Problem
**CODE QUALITY VIOLATION** (devsteps-code-standards.instructions.md):
- Current: **843 lines** (exceeds 400-line acceptable limit)
- Target: **< 300 lines** per file

## Root Cause
Single file contains multiple responsibilities:
1. TreeDataProvider implementation
2. View mode switching logic (flat/hierarchical)
3. Filtering/sorting logic
4. Item loading from filesystem
5. Methodology detection (Scrum/Waterfall)

## Proposed Solution
Split into separate modules:

```
treeView/
├── devstepsTreeDataProvider.ts (< 300 lines) - Main TreeDataProvider
├── viewModes/
│   ├── flatViewBuilder.ts - Flat view logic
│   └── hierarchicalViewBuilder.ts - Hierarchical view logic
├── filtering/
│   ├── filterState.ts - Filter management
│   └── sortState.ts - Sort management
└── loaders/
    ├── itemLoader.ts - Filesystem operations
    └── methodologyDetector.ts - Scrum/Waterfall detection
```

## Acceptance Criteria
- [ ] devstepsTreeDataProvider.ts < 300 lines
- [ ] All functionality preserved (no breaking changes)
- [ ] Tests pass (TreeView commands work)
- [ ] No TypeScript errors
- [ ] Follow Single Responsibility Principle

## Implementation Notes
- Keep EventEmitter pattern in main provider
- Extract ViewMode builders into separate classes
- Use dependency injection for loaders
- Maintain backward compatibility

## References
- devsteps-code-standards.instructions.md: File size guidelines
- Current implementation: 843 lines (2.8x over recommended)
