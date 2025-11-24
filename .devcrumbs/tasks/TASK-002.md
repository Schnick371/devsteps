Advanced TreeView Provider with switchable view modes (flat + hierarchical) completed.

**Implemented Features**:
- **Dual View Modes**: Flat (grouped by type) and Hierarchical (parent-child relationships)
- **View Switching**: Toolbar buttons + Command Palette commands
- **Hierarchical Views**: Separate Scrum and Waterfall hierarchies
- **Priority Coloring**: Icons adapt to theme with priority colors (critical=red, high=orange, medium=blue, low=grey)
- **Collapsible Nodes**: Expandable/collapsible tree structure
- **Smart Icons**: Type-specific icons (rocket for epic, book for story, checklist for task, etc.)
- **Click-to-Open**: Command integration for opening items
- **Real-time Refresh**: Changes reflected immediately

**Architecture**:
- Abstract TreeNode base class for extensibility
- TypeGroupNode for flat view grouping
- HierarchyRootNode for Scrum/Waterfall separation
- WorkItemNode for actual work items with recursive loading
- Theme-aware icons using ThemeIcon + ThemeColor (2025 best practice)

**View Modes**:
1. **Flat View**: `EPICS (3)`, `STORIES (4)`, `TASKS (8)` grouped folders
2. **Hierarchical View**: Epic → Story → Task chains with visual tree structure
3. **Hierarchy Filters**: Scrum only, Waterfall only, or Both

**Commands Added**:
- `devcrumbs.viewMode.flat` - Switch to flat grouped view
- `devcrumbs.viewMode.hierarchical` - Switch to tree hierarchy view
- `devcrumbs.hierarchy.scrum` - Show only Scrum hierarchy
- `devcrumbs.hierarchy.waterfall` - Show only Waterfall hierarchy
- `devcrumbs.hierarchy.both` - Show both hierarchies

**Build**: 6.5kb bundled (2x size due to enhanced functionality), 12ms build time