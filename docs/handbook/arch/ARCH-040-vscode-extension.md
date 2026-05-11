---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, vscode, extension, treeview, dashboard]
---

# VS Code Extension

This section covers the DevSteps VS Code extension — Activity Bar views, TreeView item management, the Kanban dashboard webview, and how-to guides for daily use.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Overview & Installation | Explanation | Extension capabilities, prerequisites, activation |
| Activity Bar & Views | Reference | All registered views and their behaviour |
| TreeView — Items, Gruppen, Filter | Reference | Grouping modes, filter syntax, keyboard shortcuts |
| Status Bar & Decorations | Reference | Status bar indicator, file decoration rules |
| Dashboard / Webview | Explanation | Kanban board concept, chart panels, filter state |
| Kanban-Board — Views & Interaction | Reference | Column definitions, drag-and-drop, status transitions |
| Charts & Statistics | Reference | Dashboard tiles, chart types, date range filters |
| How-to: Extension in daily work | How-to | Open views, create items, track progress |
| How-to: Items anlegen & bearbeiten | How-to | Quick-create, inline edit, bulk status update |
| How-to: MCP-Server starten & verwalten | How-to | MCP manager panel, connection status, restart |
| Architecture — Extension Design | Architecture | Activation sequence, MCP manager internals |

## Key Features

- **TreeView**: hierarchical display of all work items with group-by-epic, group-by-status, and group-by-initiative modes
- **Dashboard**: Kanban board with drag-and-drop, plus velocity charts and burndown widgets
- **MCP Manager**: embedded panel to start/stop/monitor the DevSteps MCP server from within VS Code
- **Decorations**: file-level status badges showing which items affect the currently open file
