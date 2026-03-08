# DevSteps Installation Guide

> **Self-Contained Extension** - No Node.js or external dependencies required!

## ⚙️ System Requirements

| Requirement | Minimum | Notes |
|---|---|---|
| **VS Code** | **1.109.0** | Required for `#runSubagent` multi-agent parallel dispatch (Spider Web) |
| **Node.js** | bundled | v22.11.0 included, no external install needed |
| **GitHub Copilot** | any | Copilot Chat subscription required for AI agent features |

> ⚠️ VS Code versions 1.99–1.108 lack parallel subagent dispatch support. Agent workflows may run sequentially or fail silently. Update VS Code before installing.

---

## 📦 What's Included

The DevSteps VS Code extension is **completely self-contained**:
- ✅ **MCP Server** - Bundled with extension
- ✅ **Node.js Runtime** - v22.11.0 bundled for all platforms
- ✅ **TreeView & Dashboard** - Visual project management
- ✅ **Works Offline** - No internet required after installation
- ✅ **Zero Configuration** - Auto-setup on first activation

**Supported Platforms:**
- Windows (x64)
- Linux (x64)
- macOS (x64, ARM64/Apple Silicon)

---

## 🚀 Quick Installation (Recommended)

### From VS Code Marketplace ⭐

**Search and Install:**
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search: `devsteps`
4. Click **Install**
5. Reload window when prompted

### From VSIX File (Manual)

**Command Line:**
```bash
code --install-extension devsteps-vscode-0.2.0.vsix
```

**Or via VS Code UI:**
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: "Extensions: Install from VSIX"
4. Select `devsteps-vscode-0.2.0.vsix`
5. Reload VS Code when prompted

---

## ✨ First Use - Automatic Setup

**What happens when you first activate the extension:**

1. **Extension starts** an in-process HTTP MCP server on a dynamic OS-assigned port (`0` → auto)
2. **Auto-registers** with VS Code via the `registerMcpServerDefinitionProvider` API — no manual `mcp.json` needed
3. **Status bar** appears: `✓ DevSteps MCP`
4. **MCP tools** available to GitHub Copilot immediately!

**No manual configuration needed!** 🎉

> **Note:** If your workspace already has a manual `devsteps` entry in `.vscode/mcp.json`, the extension detects this and skips auto-registration to avoid duplicate servers. Remove the manual entry to use the auto-managed mode.

### 🔧 Optional Configuration

The extension respects `devsteps.logging.level` (one of `debug`, `info`, `warn`, `error`) which you can set in VS Code user or workspace settings.

The MCP server port is OS-assigned automatically and cannot be fixed — this avoids conflicts with other running services.

---

## 🤖 Using with GitHub Copilot

**After installation and reload:**

1. **Verify Status** (bottom-right status bar):
   - Should show: `✓ DevSteps MCP: Running`
   - Green checkmark = ready to use

2. **Open any workspace** with a devsteps project:
   ```bash
   cd my-project
   code .
   ```

3. **Use in Copilot Chat** (`Ctrl+Shift+I`):
   ```
   @workspace Initialize a devsteps project
   @workspace Add a new task for authentication
   @workspace List all high-priority items
   @workspace Show me items blocked by TASK-042
   ```

4. **View in TreeView**:
   - Click DevSteps icon in Activity Bar (left sidebar)
   - Browse hierarchical task structure
   - Click items to open markdown files
   - Use toolbar buttons to filter/refresh

---

## 🎯 Initialize Your First Project

**In any workspace:**
```bash
# GitHub Copilot Chat
@workspace Initialize devsteps with Scrum methodology

# Or use CLI (if installed separately)
devsteps init my-project --methodology scrum
```

**Creates `.devsteps/` directory structure:**
```
.devsteps/
├── index.json          # Central index
├── config.json         # Project config
├── epics/              # Epic items
├── stories/            # Story items  
├── tasks/              # Task items
├── bugs/               # Bug items
└── ...
```

---

## 🏢 Advanced: Docker/HTTP Mode (Optional)

**For team environments with shared server:**

### When to Use Docker Mode
- ✅ Team wants centralized server
- ✅ Shared database across users
- ✅ CI/CD pipeline integration
- ✅ Remote development scenarios

### Setup

**1. Deploy Docker container:**
```bash
# From devsteps repository
docker-compose up -d

# Verify
curl http://localhost:3100/health
```

**2. Configure VS Code (Manual):**

Add to User Settings (`~/.config/Code/User/settings.json` on Linux):
```json
{
  "mcp.servers": {
    "devsteps": {
      "type": "http",
      "url": "http://localhost:3100/mcp",
      "description": "DevSteps MCP Server (shared Docker instance)"
    }
  }
}
```

