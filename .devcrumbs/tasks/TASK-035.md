# Reorganize View Toolbar - Move View Mode to Submenu

## Problem
Currently, the DevCrumbs view toolbar shows **6 inline buttons**, cluttering the interface:
- Flat view mode
- Hierarchical view mode  
- Refresh
- Add item
- Search
- Dashboard

**VS Code UX Guidelines:**
- Use `group: "navigation"` for **primary inline actions only**
- Group related view/sort/filter actions in **submenus** for cleaner UI
- Keep frequently used actions inline

**Reference:** VS Code Explorer has "View & Sort" submenu for view mode options.

## Desired State

**Toolbar (inline buttons):**
- 👁️ Hide Done Items (TASK-031 - toggle filter)
- 🔄 Refresh
- ➕ Add Item
- 🔍 Search
- 📊 Dashboard
- **[...]** menu → View & Sort submenu

**Submenu "View & Sort" (in ... menu):**
- 📋 View as Flat
- 🌳 View as Hierarchical  
- ─────────────────
- 🔷 Show Scrum Hierarchy (only when hierarchical)
- 🔶 Show Waterfall Hierarchy (only when hierarchical)
- 🔹 Show Both Hierarchies (only when hierarchical)
- ─────────────────
- 📊 Sort Items
- ─────────────────
- 🎯 Filter by Status
- ⚡ Filter by Priority
- 📁 Filter by Type
- ❌ Clear Filters

## Implementation Plan

### 1. Define Submenu in package.json

Add to `contributes.submenus`:

```json
{
  "contributes": {
    "submenus": [
      {
        "id": "devcrumbs.viewAndSort",
        "label": "View & Sort",
        "icon": "$(list-tree)"
      }
    ]
  }
}
```

### 2. Reorganize View Toolbar Menu

Update `contributes.menus.view/title`:

```json
{
  "menus": {
    "view/title": [
      // PRIMARY INLINE ACTIONS (always visible buttons)
      {
        "command": "devcrumbs.toggleHideDone",
        "when": "view == devcrumbs.itemsView",
        "group": "navigation@1"
      },
      {
        "command": "devcrumbs.refreshItems",
        "when": "view == devcrumbs.itemsView",
        "group": "navigation@2"
      },
      {
        "command": "devcrumbs.addItem",
        "when": "view == devcrumbs.itemsView",
        "group": "navigation@3"
      },
      {
        "command": "devcrumbs.searchItems",
        "when": "view == devcrumbs.itemsView",
        "group": "navigation@4"
      },
      {
        "command": "devcrumbs.showDashboard",
        "when": "view == devcrumbs.itemsView",
        "group": "navigation@5"
      },
      
      // SUBMENU in ... overflow menu
      {
        "submenu": "devcrumbs.viewAndSort",
        "when": "view == devcrumbs.itemsView",
        "group": "1_viewSort"
      }
    ]
  }
}
```

### 3. Define Submenu Content

Add submenu items to `contributes.menus.devcrumbs.viewAndSort`:

```json
{
  "menus": {
    "devcrumbs.viewAndSort": [
      // VIEW MODE
      {
        "command": "devcrumbs.viewMode.flat",
        "group": "1_view@1"
      },
      {
        "command": "devcrumbs.viewMode.hierarchical",
        "group": "1_view@2"
      },
      
      // HIERARCHY FILTERS (only in hierarchical mode)
      {
        "command": "devcrumbs.hierarchy.scrum",
        "group": "2_hierarchy@1",
        "when": "devcrumbs.viewMode == hierarchical"
      },
      {
        "command": "devcrumbs.hierarchy.waterfall",
        "group": "2_hierarchy@2",
        "when": "devcrumbs.viewMode == hierarchical"
      },
      {
        "command": "devcrumbs.hierarchy.both",
        "group": "2_hierarchy@3",
        "when": "devcrumbs.viewMode == hierarchical"
      },
      
      // SORT
      {
        "command": "devcrumbs.sort",
        "group": "3_sort@1"
      },
      
      // FILTERS
      {
        "command": "devcrumbs.filterByStatus",
        "group": "4_filter@1"
      },
      {
        "command": "devcrumbs.filterByPriority",
        "group": "4_filter@2"
      },
      {
        "command": "devcrumbs.filterByType",
        "group": "4_filter@3"
      },
      {
        "command": "devcrumbs.clearFilters",
        "group": "4_filter@4"
      }
    ]
  }
}
```

### 4. Update Command Titles

Ensure clear menu text in `contributes.commands`:

