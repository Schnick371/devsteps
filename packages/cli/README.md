# @schnick371/devsteps-cli

> Never Code Alone. Command-line interface for AI-assisted developer task tracking.

## Overview

DevSteps CLI provides terminal commands for managing work items, tracking traceability, and organizing agile/waterfall projects.

## Installation

```bash
npm install -g @schnick371/devsteps-cli
```

## Quick Start

```bash
# Initialize a new project
devsteps init my-project --methodology scrum

# Add work items
devsteps add epic --title "User Authentication"
devsteps add story --title "Login Form" --parent EPIC-001
devsteps add task --title "API Integration" --parent STORY-001

# List items
devsteps list --type task --status in-progress
devsteps list --priority urgent-important  # Q1: urgent & important

# Update status
devsteps update TASK-001 --status done

# Search
devsteps search "authentication"

# Show project status
devsteps status

# Export project
devsteps export --format markdown --output project.md
```

## Commands

### Project Management

- `devsteps init <name>` - Initialize new DevSteps project
- `devsteps status` - Show project statistics
- `devsteps context` - Generate AI context (quick/standard/deep)

### Work Items

- `devsteps add <type>` - Create new work item (epic/story/task/bug/etc.)
- `devsteps get <id>` - Show work item details
- `devsteps update <id>` - Update work item properties
- `devsteps list` - List work items with filters

### Search & Filter

- `devsteps search <query>` - Full-text search
- `devsteps list --status <status>` - Filter by status
- `devsteps list --priority <priority>` - Filter by priority
- `devsteps list --type <type>` - Filter by type
- `devsteps list --archived` - List archived items

### Traceability

- `devsteps link <source> <rel> <target>` - Create relationship
- `devsteps unlink <source> <rel> <target>` - Remove relationship (idempotent)
- `devsteps trace <id>` - Show traceability tree

### Maintenance

- `devsteps archive <id>` - Archive single item
- `devsteps purge` - Bulk archive done/cancelled items
- `devsteps bulk update --status <s> <id...>` - Update multiple items at once
- `devsteps bulk tag-add --tags <t> <id...>` - Add tags to multiple items
- `devsteps bulk tag-remove --tags <t> <id...>` - Remove tags from multiple items
- `devsteps doctor` - Check project health
- `devsteps export` - Export to Markdown/JSON/HTML

## Methodologies

DevSteps supports three development methodologies:

### Scrum
- Epic → Story → Task
- Bugs/Tests implement Epic or relate to Story
- Sprint-based iteration

### Waterfall
- Requirement → Feature → Task
- Bugs/Tests implement Requirement or relate to Feature
- Phase-based progression

### Hybrid
- Both Scrum and Waterfall hierarchies
- Flexible team workflows

## Examples

### Scrum Workflow
```bash
devsteps init my-app --methodology scrum
devsteps add epic --title "User Management"
devsteps add story --title "User Registration" --parent EPIC-001
devsteps add task --title "Create API Endpoint" --parent STORY-001
devsteps link STORY-001 tested-by TEST-001

# Remove a link
devsteps unlink STORY-001 implements TASK-002
```

### Waterfall Workflow
```bash
devsteps init enterprise-sys --methodology waterfall
devsteps add requirement --title "Authentication System"
devsteps add feature --title "SSO Integration" --parent REQ-001
devsteps add task --title "Configure SAML" --parent FEAT-001

# Bulk update multiple tasks to done
devsteps bulk update --status done TASK-001 TASK-002 TASK-003
```

## Integration

### VS Code Extension
Install [DevSteps VS Code Extension](https://marketplace.visualstudio.com/items?itemName=devsteps.devsteps-vscode) for visual project management.

### AI Integration
Use with MCP-compatible AI assistants (Claude, GitHub Copilot) for AI-assisted development.

## Documentation

- [Full Documentation](https://devsteps.dev)
- [GitHub Repository](https://github.com/Schnick371/devsteps)
- [Issue Tracker](https://github.com/Schnick371/devsteps/issues)

## License

Apache-2.0 © Thomas Hertel
