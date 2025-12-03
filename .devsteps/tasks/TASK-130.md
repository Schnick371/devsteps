**Objective:** Make description badge self-explanatory by adding 'filtered' text when filters are active.

**Current State:**
```
(45/120)  // Unclear what this means
```

**New State:**
```
45/120 filtered  // Clear that results are filtered
```

**Implementation:**
1. Update `updateDescription()` in devstepsTreeDataProvider.ts:
   ```typescript
   if (filteredCount < totalCount) {
     this.treeView.description = `${filteredCount}/${totalCount} filtered`;
   } else {
     this.treeView.description = undefined;
   }
   ```

2. Keep existing logic - badge only appears when filtered

**Files:**
- packages/extension/src/treeView/devstepsTreeDataProvider.ts (updateDescription method)

**Validation:**
- Badge shows '45/120 filtered' when filters active
- Badge disappears when no filters
- Text is readable in all themes

**Why not emoji/icon:**
- VS Code description doesn't support icons reliably
- Text is universal and theme-independent