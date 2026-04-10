#!/usr/bin/env bash
# patch-windows.sh — copy local dist builds to Windows npm global modules
# Run from repo root after: npm run build
#
# Usage:
#   ./scripts/patch-windows.sh          # patch dist only (fast)
#   ./scripts/patch-windows.sh --build  # build first, then patch
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
W="/mnt/c/Users/th/AppData/Roaming/npm/node_modules/@schnick371"

# Validate Windows path is accessible
if [[ ! -d "$W" ]]; then
  echo "ERROR: Windows npm module path not accessible: $W" >&2
  echo "Ensure you are running in WSL2 with Windows drive mounted." >&2
  exit 1
fi

if [[ "${1:-}" == "--build" ]]; then
  echo "Building..."
  cd "$REPO_ROOT"
  npm run build
fi

echo "Patching Windows npm global modules..."

# CLI
if [[ -d "$W/devsteps-cli" ]]; then
  cp -r "$REPO_ROOT/packages/cli/dist/"* "$W/devsteps-cli/dist/"
  cp -r "$REPO_ROOT/packages/cli/bin/"* "$W/devsteps-cli/bin/"
  echo "  ✓ devsteps-cli dist + bin"
else
  echo "  ⚠ devsteps-cli not installed, skipping"
fi

# MCP Server
if [[ -d "$W/devsteps-mcp-server" ]]; then
  cp -r "$REPO_ROOT/packages/mcp-server/dist/"* "$W/devsteps-mcp-server/dist/"
  cp -r "$REPO_ROOT/packages/mcp-server/bin/"* "$W/devsteps-mcp-server/bin/"
  echo "  ✓ devsteps-mcp-server dist + bin"
else
  echo "  ⚠ devsteps-mcp-server not installed, skipping"
fi

# Shared — check for nested copy first, fall back to global
MCP_SHARED="$W/devsteps-mcp-server/node_modules/@schnick371/devsteps-shared"
if [[ -d "$MCP_SHARED" ]]; then
  cp -r "$REPO_ROOT/packages/shared/dist/"* "$MCP_SHARED/dist/"
  echo "  ✓ devsteps-shared (nested in mcp-server)"
elif [[ -d "$W/devsteps-shared" ]]; then
  cp -r "$REPO_ROOT/packages/shared/dist/"* "$W/devsteps-shared/dist/"
  echo "  ✓ devsteps-shared (global)"
else
  echo "  ⚠ devsteps-shared not installed, skipping"
fi

# VS Code Extension (VSIX)
VSIX_PATH="$(ls -t "$REPO_ROOT/packages/extension/"*.vsix 2>/dev/null | head -n1)"
if [[ -z "$VSIX_PATH" ]]; then
  echo "  ⚠ No VSIX found in packages/extension/ — run 'npm run package' in that folder first"
else
  VSIX_NAME="$(basename "$VSIX_PATH")"
  echo "  📦 Found VSIX: $VSIX_NAME"

  # Install into the running VS Code Server (WSL2 remote extension host)
  if command -v code &>/dev/null; then
    code --install-extension "$VSIX_PATH" --force && echo "  ✓ devsteps extension installed into VS Code Server (WSL2)"
  else
    echo "  ⚠ 'code' CLI not in PATH — skipping VS Code Server install"
  fi

  # Install into Windows VS Code via PowerShell
  WIN_VSIX="$(wslpath -w "$VSIX_PATH")"
  if powershell.exe -NoProfile -Command "
    \$code = (Get-Command code.cmd -ErrorAction SilentlyContinue) ?? (Get-Command code -ErrorAction SilentlyContinue);
    if (\$code) { & \$code.Source --install-extension '$WIN_VSIX' --force; exit 0 } else { exit 1 }
  " 2>/dev/null; then
    echo "  ✓ devsteps extension installed into Windows VS Code"
  else
    echo "  ⚠ Could not install into Windows VS Code (code.cmd not found or PowerShell unavailable)"
    echo "    Manual install: Extensions → ⋯ → Install from VSIX → $VSIX_NAME"
  fi
fi

echo ""
echo "Done. Verify with:"
echo "  powershell.exe -NoProfile -Command \"devsteps --version\""
echo "  powershell.exe -NoProfile -Command \"devsteps-mcp-server --version\""
echo "  devsteps --version"
