#!/bin/bash
set -e

echo "🧹 DevSteps COMPLETE Cleanup Script (Including Extension!)"
echo "==========================================================="
echo ""

# 0. VS Code Extension deinstallieren (WICHTIGSTER SCHRITT!)
echo "🔌 Step 0: Uninstalling VS Code Extension..."
echo "Checking for installed extensions..."
INSTALLED=$(code --list-extensions 2>/dev/null | grep -iE "schnick|devsteps" || true)
if [ -n "$INSTALLED" ]; then
    echo "Found: $INSTALLED"
    echo "Uninstalling..."
    code --uninstall-extension schnick371.devsteps 2>/dev/null || true
    code --uninstall-extension devsteps 2>/dev/null || true
    echo "✅ Extension uninstalled"
else
    echo "✅ No DevSteps extension found"
fi
echo ""

# 1. Global npm packages deinstallieren
echo "📦 Step 1: Uninstalling global npm packages..."
npm uninstall -g @schnick371/devsteps-shared 2>/dev/null || true
npm uninstall -g @schnick371/devsteps-cli 2>/dev/null || true
npm uninstall -g @schnick371/devsteps-mcp-server 2>/dev/null || true
echo "✅ Global packages uninstalled"
echo ""

# 2. Extension-Verzeichnis manuell prüfen
echo "📁 Step 2: Checking extension directories..."
if ls ~/.vscode/extensions/*devsteps* 2>/dev/null; then
    echo "⚠️  Found DevSteps extension files, removing..."
    rm -rf ~/.vscode/extensions/*devsteps*
    echo "✅ Extension files removed"
else
    echo "✅ No extension files found"
fi
echo ""

# 3. MCP Konfigurationsdateien bereinigen
echo "⚙️  Step 3: Cleaning MCP configuration files..."

# User mcp.json
if [ -f ~/.config/Code/User/mcp.json ]; then
    echo "Backing up ~/.config/Code/User/mcp.json to /tmp/mcp.json.backup"
    cp ~/.config/Code/User/mcp.json /tmp/mcp.json.backup
    > ~/.config/Code/User/mcp.json  # Leere Datei
    echo "✅ User mcp.json cleaned"
else
    echo "Creating empty ~/.config/Code/User/mcp.json"
    touch ~/.config/Code/User/mcp.json
fi

# Workspace mcp.json
WORKSPACE_DIR="$(pwd)"
if [ -f "$WORKSPACE_DIR/.vscode/mcp.json" ]; then
    echo "Cleaning workspace mcp.json"
    > "$WORKSPACE_DIR/.vscode/mcp.json"  # Leere Datei
    echo "✅ Workspace mcp.json cleaned"
fi
echo ""

# 4. VS Code Workspace Storage bereinigen
echo "💾 Step 4: Cleaning VS Code workspace storage..."
find ~/.config/Code/User/workspaceStorage -type f -name "*.json" -exec grep -l "devsteps\|schnick371" {} \; 2>/dev/null | while read -r file; do
    echo "Cleaning: $file"
    rm -f "$file"
done
echo "✅ Workspace storage cleaned"
echo ""

# 5. npm Cache bereinigen
echo "🗑️  Step 5: Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true
echo "✅ npm cache cleaned"
echo ""

# 6. Überprüfung
echo "🔍 Step 6: Final Verification..."
echo ""
echo "Installed Extensions:"
code --list-extensions 2>/dev/null | grep -iE "schnick|devsteps" || echo "  ✅ No DevSteps extension"
echo ""
echo "Global npm packages:"
npm list -g --depth=0 2>/dev/null | grep devsteps || echo "  ✅ No DevSteps packages"
echo ""
echo "Extension directories:"
ls ~/.vscode/extensions/*devsteps* 2>/dev/null || echo "  ✅ No DevSteps extension files"
echo ""
echo "MCP configs:"
if [ -s ~/.config/Code/User/mcp.json ]; then
    echo "  ⚠️  User mcp.json still has content:"
    cat ~/.config/Code/User/mcp.json
else
    echo "  ✅ User mcp.json empty"
fi
echo ""

echo "✅ COMPLETE Cleanup finished!"
echo ""
echo "📋 Next steps:"
echo "1. Close ALL VS Code windows"
echo "2. Restart VS Code"
echo "3. Verify extension is gone: code --list-extensions | grep devsteps"
echo "4. Install fresh: code --install-extension packages/extension/devsteps-0.4.5.vsix"
echo "5. Open this workspace and monitor installation"
