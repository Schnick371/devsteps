# Testing Guide — DevSteps VS Code Extension

## Automated Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch
```

### CLI Integration Tests (BATS)

```bash
# Run CLI integration tests
npm run test:cli
```

### Lint & Type Check

```bash
# Biome linting
npm run lint

# TypeScript type checking
npm run typecheck

# Format code
npm run format
```

### Run All Quality Checks

```bash
# Sequential: lint → unit tests → CLI integration tests
npm run lint && npm test && npm run test:cli
```

---

## Manual Testing — Extension Development Host

### Start the Extension (F5)

1. Open the DevSteps project in VS Code:
   ```bash
   code /path/to/devsteps
   ```
2. Open `packages/extension/src/extension.ts`
3. Press **F5** (or Run → Start Debugging)
4. A new VS Code window opens: **Extension Development Host**

### What Happens on Activation

- Extension activates automatically
- MCP server starts **in-process** on a dynamic OS-assigned port
- Status bar shows: `✓ DevSteps MCP`
- Output panel "DevSteps MCP Server" shows startup logs

### Verify Extension Basics

- [ ] **Activity Bar**: DevSteps icon appears (left sidebar)
- [ ] **TreeView**: Shows work items (if `.devsteps/` exists in workspace)
- [ ] **Commands**: `Ctrl+Shift+P` → type "DevSteps" → commands visible
- [ ] **Status Bar**: Bottom-right shows `✓ DevSteps MCP: Running`

### Verify MCP Server

- [ ] **Extensions View**: `Ctrl+Shift+X` → search `@mcp` → "devsteps-mcp" visible in MCP SERVERS
- [ ] **Output Panel**: `Ctrl+Shift+U` → select "DevSteps MCP Server" → see startup logs

> **Note:** The MCP server port is OS-assigned dynamically and cannot be predicted. Do not use hardcoded port numbers for testing.

### Verify GitHub Copilot Integration

1. Open Copilot Chat (`Ctrl+Shift+I`)
2. Test a DevSteps command:
   ```
   @workspace List my devsteps tasks
   ```
3. Copilot should use the `devsteps-list` MCP tool
4. Check Output Panel → "DevSteps MCP Server" for tool execution logs

### Extension Settings

The extension provides these settings (Settings → search "devsteps"):

| Setting | Default | Description |
|---------|---------|-------------|
| `devsteps.logging.level` | `info` | Logging level: `error`, `warn`, `info`, `debug` |
| `devsteps.logging.showOutputOnError` | `true` | Auto-show output channel on errors |

---

## Production-Like Test (VSIX Install)

```bash
# Build the VSIX
cd packages/extension && npm run package

# Install the VSIX (use actual filename from build output)
code --install-extension devsteps-<version>.vsix

# Reload VS Code
# Ctrl+Shift+P → "Developer: Reload Window"

# Verify
code --list-extensions | grep devsteps

# Uninstall after testing
code --uninstall-extension devsteps.devsteps
```

---

## Debugging

### Extension Logs
- Developer Tools console: `Help` → `Toggle Developer Tools` → Console → filter "DevSteps"

### MCP Server Logs
- Output Panel: `Ctrl+Shift+U` → select "DevSteps MCP Server"

### Common Issues

**MCP server not starting:**
- Check the Output Panel for error messages
- Run `DevSteps: Check Prerequisites` from Command Palette
- Ensure VS Code ≥ 1.109.0

**Copilot doesn't see DevSteps tools:**
- Verify status bar shows "DevSteps MCP: Running"
- Try: `Ctrl+Shift+P` → `MCP: List Servers` → verify "devsteps-mcp" is listed
- Restart VS Code completely

**Extension not activating:**
- Ensure `.devsteps/` directory exists in workspace root, OR
- Extension activates even without a project (for MCP tool availability)
- Check VS Code version (requires ≥ 1.109.0)

---

## Test Matrix

| Test | Method | Expected Result |
|------|--------|----------------|
| Extension loads | F5 | Development Host opens |
| MCP starts | Status Bar | "✓ DevSteps MCP: Running" |
| MCP registered | Extensions View | "devsteps-mcp" in MCP SERVERS |
| Copilot integration | Chat command | Tool executed successfully |
| Unit tests | `npm test` | All tests pass |
| CLI integration | `npm run test:cli` | All BATS tests pass |
| Lint | `npm run lint` | No errors |
| Type check | `npm run typecheck` | No errors |


