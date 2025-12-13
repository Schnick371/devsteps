# Feature: VS Code Extension Implementation

## Overview
Visual Studio Code extension for seamless DevSteps integration in the IDE.

## Feature Requirements
Derived from REQ-001 FR-003 (Multiple Interfaces)

### TreeView Display
- Display work items hierarchically grouped by type
- Show status, priority, and metadata
- Support expand/collapse of groups
- Provide icons and theming

### WebView Dashboard
- Display project statistics
- Show breakdown by type, status, priority
- List recent updates
- Provide navigation to items

### Commands
- Create new work items
- Open item details
- Update item status
- Search across items
- Export project reports
- Refresh views

### MCP Server Management
- Auto-start bundled MCP HTTP server
- Programmatically update mcp.json
- Monitor server health
- Display status bar indicator
- Handle server lifecycle

### Context Menus
- Quick actions on tree items
- Right-click context menu
- Keyboard shortcuts

## Implementation Details

### Files
- `src/extension.ts` - Extension entry point
- `src/treeView/devlogTreeDataProvider.ts` - TreeView provider
- `src/webview/dashboardPanel.ts` - WebView dashboard
- `src/mcpServerManager.ts` - MCP server lifecycle
- `src/commands.ts` - Command implementations
- `src/tools/devlog-tools.ts` - Tool definitions

### Technology Stack
- VS Code Extension API v1.106.0+
- @devsteps/shared for business logic
- @devsteps/mcp-server bundled as HTTP server
- esbuild for bundling

## Acceptance Criteria
- ✅ TreeView displays work items
- ✅ Dashboard shows statistics
- ✅ All commands functional
- ✅ MCP server auto-starts
- ✅ mcp.json configured automatically
- ✅ Extension packaged as VSIX