```json
{
  "commands": [
    {
      "command": "devcrumbs.viewMode.flat",
      "title": "View as Flat",
      "category": "DevCrumbs",
      "icon": "$(list-flat)"
    },
    {
      "command": "devcrumbs.viewMode.hierarchical",
      "title": "View as Hierarchical",
      "category": "DevCrumbs",
      "icon": "$(list-tree)"
    },
    {
      "command": "devcrumbs.hierarchy.scrum",
      "title": "Show Scrum Hierarchy Only",
      "category": "DevCrumbs"
    },
    {
      "command": "devcrumbs.hierarchy.waterfall",
      "title": "Show Waterfall Hierarchy Only",
      "category": "DevCrumbs"
    },
    {
      "command": "devcrumbs.hierarchy.both",
      "title": "Show Both Hierarchies",
      "category": "DevCrumbs"
    }
  ]
}
```

## Visual Layout

**Before (6 inline buttons):**
```
[Flat] [Hierarchical] [Refresh] [Add] [Search] [Dashboard]
```

**After (5 inline buttons + submenu):**
```
[👁️ Hide Done] [🔄] [➕] [🔍] [📊] [...]
                                      └─ View & Sort ▶
                                           ├─ View as Flat
                                           ├─ View as Hierarchical
                                           ├─────────────────
                                           ├─ Show Scrum Hierarchy
                                           ├─ Show Waterfall Hierarchy
                                           ├─ Show Both Hierarchies
                                           ├─────────────────
                                           ├─ Sort Items
                                           ├─────────────────
                                           ├─ Filter by Status
                                           ├─ Filter by Priority
                                           ├─ Filter by Type
                                           └─ Clear Filters
```

## Benefits

**Cleaner Organization:**
- Primary actions inline (filter done, refresh, add, search, dashboard)
- View/sort/filter options in submenu
- Reduces visual clutter while keeping frequent actions accessible

**Better UX:**
- Matches VS Code Explorer pattern
- Logical grouping (view modes + sorting + filtering together)
- Hide Done toggle prominently placed (TASK-031)

**Keyboard Shortcuts Preserved:**
- All existing shortcuts still work
- `Ctrl+Shift+V F` → Flat view
- `Ctrl+Shift+V H` → Hierarchical view
- `F5` → Refresh

## Dependencies

- **TASK-031**: "Hide Done Items" toggle button (should be implemented first or simultaneously)
- This task only reorganizes menu structure, doesn't add new functionality

## Testing Checklist

### Visual Tests
- ✅ 5 inline buttons visible: Hide Done, Refresh, Add, Search, Dashboard
- ✅ `...` menu appears at end of toolbar
- ✅ "View & Sort" submenu appears in `...` menu with tree icon
- ✅ Submenu items properly grouped with separators

### Functional Tests
- ✅ All inline buttons work (Hide Done from TASK-031, others existing)
- ✅ View mode switching works from submenu
- ✅ Hierarchy filters appear only in hierarchical mode
- ✅ Sort/filter commands work from submenu

### Keyboard Shortcuts
- ✅ All existing shortcuts functional
- ✅ `Ctrl+Shift+V F` → Flat view
- ✅ `Ctrl+Shift+V H` → Hierarchical view
- ✅ `F5` → Refresh

### Regression Tests
- ✅ Commands work from Command Palette
- ✅ Context menu unaffected
- ✅ No build/lint errors

## Implementation Notes

**Estimated Effort:** 1 hour
- 30 min: Update package.json (submenu + menu reorganization)
- 30 min: Testing all paths

**Risk Level:** Low
- Configuration-only change
- Non-breaking (all commands still accessible)
- Easy to revert

**Coordination with TASK-031:**
- TASK-031 adds "Hide Done" command + functionality
- This task (TASK-035) positions it in toolbar
- Can be implemented in parallel or sequentially

## VS Code API References

**Submenu Contribution:**
- [contributes.submenus](https://code.visualstudio.com/api/references/contribution-points#contributes.submenus)
- [contributes.menus](https://code.visualstudio.com/api/references/contribution-points#contributes.menus)

**Menu Groups:**
- `navigation@order` - Inline toolbar buttons (left to right)
- `1_group@order` - First section in `...` menu
- `2_group@order` - Second section (separator before)

## Acceptance Criteria

- ✅ Submenu "View & Sort" defined in `contributes.submenus`
- ✅ 5 inline buttons: Hide Done, Refresh, Add, Search, Dashboard
- ✅ View mode commands in submenu (not inline)
- ✅ Filter/sort commands accessible in submenu
- ✅ All functionality preserved
- ✅ Keyboard shortcuts unchanged
- ✅ No build/lint errors

## Related Work Items

- **TASK-031**: Hide Done Items Toggle (adds the toggle button functionality)
- **TASK-002**: TreeView Provider (uses view modes from submenu)
- **TASK-010**: TreeView Filtering (filter commands in submenu)
- **STORY-004**: VS Code Extension (toolbar organization)