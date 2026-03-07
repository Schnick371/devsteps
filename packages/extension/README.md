# DevSteps VS Code Extension

> Never Code Alone. Team Up With Your AI.

**AI-First Development Workflow System** integrated directly into VS Code. Structure your development process with traceable work items, visualize project health with an interactive dashboard, and integrate with AI agents via the Model Context Protocol (MCP).

## ✨ Features

### 📋 Smart TreeView Sidebar
- **Dual-Mode Display**: Flat or hierarchical view of work items
- **Advanced Filtering**: Filter by status, priority, type, or tags
- **Multi-Field Sorting**: Sort by status, priority, updated date, title, type, or ID
- **Color-Coded Badges**: Visual status indicators (draft, done, in-progress, blocked)
- **Quick Actions**: Context menus for common operations

### 📊 Interactive Dashboard
- **Project Statistics**: Real-time counts by type, status, priority, Eisenhower quadrant
- **Eisenhower Matrix**: 4-quadrant view (Urgent/Important categorization)
- **Sprint Burndown Chart**: Track progress with ideal vs actual burndown
- **Traceability Graph**: Force-directed visualization of item relationships
- **Activity Timeline**: Recent updates at a glance
- **Performance Optimized**: Handles 10K+ items with <2s load time

### 🔗 Traceability & Relationships
- Navigate parent-child relationships (epic → story → task)
- View implementation links, dependencies, test coverage
- Visual graph showing connected items

### 🤖 AI Integration (MCP)
- Model Context Protocol (MCP) support for AI agents
- Export project context for AI-assisted development
- Seamless integration with GitHub Copilot (recommended: Claude Sonnet 4+)

## 📦 Installation

### Stable Release (1.0.0)

Search for **"DevSteps"** in the VS Code Extensions view and install.

**MCP Server (Stable):**
```bash
npm install -g @schnick371/devsteps-mcp-server
```

**CLI (Optional, Stable):**
```bash
npm install -g @schnick371/devsteps-cli
```

### Pre-Release (1.0.1)

In the VS Code Extensions view, find DevSteps and click **"Switch to Pre-Release Version"**.

**MCP Server (@next):**
```bash
npm install -g @schnick371/devsteps-mcp-server@next
```

**CLI (@next — Optional):**
```bash
npm install -g @schnick371/devsteps-cli@next
```

## 🏗️ MCP Server Architecture

**VS Code 1.109+ (current):** The extension runs the MCP server entirely in-process using `McpHttpServerDefinition`. No Node.js installation is required — the bundled `dist/mcp-server.js` is loaded directly by VS Code and serves all MCP tool requests over a localhost HTTP port. No configuration is needed.

**VS Code < 1.109 (fallback):** If `McpHttpServerDefinition` is unavailable, the extension falls back to spawning the MCP server as a subprocess via `McpStdioServerDefinition`. This mode requires Node.js ≥ 18 and npx to be installed.

## ⚙️ Prerequisites

**Required:**
- **VS Code** ≥ 1.109.0 (recommended; in-process MCP, no Node.js needed)
- **Node.js** ≥ 18.0 — only required for VS Code < 1.109 (stdio fallback)

### Why Node.js?
DevSteps uses the **Model Context Protocol (MCP)** to integrate with AI assistants like GitHub Copilot. On VS Code 1.109+, the MCP server runs in-process and Node.js is not required. On older VS Code versions, the server is spawned as a subprocess and Node.js must be installed.

### Installing Node.js

<details>
<summary><strong>Windows</strong></summary>

**Option 1: Official Installer (Recommended)**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (installs Node.js, npm, and npx)
3. Restart VS Code after installation

**Option 2: winget (Windows Package Manager)**
```powershell
winget install OpenJS.NodeJS
```

</details>

<details>
<summary><strong>macOS</strong></summary>

**Option 1: Official Installer**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run `.pkg` installer
3. Restart VS Code after installation

**Option 2: Homebrew (Recommended for developers)**
```bash
brew install node
```

</details>

<details>
<summary><strong>Linux</strong></summary>

**Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Fedora/RHEL:**
```bash
sudo dnf install nodejs npm
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm
```

