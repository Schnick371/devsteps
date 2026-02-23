#!/bin/bash

# Distribution Package Build Script
# Creates VSIX and MCP server packages ready for distribution

set -e

echo "🔧 Building Distribution Packages..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Step 1: Clean and sequential build
echo ""
echo "📦 Step 1/4: Clean and build..."
pnpm clean

# Build shared first (dependency for others)
echo "  Building shared..."
cd packages/shared && pnpm build && cd ../..

# Build rest in parallel
echo "  Building packages..."
pnpm --filter '@devsteps/cli' build &
pnpm --filter '@devsteps/mcp-server' build &
pnpm --filter 'devsteps-vscode' build &
wait

# Step 2: Package MCP Server
echo ""
echo "📦 Step 2/4: Package MCP Server..."
cd packages/mcp-server
pnpm pack --pack-destination ../../dist/mcp
cd ../..
echo "✅ MCP Server packaged: dist/mcp/devsteps-mcp-server-*.tgz"

# Step 3: Package VS Code Extension
echo ""
echo "📦 Step 3/4: Package VS Code Extension..."
cd packages/vscode-extension

# Package VSIX using npm exec to avoid pnpm workspace issues
# VSCE uses npm list internally which doesn't understand pnpm workspace: protocol
npm exec @vscode/vsce -- package --no-dependencies --allow-missing-repository --out ../../dist/vscode
cd ../..
echo "✅ VSIX packaged: dist/vscode/devsteps-vscode-*.vsix"

# Step 4: Create installation documentation
echo ""
echo "📦 Step 4/4: Generate installation guide..."
mkdir -p dist/docs
cat > dist/docs/INSTALL.md << 'EOF'
# DevSteps Installation Guide

## Quick Install

### VS Code Extension

1. Install the VSIX file:
   \`\`\`bash
   code --install-extension devsteps-vscode-0.1.0.vsix
   \`\`\`

2. Reload VS Code

### MCP Server (for Claude Desktop)

1. Install the MCP server globally:
   \`\`\`bash
   npm install -g devsteps-mcp-server-0.1.0.tgz
   \`\`\`

2. Configure Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   \`\`\`json
   {
     "mcpServers": {
       "devsteps": {
         "command": "devsteps-mcp",
         "args": []
       }
     }
   }
   \`\`\`

3. Restart Claude Desktop

## Manual Installation

### VS Code Extension

1. Open VS Code
2. Press \`Ctrl+Shift+P\` (or \`Cmd+Shift+P\` on Mac)
3. Type "Extensions: Install from VSIX"
4. Select the \`devsteps-vscode-0.1.0.vsix\` file

### MCP Server

1. Extract the tarball:
   \`\`\`bash
   tar -xzf devsteps-mcp-server-0.1.0.tgz
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   cd package && npm install
   \`\`\`

3. Use the full path in Claude Desktop config

## Troubleshooting

### VS Code Extension

- **Extension not loading**: Check Output > DevSteps for errors
- **Commands not available**: Reload VS Code window

### MCP Server

- **Server not connecting**: Check Claude Desktop logs
- **Command not found**: Ensure npm global bin is in PATH
  \`\`\`bash
  npm config get prefix
  # Add <prefix>/bin to your PATH
  \`\`\`

## Verification

### VS Code Extension

1. Open Command Palette (\`Ctrl+Shift+P\`)
2. Type "DevSteps: Status"
3. Should show project overview

### MCP Server

1. In Claude Desktop, create new conversation
2. Ask: "List devstepsitems"
3. Should show available devstepscommands
EOF

echo "✅ Installation guide created: dist/docs/INSTALL.md"

echo ""
echo "✨ Distribution build complete!"
echo ""
echo "📦 Packages ready in dist/:"
ls -lh dist/vscode/ dist/mcp/ dist/docs/
