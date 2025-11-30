## Objective
Verify complete extension deployment and installation flow works end-to-end.

## Test Environment
- Clean VS Code installation (or new profile)
- No existing DevSteps packages installed
- No devsteps workspace open

## Test Steps

### 1. Package extension
cd packages/extension
npm run build
vsce package --no-dependencies

### 2. Verify package
- Check .vsix file size (should be smaller without bundled MCP server)
- Unzip and verify dist/mcp-server/ is NOT included

### 3. Install extension
- Install .vsix in clean VS Code
- Monitor VS Code Developer Tools console for errors

### 4. Verify auto-installation
- Extension should show progress notification
- Packages installed to global npm:
  - @schnick371/devsteps-shared
  - @schnick371/devsteps-cli  
  - @schnick371/devsteps-mcp-server

### 5. Verify MCP server
- Open workspace with .devsteps/
- Check MCP server starts successfully
- Verify tools available in Copilot chat

### 6. Test CLI
- Open terminal
- Run: devsteps --version
- Should work globally

## Expected Results
- ✅ Extension packages without errors
- ✅ Package size < 5MB (without bundled server)
- ✅ Auto-installation works on first activation
- ✅ MCP server runs successfully
- ✅ CLI accessible globally
- ✅ No missing dependency errors

## Platforms to Test
- Windows 11
- Linux (Ubuntu)
- macOS
- WSL2