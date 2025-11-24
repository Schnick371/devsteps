# DevCrumbs Installation Guide

> **Self-Contained Extension** - No Node.js or external dependencies required!

## 📦 What's Included

The DevCrumbs VS Code extension is **completely self-contained**:
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
3. Search: `devcrumbs`
4. Click **Install**
5. Reload window when prompted

### From VSIX File (Manual)

**Command Line:**
```bash
code --install-extension devcrumbs-vscode-0.2.0.vsix
```

**Or via VS Code UI:**
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: "Extensions: Install from VSIX"
4. Select `devcrumbs-vscode-0.2.0.vsix`
5. Reload VS Code when prompted

---

## ✨ First Use - Automatic Setup

**What happens when you first activate the extension:**

1. **Extension starts** embedded HTTP MCP server on port 3000
2. **Auto-registers** in VS Code MCP settings:
   ```json
   {
     "mcp.servers": {
       "devcrumbs-embedded": {
         "type": "http",
         "url": "http://localhost:3737/mcp",
         "description": "DevCrumbs MCP Server (embedded HTTP server)"
       }
     }
   }
   ```
3. **Status bar** appears: `✓ DevCrumbs MCP: Running`
4. **Notification** confirms server started
5. **MCP tools** available to GitHub Copilot immediately!

**No manual configuration needed!** 🎉

### 🔧 Optional Configuration

You can customize the HTTP server port in VS Code settings:

```json
{
  "devcrumbs.mcp.port": 3737,  // Default: 3737, Range: 1024-65535
  "devcrumbs.mcp.autoStart": true  // Automatically start server on activation
}
```

**Note:** Port 3737 is chosen to avoid common conflicts. Changing the port requires extension reload to take effect.

---

## 🤖 Using with GitHub Copilot

**After installation and reload:**

1. **Verify Status** (bottom-right status bar):
   - Should show: `✓ DevCrumbs MCP: Running`
   - Green checkmark = ready to use

2. **Open any workspace** with a devcrumbs project:
   ```bash
   cd my-project
   code .
   ```

3. **Use in Copilot Chat** (`Ctrl+Shift+I`):
   ```
   @workspace Initialize a devcrumbs project
   @workspace Add a new task for authentication
   @workspace List all high-priority items
   @workspace Show me items blocked by TASK-042
   ```

4. **View in TreeView**:
   - Click DevCrumbs icon in Activity Bar (left sidebar)
   - Browse hierarchical task structure
   - Click items to open markdown files
   - Use toolbar buttons to filter/refresh

---

## 🎯 Initialize Your First Project

**In any workspace:**
```bash
# GitHub Copilot Chat
@workspace Initialize devcrumbs with Scrum methodology

# Or use CLI (if installed separately)
devcrumbs init my-project --methodology scrum
```

**Creates `.devcrumbs/` directory structure:**
```
.devcrumbs/
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
# From devcrumbs repository
docker-compose up -d

# Verify
curl http://localhost:3100/health
```

**2. Configure VS Code (Manual):**

Add to User Settings (`~/.config/Code/User/settings.json` on Linux):
```json
{
  "mcp.servers": {
    "devcrumbs": {
      "type": "http",
      "url": "http://localhost:3100/mcp",
      "description": "DevCrumbs MCP Server (shared Docker instance)"
    }
  }
}
```

**3. Restart VS Code**

### Docker Deployment Options

**Local (docker-compose):**
```bash
docker-compose up -d
docker logs devcrumbs-mcp-server
```

**Kubernetes (production):**
```bash
kubectl apply -f k8s/
kubectl get pods -l app=devcrumbs-mcp
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
2. Search: `@installed devcrumbs`
3. Should show "DevCrumbs - Never Code Alone"

### MCP Server Status
1. **Status Bar** (bottom-right): `✓ DevCrumbs MCP: Running`
2. **Command Palette** (`Ctrl+Shift+P`):
   - Type: "DevCrumbs"
   - Should see devcrumbs commands
3. **Activity Bar**: Look for DevCrumbs icon (left sidebar)

### Test with Copilot
```
@workspace devcrumbs status
@workspace list devcrumbs tasks
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
- Ensure project has `.devcrumbs/` directory
- Initialize: `npx devcrumbs-cli init <project-name>`

### MCP Server (VS Code)

**Server not appearing in Extensions:**
- Check `.vscode/mcp.json` exists and has valid JSON
- Run Command Palette: `MCP: List Servers`
- Should see "devcrumbs" in MCP SERVERS - INSTALLED section
- Restart VS Code completely

**Copilot not using MCP tools:**
- Verify build: `ls packages/mcp-server/dist/index.js`
- Check Copilot output panel for errors
- Restart server: Command Palette → `MCP: Restart Server → devcrumbs`
- Test with: `@workspace List devcrumbs tasks`

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
- Verify `devcrumbs-mcp` is in PATH
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
code --uninstall-extension devcrumbs.devcrumbs-vscode

# Install new version
code --install-extension devcrumbs-vscode-0.2.0.vsix
```

### MCP Server
```bash
# Global update
npm update -g devcrumbs-mcp-server

# Or reinstall
npm uninstall -g devcrumbs-mcp-server
npm install -g dist/mcp/devcrumbs-mcp-server-0.2.0.tgz
```

---

## 📚 Next Steps

After installation:

1. **Initialize a project:**
   ```bash
   npx devcrumbs-cli init my-project
   ```

2. **Open in VS Code:**
   - TreeView shows up in Activity Bar
   - Use Command Palette for devcrumbs commands
   - MCP server appears in Extensions view

3. **Use with GitHub Copilot (VS Code):**
   - Open Copilot Chat (`Ctrl+Shift+I`)
   - Ask: "@workspace Initialize a devcrumbs project"
   - Ask: "@workspace Show devcrumbs status"
   - Ask: "@workspace Create a new task: implement login"
   - Copilot uses MCP tools automatically

4. **Use with Claude Desktop:**
   - Ask: "List my devcrumbs tasks"
   - Create tasks via natural language
   - AI-assisted task management

### VS Code MCP Commands

Access via Command Palette (`Ctrl+Shift+P`):
- `MCP: List Servers` - Show all configured MCP servers
- `MCP: Restart Server` - Restart devcrumbs MCP server
- `MCP: Stop Server` - Stop MCP server
- `MCP: Start Server` - Start MCP server

---

## 📖 Documentation

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Development guide
- VS Code: Press `F1` → "DevCrumbs: Help"
- MCP Server: `devcrumbs-mcp --help`

---

## 🆘 Support

- Issues: https://github.com/your-org/devcrumbs/issues
- Discussions: https://github.com/your-org/devcrumbs/discussions
- Docs: https://devcrumbs.dev/docs