**3. Restart VS Code**

### Docker Deployment Options

**Local (docker-compose):**
```bash
docker-compose up -d
docker logs devsteps-mcp-server
```

**Kubernetes (production):**
```bash
kubectl apply -f k8s/
kubectl get pods -l app=devsteps-mcp
```

**Environment Variables:**
```bash
MCP_TRANSPORT=http    # Use HTTP mode
MCP_PORT=3100         # Server port
LOG_LEVEL=info        # Logging level
```

---

## ✅ Verification

### Extension Installation
1. Open Extensions view (`Ctrl+Shift+X`)
2. Search: `@installed devsteps`
3. Should show "DevSteps - Never Code Alone"

### MCP Server Status
1. **Status Bar** (bottom-right): `✓ DevSteps MCP: Running`
2. **Command Palette** (`Ctrl+Shift+P`):
   - Type: "DevSteps"
   - Should see devsteps commands
3. **Activity Bar**: Look for DevSteps icon (left sidebar)

### Test with Copilot
```
@workspace devsteps status
@workspace list devsteps tasks
```

Should return project information and task list.

---

## 🛠️ Troubleshooting

### VS Code Extension

**Extension not appearing:**
- Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
- Check extensions list: `Ctrl+Shift+X`
- View logs: Help → Toggle Developer Tools → Console

**Commands not working:**
- Ensure project has `.devsteps/` directory
- Initialize: `npx devsteps-cli init <project-name>`

### MCP Server (VS Code)

**Server not appearing in Extensions:**
- Check `.vscode/mcp.json` exists and has valid JSON
- Run Command Palette: `MCP: List Servers`
- Should see "devsteps" in MCP SERVERS - INSTALLED section
- Restart VS Code completely

**Copilot not using MCP tools:**
- Verify build: `ls packages/mcp-server/dist/index.js`
- Check Copilot output panel for errors
- Restart server: Command Palette → `MCP: Restart Server → devsteps`
- Test with: `@workspace List devsteps tasks`

**Build errors:**
```bash
# Rebuild from project root
pnpm build

# Check server manually
node packages/mcp-server/dist/index.js
```

### MCP Server (Claude Desktop)

**Command not found:**
```bash
# Check npm global path
npm config get prefix

# Add to PATH if needed (Linux/Mac)
export PATH="$PATH:$(npm config get prefix)/bin"
```

**Claude can't connect:**
- Check config syntax (valid JSON)
- Verify `devsteps-mcp` is in PATH
- Check Claude logs for errors
- Restart Claude Desktop completely

**Permission issues:**
```bash
# Linux/Mac - fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

---

## 🔄 Updating

### VS Code Extension
```bash
# Uninstall old version
code --uninstall-extension devsteps.devsteps-vscode

# Install new version
code --install-extension devsteps-vscode-0.2.0.vsix
```

### MCP Server
```bash
# Global update
npm update -g devsteps-mcp-server

# Or reinstall
npm uninstall -g devsteps-mcp-server
npm install -g dist/mcp/devsteps-mcp-server-0.2.0.tgz
```

---

## 📚 Next Steps

After installation:

1. **Initialize a project:**
   ```bash
   npx devsteps-cli init my-project
   ```

2. **Open in VS Code:**
   - TreeView shows up in Activity Bar
   - Use Command Palette for devsteps commands
   - MCP server appears in Extensions view

3. **Use with GitHub Copilot (VS Code):**
   - Open Copilot Chat (`Ctrl+Shift+I`)
   - Ask: "@workspace Initialize a devsteps project"
   - Ask: "@workspace Show devsteps status"
   - Ask: "@workspace Create a new task: implement login"
   - Copilot uses MCP tools automatically

4. **Use with Claude Desktop:**
   - Ask: "List my devsteps tasks"
   - Create tasks via natural language
   - AI-assisted task management

### VS Code MCP Commands

Access via Command Palette (`Ctrl+Shift+P`):
- `MCP: List Servers` - Show all configured MCP servers
- `MCP: Restart Server` - Restart devsteps MCP server
- `MCP: Stop Server` - Stop MCP server
- `MCP: Start Server` - Start MCP server

---

## 📖 Documentation

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Development guide
- VS Code: Press `F1` → "DevSteps: Help"
- MCP Server: `devsteps-mcp --help`

---

## 🆘 Support

- Issues: https://github.com/your-org/devsteps/issues
- Discussions: https://github.com/your-org/devsteps/discussions
- Docs: https://devsteps.dev/docs