**Other distributions:** See [nodejs.org/download](https://nodejs.org/en/download/package-manager)

</details>

### Verify Installation

After installing Node.js, verify the installation:

```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show npm version
npx --version    # Should show npx version
```

### Check DevSteps Prerequisites

DevSteps includes a built-in prerequisites checker:

1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Run **DevSteps: Check Prerequisites**
3. Review results in Output Channel

The command will show:
- ✅ Node.js, npm, npx detected versions and paths
- ⚠️ Missing components with installation instructions
- 🔧 Selected MCP server strategy (npx or node)

## 🚀 Getting Started

### Initialize a DevSteps Project

**Pre-Release (@next):**
```bash
# Install CLI
npm install -g @schnick371/devsteps-cli@next

# Initialize project
devsteps init my-project --methodology scrum

# Add your first work item
devsteps add epic "Build Amazing Product"
```

**Stable:**
```bash
npm install -g @schnick371/devsteps-cli
devsteps init my-project
```

### Use in VS Code
1. Open workspace with DevSteps project (`.devsteps/` directory present)
2. DevSteps icon appears in Activity Bar (left sidebar)
3. **TreeView**: View/filter/sort work items
4. **Dashboard**: Click 📊 button in TreeView toolbar for visualizations

## 🎯 Key Commands

| Command | Description |
|---------|-------------|
| `DevSteps: Show Dashboard` | Open interactive project dashboard |
| `DevSteps: Refresh Work Items` | Reload items from disk |
| `DevSteps: Change View Mode` | Toggle flat/hierarchical view |
| `DevSteps: Filter by Status` | Show only items with specific status |
| `DevSteps: Sort Items` | Change sorting criteria |

## ⚙️ Configuration

No configuration required! Extension auto-detects DevSteps projects.

**Optional Settings** (future releases):
- `devsteps.dashboard.traceabilityMaxNodes`: Max nodes in traceability graph (default: 50)
- `devsteps.treeView.defaultView`: Initial view mode (default: "flat")

## 🎨 Visual Design

DevSteps extension follows **VS Code theme colors** automatically:
- Light themes → Clean, professional appearance
- Dark themes → Eye-friendly, modern aesthetic
- High contrast themes → Fully accessible

## 📈 Performance

**Optimized for Large Projects:**
- Dashboard: <500ms for 1K items, <2s for 10K items
- TreeView: Instant filtering/sorting
- Memory: <50MB for 10K items (within VS Code guidelines)

## 🔧 Troubleshooting

### MCP Server Not Starting?

**Symptom:** "DevSteps MCP Server requires Node.js" error or MCP tools not working in Copilot

**Solutions:**
1. **Run Prerequisites Check**
   - Command Palette → `DevSteps: Check Prerequisites`
   - Review Output Channel for detailed diagnostics
   
2. **Install Node.js** (if missing)
   - See [Prerequisites](#prerequisites) section above
   - Restart VS Code after installation
   
3. **Verify PATH Configuration**
   - Open terminal in VS Code
   - Run `node --version` and `npx --version`
   - If commands not found: Node.js not in PATH
   - Fix: Reinstall Node.js or add to PATH manually

4. **Check MCP Server Status**
   - Command Palette → `DevSteps: Show MCP Server Status`
   - Shows runtime strategy (npx/node) and detected versions

**Common Causes:**
- Node.js not installed
- Node.js installed but VS Code terminal doesn't see it (PATH issue)
- VS Code started before Node.js installation (restart needed)

### Extension Not Activating?
- Ensure `.devsteps/` directory exists in workspace root OR
- Extension activates even without project (for MCP tools)
- Check VS Code version (requires 1.109.0+)
- Reload window: `Cmd/Ctrl+Shift+P` → `Developer: Reload Window`

### Dashboard Not Loading?
- Check DevTools console: `Help` → `Toggle Developer Tools`
- Verify `.devsteps/index.json` file exists and is valid JSON
- Try `DevSteps: Show Dashboard` command again

### TreeView Empty?
- Run `DevSteps: Refresh Work Items` command
- Ensure work items exist (`devsteps list` in terminal)
- Check `.devsteps/*.json` files for corruption

### Copilot Can't Use DevSteps Tools?
1. Verify MCP server is running (status bar shows "DevSteps MCP")
2. Check prerequisites (`DevSteps: Check Prerequisites`)
3. Try asking Copilot: "@devsteps #mcp_devsteps_devsteps-list"
4. If still not working: Restart VS Code

### "npx: command not found" Error?
This means npx is not installed or not in PATH.

**Fix:**
1. Install Node.js (includes npx): See [Prerequisites](#prerequisites)
2. Restart VS Code
3. Run `DevSteps: Check Prerequisites` to verify

**Alternative:** Extension will automatically fall back to bundled MCP server if npx unavailable

## 🐛 Known Issues

**Performance:**
- Graph force simulation may lag with 100+ highly-connected nodes (optimization in progress)

**How to Report Issues:**
Please include:
- Extension version
- VS Code version
- Steps to reproduce
- Expected vs actual behavior

Report at: [GitHub Issues](https://github.com/Schnick371/devsteps/issues)

## 📝 Release Notes

### 1.0.1 (Pre-Release)

**Pre-release channel — install via "Switch to Pre-Release Version" in VS Code Extensions.**

- Extension now automatically uses `@schnick371/devsteps-mcp-server@next` when running as pre-release
- Added Getting Started walkthrough (Activity Bar → DevSteps → ...)
- `isPreRelease()` detection extended to cover patch-level pre-releases (1.0.1)

### 1.0.0 (Stable)

**First stable release.**

- Interactive WebView Dashboard with 5 visualization sections
- Advanced TreeView filtering and sorting
- Color-coded status badges (FileDecorationProvider)
- MCP Server auto-management via VS Code MCP API (requires VS Code 1.109+)
- Cross-platform Node.js runtime detection (npx preferred, node fallback)
- Performance optimizations: <2s for 10K+ items
- Traceability graph node limiting
- TypeScript 5.9.3, esbuild bundling, Apache 2.0 license

## 🤝 Contributing

DevSteps is open source! Contributions welcome:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

See [CONTRIBUTING.md](https://github.com/Schnick371/devsteps/blob/main/CONTRIBUTING.md) for guidelines.

## 📄 License

Apache-2.0 - see [LICENSE](./LICENSE.md)

## 🔗 Links

- **Documentation**: [github.com/Schnick371/devsteps](https://github.com/Schnick371/devsteps)
- **Report Issues**: [github.com/Schnick371/devsteps/issues](https://github.com/Schnick371/devsteps/issues)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **MCP Integration**: [docs/mcp-integration.md](https://github.com/Schnick371/devsteps/blob/main/docs/mcp-integration.md)

---

**Made with ❤️ by developers, for developers. Never code alone.**
