# DevCrumbs VS Code Extension

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
- Seamless integration with GitHub Copilot

## 📦 Installation

### From Marketplace (Coming Soon)
Search for "DevCrumbs" in the VS Code Extensions view and click Install.

### From VSIX (Current)
1. Download `devcrumbs-vscode-0.4.0.vsix` from [Releases](https://github.com/devcrumbs/devcrumbs/releases)
2. In VS Code: `Extensions` → `...` → `Install from VSIX...`
3. Select the downloaded `.vsix` file

## 🚀 Getting Started

### Initialize a DevCrumbs Project
```bash
# Install CLI
npm install -g @devcrumbs/cli

# Initialize project
devcrumbs init my-project --methodology scrum

# Add your first work item
devcrumbs add epic "Build Amazing Product"
```

### Use in VS Code
1. Open workspace with DevCrumbs project (`.devcrumbs/` directory present)
2. DevCrumbs icon appears in Activity Bar (left sidebar)
3. **TreeView**: View/filter/sort work items
4. **Dashboard**: Click 📊 button in TreeView toolbar for visualizations

## 🎯 Key Commands

| Command | Description |
|---------|-------------|
| `DevCrumbs: Show Dashboard` | Open interactive project dashboard |
| `DevCrumbs: Refresh Work Items` | Reload items from disk |
| `DevCrumbs: Change View Mode` | Toggle flat/hierarchical view |
| `DevCrumbs: Filter by Status` | Show only items with specific status |
| `DevCrumbs: Sort Items` | Change sorting criteria |

## ⚙️ Configuration

No configuration required! Extension auto-detects DevCrumbs projects.

**Optional Settings** (future releases):
- `devcrumbs.dashboard.traceabilityMaxNodes`: Max nodes in traceability graph (default: 50)
- `devcrumbs.treeView.defaultView`: Initial view mode (default: "flat")

## 🎨 Visual Design

DevCrumbs extension follows **VS Code theme colors** automatically:
- Light themes → Clean, professional appearance
- Dark themes → Eye-friendly, modern aesthetic
- High contrast themes → Fully accessible

## 📈 Performance

**Optimized for Large Projects:**
- Dashboard: <500ms for 1K items, <2s for 10K items
- TreeView: Instant filtering/sorting
- Memory: <50MB for 10K items (within VS Code guidelines)

## 🔧 Troubleshooting

### Extension Not Activating?
- Ensure `.devcrumbs/` directory exists in workspace root
- Check VS Code version (requires 1.95.0+)
- Reload window: `Cmd/Ctrl+Shift+P` → `Developer: Reload Window`

### Dashboard Not Loading?
- Check DevTools console: `Help` → `Toggle Developer Tools`
- Verify `.devcrumbs/index.json` file exists and is valid JSON

### TreeView Empty?
- Run `DevCrumbs: Refresh Work Items` command
- Ensure work items exist (`devcrumbs list` in terminal)

## 🐛 Known Issues

- [ ] Graph force simulation may lag with 100+ highly-connected nodes (optimization in progress)
- [ ] Large project initial load may take 3-5s (caching planned for v0.5.0)

## 📝 Release Notes

### 0.4.0 (Current Release)

**Major Features:**
- ✅ Interactive WebView Dashboard with 5 visualization sections
- ✅ Advanced TreeView filtering and sorting
- ✅ Color-coded status badges (FileDecorationProvider)
- ✅ Performance optimizations (5-10× faster dashboard)
- ✅ Traceability graph node limiting (handles 1K+ items)

**Performance:**
- Dashboard single-load pattern (eliminates 5× redundant file reads)
- Smart node limiting for O(n²) graph rendering

**Technical:**
- TypeScript 5.9.3
- esbuild bundling (321KB)
- Apache 2.0 license

## 🤝 Contributing

DevCrumbs is open source! Contributions welcome:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

See [CONTRIBUTING.md](https://github.com/devcrumbs/devcrumbs/blob/main/CONTRIBUTING.md) for guidelines.

## 📄 License

Apache-2.0 - see [LICENSE](./LICENSE.md)

## 🔗 Links

- **Documentation**: [github.com/devcrumbs/devcrumbs](https://github.com/devcrumbs/devcrumbs)
- **Report Issues**: [github.com/devcrumbs/devcrumbs/issues](https://github.com/devcrumbs/devcrumbs/issues)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **MCP Integration**: [docs/mcp-integration.md](https://github.com/devcrumbs/devcrumbs/blob/main/docs/mcp-integration.md)

---

**Made with ❤️ by developers, for developers. Never code alone.**
