# DevCrumbs MCP Server

> **Never Code Alone - Team Up With Your AI**

Model Context Protocol (MCP) server for AI-assisted developer task tracking. Structure your development workflow with traceable work items and let your AI assistant help you manage projects systematically.

## Features

- **Work Item Management**: Create and track epics, stories, tasks, bugs, and spikes
- **Traceability**: Link items with relationships (implements, tested-by, blocks, depends-on)
- **Priority & Status**: Eisenhower Matrix quadrants, priority levels, status tracking
- **Search & Filter**: Full-text search, filter by type/status/priority/assignee
- **Context Generation**: AI-optimized project context for efficient assistance
- **Git Integration**: Automatic commit tracking and synchronization
- **Export**: Generate reports in Markdown, JSON, or HTML
- **Health & Metrics**: Prometheus-compatible metrics for monitoring

## Installation

### NPX (Recommended)

No installation required - use directly with `npx`:

```json
{
  "mcpServers": {
    "devcrumbs": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devcrumbs-mcp-server"
      ]
    }
  }
}
```

### Global Installation

```bash
npm install -g @schnick371/devcrumbs-mcp-server
```

## Usage with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devcrumbs": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devcrumbs-mcp-server"
      ]
    }
  }
}
```

After adding the configuration:
1. Restart Claude Desktop
2. Look for the 🔌 icon in the chat interface
3. Click to see available DevCrumbs tools

## Usage with VS Code (Copilot)

Add to your VS Code MCP configuration:

**Method 1: User Configuration (Recommended)**  
Open Command Palette (`Ctrl + Shift + P`) → `MCP: Open User Configuration`

**Method 2: Workspace Configuration**  
Create `.vscode/mcp.json` in your workspace

```json
{
  "servers": {
    "devcrumbs": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devcrumbs-mcp-server"
      ]
    }
  }
}
```

## Available Tools

The MCP server provides these tools to AI assistants:

### Work Item Management
- `devcrumbs-init` - Initialize a new DevCrumbs project
- `devcrumbs-add` - Create new work items (epic/story/task/bug/spike/test)
- `devcrumbs-update` - Update work item status, priority, assignee, etc.
- `devcrumbs-get` - Retrieve detailed work item information
- `devcrumbs-list` - List work items with filters
- `devcrumbs-search` - Full-text search across all items

### Traceability & Relationships
- `devcrumbs-link` - Create relationships between items
- `devcrumbs-trace` - Show complete traceability tree

### Project Management
- `devcrumbs-status` - Get project overview with statistics
- `devcrumbs-context` - Generate AI-optimized project context
- `devcrumbs-export` - Export project data (Markdown/JSON/HTML)

### Archival & Maintenance
- `devcrumbs-archive` - Archive single items
- `devcrumbs-purge` - Bulk archive completed items

### Monitoring
- `devcrumbs-health` - Server health status
- `devcrumbs-metrics` - Prometheus metrics

## Quick Start Example

After connecting your AI assistant:

```
You: Initialize a new DevCrumbs project called "MyApp"

AI: [Uses devcrumbs-init to create project]

You: Create a story for implementing user authentication

AI: [Uses devcrumbs-add to create STORY-001]

You: What's our project status?

AI: [Uses devcrumbs-status to show overview]
```

## Work Item Types

- **Epic** - Large initiatives spanning multiple stories
- **Story** - User-facing features or requirements
- **Task** - Technical implementation work
- **Bug** - Defects requiring fixes
- **Spike** - Research or proof-of-concept work
- **Test** - Testing activities

## Priority System

### Eisenhower Matrix Quadrants
- **Q1 (Urgent-Important)** - Do first
- **Q2 (Not Urgent-Important)** - Schedule
- **Q3 (Urgent-Not Important)** - Delegate
- **Q4 (Not Urgent-Not Important)** - Eliminate

### Priority Levels
- **Critical** - Immediate action required
- **High** - Important, short deadline
- **Medium** - Normal priority
- **Low** - Can be deferred

## Project Structure

```
.devcrumbs/
├── config.json              # Project configuration
├── index.json               # Work item index
├── items/                   # Work items (JSON + MD)
│   ├── epic/
│   ├── story/
│   ├── task/
│   └── ...
└── archive/                 # Archived items
```

## HTTP Server Mode

For advanced use cases, run as HTTP server:

```bash
npx @schnick371/devcrumbs-mcp-server --http --port 3000
```

Access health endpoint: `http://localhost:3000/health`  
Access metrics endpoint: `http://localhost:3000/metrics`

## Configuration

The server reads from `.devcrumbs/config.json`:

```json
{
  "projectName": "MyProject",
  "methodology": "scrum",
  "author": "team@example.com",
  "gitIntegration": true
}
```

## Development Methodologies

- **Scrum** - Epics, Stories, Tasks, Bugs, Spikes
- **Waterfall** - Requirements, Features, Tasks, Bugs
- **Hybrid** - All item types available

## Environment Variables

- `LOG_LEVEL` - Logging level (error/warn/info/debug/trace)
- `PORT` - HTTP server port (default: 3000)
- `MCP_SERVER_NAME` - Custom server name

## Troubleshooting

### Server not appearing in Claude Desktop

1. Check config file syntax: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`
2. Restart Claude Desktop completely
3. Check logs: `~/Library/Logs/Claude/mcp*.log`

### Permission errors

Ensure the server has write access to the `.devcrumbs/` directory.

### Network issues

If using HTTP mode, check firewall settings allow localhost connections.

## License

Apache-2.0

## Links

- **Website**: [devcrumbs.dev](https://devcrumbs.dev)
- **GitHub**: [github.com/Schnick371/devcrumbs](https://github.com/Schnick371/devcrumbs)
- **Issues**: [github.com/Schnick371/devcrumbs/issues](https://github.com/Schnick371/devcrumbs/issues)
- **npm Package**: [@schnick371/devcrumbs-mcp-server](https://www.npmjs.com/package/@schnick371/devcrumbs-mcp-server)

## Contributing

Contributions welcome! Please open issues or pull requests on GitHub.

---

**Made with ❤️ for developers who never code alone**
