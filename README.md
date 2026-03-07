# 🚀 DevSteps - Developer Task Tracking System

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.md)
[![Version](https://img.shields.io/badge/version-0.4.0-green.svg)](package.json)

> Never Code Alone. Team Up With Your AI.

## ✨ Features

- 📝 **Structured Task Management** - Requirements, Features, Tests, and Bugs
- 🔗 **Traceability** - Link items together (REQ → FEAT → TEST)
- 🤖 **AI Integration** - MCP Server for Claude Desktop and other AI tools
- ⚡ **CLI Tool** - Fast command-line interface for developers
- 🔍 **Smart Search** - Find items by tags, status, assignee, or full-text
- 📊 **Reports & Stats** - Generate reports, changelogs, and roadmaps
- 🔄 **Git Integration** - Track commits per item automatically
- 💾 **Local First** - All data stored locally in `.devsteps/` directory
- 🎯 **Multi-Methodology Support** - Scrum, Waterfall, or Hybrid approaches
- 📊 **Eisenhower Matrix** - Prioritize tasks by urgency and importance

## 🎯 Methodologies & Item Types

DevSteps supports three project methodologies, each with tailored item types:

### 🏃 Scrum (Agile)
**Best for**: Iterative development, sprints, user stories

**Item Types**:
- `epic` - Large features spanning multiple sprints
- `story` - User stories with acceptance criteria
- `task` - Implementation work items
- `bug` - Defects and issues
- `spike` - Research and exploration tasks
- `test` - Test cases and scenarios

**Example Workflow**:
```bash
devsteps init my-project --methodology scrum
devsteps add epic "User Management System"
devsteps add story "As a user, I want to login" --links EPIC-001
devsteps add task "Implement login API endpoint" --links STORY-001
```

### 🏢 Waterfall (Traditional)
**Best for**: Sequential phases, formal requirements

**Item Types**:
- `requirement` - Formal requirements documentation
- `feature` - Features derived from requirements
- `task` - Implementation work items
- `bug` - Defects and issues
- `test` - Test cases and scenarios

**Example Workflow**:
```bash
devsteps init my-project --methodology waterfall
devsteps add requirement "System shall authenticate users"
devsteps add feature "Login functionality" --links REQ-001
devsteps add test "Verify login with valid credentials" --links FEAT-001
```

### 🔀 Hybrid (Best of Both)
**Best for**: Flexible teams combining approaches

**Item Types**: All types from both Scrum and Waterfall (epic, story, requirement, feature, task, bug, spike, test)

**Example Workflow**:
```bash
devsteps init my-project --methodology hybrid
devsteps add requirement "Performance SLA: <200ms response"
devsteps add story "As a user, I want fast search results"
devsteps add spike "Investigate ElasticSearch vs PostgreSQL FTS"
```

## 📊 Eisenhower Matrix Integration

DevSteps includes built-in support for the **Eisenhower Matrix** to help prioritize tasks effectively:

### Quadrants

| Quadrant | Urgency | Importance | Action |
|----------|---------|------------|--------|
| **Q1** | Urgent | Important | **Do First** - Critical tasks requiring immediate attention |
| **Q2** | Not Urgent | Important | **Schedule** - Strategic work, planning, improvement |
| **Q3** | Urgent | Not Important | **Delegate** - Interruptions, some meetings |
| **Q4** | Not Urgent | Not Important | **Eliminate** - Time wasters, busy work |

### Usage Example

```bash
# Create Q1 tasks (urgent & important)
devsteps add task "Fix production bug" --priority urgent-important
devsteps add task "Refactor authentication module" --priority not-urgent-important
devsteps add task "Update meeting notes" --priority urgent-not-important

# List tasks by quadrant
devsteps list --priority urgent-important        # Q1 - Do First
devsteps list --priority not-urgent-important    # Q2 - Schedule
```

### Eisenhower as Priority

- DevSteps uses the **Eisenhower Matrix** as the single priority system.
- Choose a quadrant to reflect urgency and importance.

Example:
```bash
devsteps add bug "Memory leak in user service" --priority urgent-important
```

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Language**: TypeScript 5.7+ with strict mode
- **MCP SDK**: [@modelcontextprotocol/sdk](https://github.com/anthropics/mcp-typescript-sdk)
- **CLI**: Commander.js, Inquirer, Chalk, Ora
- **Validation**: Zod for runtime type safety
- **Linting**: Biome for fast linting and formatting
- **Testing**: Vitest for unit and integration tests

## 📦 Installation

### Prerequisites

| Requirement | Minimum Version | Notes |
| ----------- | --------------- | ----- |
| [VS Code](https://code.visualstudio.com/) | **1.109.0** | Required for parallel `#runSubagent` dispatch |
| [Bun](https://bun.sh) | latest | Build toolchain |
| Node.js | 22+ | Runtime |

Install [Bun](https://bun.sh):
```bash
curl -fsSL https://bun.sh/install | bash
```

### Install DevSteps

```bash
# Clone and build
git clone <repository-url>
cd devsteps
bun install
bun run build

# Link CLI globally (optional)
cd packages/cli
bun link
```

## 🚀 Quick Start

### Initialize a Project

```bash
devsteps init my-project
```

### Add Items

```bash
# Add a requirement
devsteps add req "User authentication system"

# Add a feature
devsteps add feat "Login form with email/password"

# Add a test
devsteps add test "Test login with valid credentials"
```

### Link Items

```bash
devsteps link REQ-001 implements FEAT-001
devsteps link FEAT-001 tested-by TEST-001
```

### View Status

```bash
devsteps status
devsteps list --status=in-progress
devsteps trace REQ-001
```

## 🚀 Quick Start

### 1. Install VS Code Extension

**From Marketplace** (Recommended):
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search: `devsteps`
4. Click **Install**
5. Reload window

**Self-Contained Features:**
- ✅ MCP Server bundled (no Node.js needed)
- ✅ Works offline after installation
- ✅ Zero configuration required
- ✅ Auto-registers with GitHub Copilot

### 2. Initialize Project

Open any workspace and use Copilot Chat:
```
@workspace Initialize devsteps with Scrum methodology
```

Or use CLI (if installed separately):
```bash
devsteps init my-project --methodology scrum
```

### 3. Start Using

**With GitHub Copilot:**
```
@workspace Add a new task for user authentication
@workspace List all high-priority items
@workspace Show status of TASK-042
```

**With TreeView:**
- Click DevSteps icon in Activity Bar
- Browse hierarchical structure
- Click items to open/edit
- Use toolbar filters

## MCP Setup

The DevSteps VS Code extension **automatically registers the MCP server** — no manual configuration required when installed from the Marketplace.

> **VS Code 1.109+ required.** The extension registers the MCP server on activation via the VS Code MCP API.

### Automatic Setup (Recommended)

1. Install the extension from the Marketplace
2. Open a workspace folder
3. The MCP server starts automatically — look for `$(check) DevSteps MCP` in the status bar
4. All `mcp_devsteps_*` tools are immediately available in Copilot Chat

### Manual Setup (WSL / Remote)

If you're running VS Code via WSL Remote and need to configure the server manually, add this to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "devsteps": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/path/to/devsteps/packages/mcp-server/dist/index.js",
        "/path/to/your/workspace"
      ]
    }
  }
}
```

Replace paths with your actual installation paths. Then reload the window (`Ctrl+Shift+P` → **Developer: Reload Window**).

### Verifying the Connection

In Copilot Chat, run:
```
/mcp.devsteps.devsteps-onboard
```

This loads the current project context and confirms the MCP server is connected.

### Available MCP Prompts

| Prompt | Description |
|--------|-------------|
| `/mcp.devsteps.devsteps-onboard` | Load project context into the AI session |
| `/mcp.devsteps.devsteps-sprint-review` | Summarise in-progress items and blockers |
| `/mcp.devsteps.devsteps-commit-message` | Generate a Conventional Commits message for an item |

## �📚 Documentation

- [Installation Guide](./INSTALL.md) - Detailed setup instructions
- [Development Guide](./DEVELOPMENT.md) - Contributing and local development
- [CLI Commands](./docs/cli-commands.md) - Command-line reference
- [MCP Tools Reference](./docs/mcp-tools.md) - AI integration tools

## 🏗️ Project Structure

```
devsteps/
├── packages/
│   ├── mcp-server/     # MCP server for AI integration
│   ├── cli/            # CLI tool for developers
│   └── shared/         # Shared types, schemas, and utilities
├── .devsteps/            # Example project data
├── docs/               # Documentation
└── README.md
```

## 🧪 Development

```bash
# Install dependencies
bun install

# Development mode (watch)
bun run dev

# Build all packages
bun run build

# Run tests
bun test

# Lint and format
bun run lint
bun run format

# Type check
bun run typecheck
```

## 👤 Author

**Thomas Hertel**
- Email: [the@devsteps.dev](mailto:the@devsteps.dev)
- GitHub: [@devsteps](https://github.com/devsteps)

## 🤝 Contributing

We welcome contributions! Please read our guidelines before submitting pull requests:

- [Contributing Guide](CONTRIBUTING.md) - Development setup, PR process, coding standards
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards and expectations
- [Security Policy](SECURITY.md) - Vulnerability disclosure process

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/devsteps.git
cd devsteps

# Install and build
npm install
npm run build

# Run tests
npm test
```

All contributions require:
- ✅ Conventional Commits format
- ✅ DCO sign-off (`git commit -s`)
- ✅ Tests for new features
- ✅ Code quality checks passing

## 📄 License

**Copyright © 2025 Thomas Hertel (the@devsteps.dev)**

This project is licensed under the **Apache License 2.0** - see the [LICENSE.md](LICENSE.md) file for details.

### Key License Points

- ✅ **Free to use** - Commercial and private use allowed
- ✅ **Modify and distribute** - Create derivatives under same license
- ✅ **Patent protection** - Contributors grant patent rights
- ⚠️ **Trademark** - "DevSteps" name is protected (see below)
- ⚠️ **No warranty** - Provided "AS IS" without guarantees

## ™ Trademark Policy

**"DevSteps" is a trademark of Thomas Hertel.** The Apache 2.0 license does NOT grant permission to use the "DevSteps" name or logo without authorization.

**You MAY:**
- Use DevSteps software as-is or modified for any purpose
- Redistribute DevSteps under Apache 2.0 terms
- Reference DevSteps in documentation or comparisons

**You MAY NOT:**
- Use "DevSteps" name for derivative products without permission
- Imply official endorsement by using "DevSteps" trademark
- Register "DevSteps" or similar marks

For trademark usage inquiries: [the@devsteps.dev](mailto:the@devsteps.dev)

## ⚠️ Disclaimer

This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and noninfringement. See [LICENSE.md](LICENSE.md) for full warranty disclaimer and limitation of liability.

## 💡 Inspiration

Inspired by:
- Issue tracking systems (Jira, Linear, GitHub Issues)
- Documentation-as-code practices
- Requirements traceability in regulated industries
- Developer-first tooling philosophy

---

**Made with ❤️ by the DevSteps Community**
