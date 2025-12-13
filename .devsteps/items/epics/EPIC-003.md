# VS Code Extension - IDE Integration

## Overview
VS Code extension providing native IDE integration with TreeView, WebView, commands, and automatic MCP server configuration.

## Core Features

### 1. TreeView Sidebar
- **DevSteps Explorer**: Hierarchical view of work items
- **Grouping**: By type (Epic/Story/Task/Bug/etc.)
- **Filtering**: By status, priority, assignee
- **Icons**: Custom icons for each item type
- **Context Menu**: Quick actions (Open, Edit, Archive)
- **Drag & Drop**: Reorder items and create links
- **Badges**: Show item counts, status indicators

### 2. WebView Dashboard
- **Overview Panel**: Project statistics and metrics
- **Item Details**: Rich markdown rendering
- **Traceability Graph**: Visual relationship mapping
- **Timeline View**: Recent updates and activity
- **Search Interface**: Full-text search with filters

### 3. Commands
```typescript
devsteps.refresh           // Refresh TreeView
devsteps.openItem          // Open item in editor
devsteps.createItem        // Create new work item
devsteps.updateStatus      // Quick status change
devsteps.showDashboard     // Open dashboard
devsteps.search            // Search dialog
devsteps.exportProject     // Export to markdown/JSON
```

### 4. MCP Server Auto-Configuration
- **Automatic Installation**: Bundle @devsteps/mcp-server
- **HTTP Server**: Start in Extension Host process
- **Config Update**: Programmatically update mcp.json
- **Status Indicator**: Show server status in status bar
- **Zero Config**: Works out-of-the-box

## Technical Architecture

### Package Structure
```
vscode-extension/
├── package.json           # Extension manifest
├── src/
│   ├── extension.ts       # Entry point
│   ├── mcpServerManager.ts  # MCP server lifecycle
│   ├── treeView/
│   │   └── devstepsTreeDataProvider.ts
│   ├── webview/
│   │   └── dashboardPanel.ts
│   ├── commands.ts        # Command implementations
│   └── types/
│       └── devsteps.ts   # Extension-specific types
├── media/
│   ├── dashboard.css      # WebView styles
│   └── icons/             # Custom icons
└── resources/             # Static resources
```

### Dependencies
- **@devsteps/shared**: Core business logic
- **@devsteps/mcp-server**: Bundled MCP server
- **vscode**: VS Code Extension API

## Implementation Plan

### Phase 1: Foundation (TASK-001 to TASK-005)
1. Extension scaffolding and activation
2. TreeView provider with basic rendering
3. Command registration and handlers
4. File system integration
5. Configuration management

### Phase 2: Advanced Features (TASK-006 to TASK-010)
6. WebView dashboard implementation
7. MCP server manager and auto-start
8. Context menus and quick actions
9. Search and filtering
10. Traceability visualization

### Phase 3: Polish (TASK-011 to TASK-015)
11. Icons and theming
12. Keyboard shortcuts
13. Testing and debugging
14. Documentation
15. Marketplace preparation

## Success Criteria
- ✅ TreeView shows all work items from .devsteps/
- ✅ Double-click opens item in editor
- ✅ Dashboard displays project statistics
- ✅ MCP server starts automatically
- ✅ Zero manual configuration required
- ✅ Works with existing DevSteps projects