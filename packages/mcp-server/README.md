# DevSteps MCP Server

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
    "devsteps": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devsteps-mcp-server"
      ]
    }
  }
}
```

### Global Installation

```bash
npm install -g @schnick371/devsteps-mcp-server
```

## Usage with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devsteps": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devsteps-mcp-server"
      ]
    }
  }
}
```

After adding the configuration:
1. Restart Claude Desktop
2. Look for the 🔌 icon in the chat interface
3. Click to see available DevSteps tools

## Usage with VS Code (Copilot)

Add to your VS Code MCP configuration:

**Method 1: User Configuration (Recommended)**  
Open Command Palette (`Ctrl + Shift + P`) → `MCP: Open User Configuration`

**Method 2: Workspace Configuration**  
Create `.vscode/mcp.json` in your workspace

```json
{
  "servers": {
    "devsteps": {
      "command": "npx",
      "args": [
        "-y",
        "@schnick371/devsteps-mcp-server"
      ]
    }
  }
}
```

## Available Tools

The MCP server provides these tools to AI assistants:

### Work Item Management
- `devsteps-init` - Initialize a new DevSteps project
- `devsteps-add` - Create new work items (epic/story/task/bug/spike/test)
- `devsteps-update` - Update work item status, priority, assignee, etc.
- `devsteps-get` - Retrieve detailed work item information
- `devsteps-list` - List work items with filters
- `devsteps-search` - Full-text search across all items

### Traceability & Relationships
- `devsteps-link` - Create relationships between items
- `devsteps-trace` - Show complete traceability tree

### Project Management
- `devsteps-status` - Get project overview with statistics
- `devsteps-context` - Generate AI-optimized project context
- `devsteps-export` - Export project data (Markdown/JSON/HTML)

### Archival & Maintenance
- `devsteps-archive` - Archive single items
- `devsteps-purge` - Bulk archive completed items

### Monitoring
- `devsteps-health` - Server health status
- `devsteps-metrics` - Prometheus metrics

## Quick Start Example

After connecting your AI assistant:

```
You: Initialize a new DevSteps project called "MyApp"

AI: [Uses devsteps-init to create project]

You: Create a story for implementing user authentication

AI: [Uses devsteps-add to create STORY-001]

You: What's our project status?

AI: [Uses devsteps-status to show overview]
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
.devsteps/
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
npx @schnick371/devsteps-mcp-server --http --port 3000
```

Access health endpoint: `http://localhost:3000/health`  
Access metrics endpoint: `http://localhost:3000/metrics`

## Configuration

The server reads from `.devsteps/config.json`:

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

Ensure the server has write access to the `.devsteps/` directory.

### Network issues

If using HTTP mode, check firewall settings allow localhost connections.

## License

Apache-2.0

## Links

- **Website**: [devsteps.dev](https://devsteps.dev)
- **GitHub**: [github.com/Schnick371/devsteps](https://github.com/Schnick371/devsteps)
- **Issues**: [github.com/Schnick371/devsteps/issues](https://github.com/Schnick371/devsteps/issues)
- **npm Package**: [@schnick371/devsteps-mcp-server](https://www.npmjs.com/package/@schnick371/devsteps-mcp-server)

## Contributing

Contributions welcome! Please open issues or pull requests on GitHub.

---

**Made with ❤️ for developers who never code alone**
