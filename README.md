# 🚀 DevCrumbs - Developer Task Tracking System

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
- 💾 **Local First** - All data stored locally in `.devcrumbs/` directory
- 🎯 **Multi-Methodology Support** - Scrum, Waterfall, or Hybrid approaches
- 📊 **Eisenhower Matrix** - Prioritize tasks by urgency and importance

## 🎯 Methodologies & Item Types

DevCrumbs supports three project methodologies, each with tailored item types:

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
devcrumbs init my-project --methodology scrum
devcrumbs add epic "User Management System"
devcrumbs add story "As a user, I want to login" --links EPIC-001
devcrumbs add task "Implement login API endpoint" --links STORY-001
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
devcrumbs init my-project --methodology waterfall
devcrumbs add requirement "System shall authenticate users"
devcrumbs add feature "Login functionality" --links REQ-001
devcrumbs add test "Verify login with valid credentials" --links FEAT-001
```

### 🔀 Hybrid (Best of Both)
**Best for**: Flexible teams combining approaches

**Item Types**: All types from both Scrum and Waterfall (epic, story, requirement, feature, task, bug, spike, test)

**Example Workflow**:
```bash
devcrumbs init my-project --methodology hybrid
devcrumbs add requirement "Performance SLA: <200ms response"
devcrumbs add story "As a user, I want fast search results"
devcrumbs add spike "Investigate ElasticSearch vs PostgreSQL FTS"
```

## 📊 Eisenhower Matrix Integration

DevCrumbs includes built-in support for the **Eisenhower Matrix** to help prioritize tasks effectively:

### Quadrants

| Quadrant | Urgency | Importance | Action |
|----------|---------|------------|--------|
| **Q1** | Urgent | Important | **Do First** - Critical tasks requiring immediate attention |
| **Q2** | Not Urgent | Important | **Schedule** - Strategic work, planning, improvement |
| **Q3** | Urgent | Not Important | **Delegate** - Interruptions, some meetings |
| **Q4** | Not Urgent | Not Important | **Eliminate** - Time wasters, busy work |

### Usage Example

```bash
# Create high-priority tasks in different quadrants
devcrumbs add task "Fix production bug" --priority critical --eisenhower urgent-important
devcrumbs add task "Refactor authentication module" --eisenhower not-urgent-important
devcrumbs add task "Update meeting notes" --eisenhower urgent-not-important

# List tasks by quadrant
devcrumbs list --eisenhower urgent-important        # Q1 - Do First
devcrumbs list --eisenhower not-urgent-important    # Q2 - Schedule
```

### Priority vs Eisenhower

- **Priority** (`critical`, `high`, `medium`, `low`) - Technical severity
- **Eisenhower** - Strategic importance and urgency for decision-making

Use both together for comprehensive task management:
```bash
devcrumbs add bug "Memory leak in user service" \
  --priority critical \
  --eisenhower urgent-important
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

Install [Bun](https://bun.sh):
```bash
curl -fsSL https://bun.sh/install | bash
```

### Install DevCrumbs

```bash
# Clone and build
git clone <repository-url>
cd devcrumbs
bun install
bun run build

# Link CLI globally (optional)
cd packages/cli
bun link
```

## 🚀 Quick Start

### Initialize a Project

```bash
devcrumbs init my-project
```

### Add Items

```bash
# Add a requirement
devcrumbs add req "User authentication system"

# Add a feature
devcrumbs add feat "Login form with email/password"

# Add a test
devcrumbs add test "Test login with valid credentials"
```

### Link Items

```bash
devcrumbs link REQ-001 implements FEAT-001
devcrumbs link FEAT-001 tested-by TEST-001
```

### View Status

```bash
devcrumbs status
devcrumbs list --status=in-progress
devcrumbs trace REQ-001
```

## 🚀 Quick Start

### 1. Install VS Code Extension

**From Marketplace** (Recommended):
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search: `devcrumbs`
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
@workspace Initialize devcrumbs with Scrum methodology
```

Or use CLI (if installed separately):
```bash
devcrumbs init my-project --methodology scrum
```

### 3. Start Using

**With GitHub Copilot:**
```
@workspace Add a new task for user authentication
@workspace List all high-priority items
@workspace Show status of TASK-042
```

**With TreeView:**
- Click DevCrumbs icon in Activity Bar
- Browse hierarchical structure
- Click items to open/edit
- Use toolbar filters

## 📚 Documentation

- [Installation Guide](./INSTALL.md) - Detailed setup instructions
- [Development Guide](./DEVELOPMENT.md) - Contributing and local development
- [CLI Commands](./docs/cli-commands.md) - Command-line reference
- [MCP Tools Reference](./docs/mcp-tools.md) - AI integration tools

## 🏗️ Project Structure

```
devcrumbs/
├── packages/
│   ├── mcp-server/     # MCP server for AI integration
│   ├── cli/            # CLI tool for developers
│   └── shared/         # Shared types, schemas, and utilities
├── .devcrumbs/            # Example project data
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
- Email: [the@devcrumbs.dev](mailto:the@devcrumbs.dev)
- GitHub: [@devcrumbs](https://github.com/devcrumbs)

## 🤝 Contributing

We welcome contributions! Please read our guidelines before submitting pull requests:

- [Contributing Guide](CONTRIBUTING.md) - Development setup, PR process, coding standards
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards and expectations
- [Security Policy](SECURITY.md) - Vulnerability disclosure process

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/devcrumbs.git
cd devcrumbs

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

**Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)**

This project is licensed under the **Apache License 2.0** - see the [LICENSE.md](LICENSE.md) file for details.

### Key License Points

- ✅ **Free to use** - Commercial and private use allowed
- ✅ **Modify and distribute** - Create derivatives under same license
- ✅ **Patent protection** - Contributors grant patent rights
- ⚠️ **Trademark** - "DevCrumbs" name is protected (see below)
- ⚠️ **No warranty** - Provided "AS IS" without guarantees

## ™ Trademark Policy

**"DevCrumbs" is a trademark of Thomas Hertel.** The Apache 2.0 license does NOT grant permission to use the "DevCrumbs" name or logo without authorization.

**You MAY:**
- Use DevCrumbs software as-is or modified for any purpose
- Redistribute DevCrumbs under Apache 2.0 terms
- Reference DevCrumbs in documentation or comparisons

**You MAY NOT:**
- Use "DevCrumbs" name for derivative products without permission
- Imply official endorsement by using "DevCrumbs" trademark
- Register "DevCrumbs" or similar marks

For trademark usage inquiries: [the@devcrumbs.dev](mailto:the@devcrumbs.dev)

## ⚠️ Disclaimer

This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and noninfringement. See [LICENSE.md](LICENSE.md) for full warranty disclaimer and limitation of liability.

## 💡 Inspiration

Inspired by:
- Issue tracking systems (Jira, Linear, GitHub Issues)
- Documentation-as-code practices
- Requirements traceability in regulated industries
- Developer-first tooling philosophy

---

**Made with ❤️ by the DevCrumbs Community**
