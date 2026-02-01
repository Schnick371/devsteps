# Testing Guide - DevSteps VS Code Extension mit Embedded MCP

## 🚀 Quick Test (F5 Development Host)

**Best für Development & Debugging:**

1. **Start Extension Development Host:**
   ```bash
   # Im devsteps Projekt-Ordner
   code .
   ```

2. **In VS Code:**
   - Öffne `packages/extension/src/extension.ts`
   - Drücke `F5` (oder Run → Start Debugging)
   - Neue VS Code Fenster öffnet sich: **Extension Development Host**

3. **Was passiert:**
   - Extension wird automatisch aktiviert
   - MCP Server startet auf Port 3098
   - Debug Console zeigt Logs

4. **Verify in Development Host:**
   - Status Bar (rechts unten) → `✓ DevSteps MCP: Running`
   - Extensions View (`Ctrl+Shift+X`) → Search `@mcp` → "devsteps-embedded" sichtbar
   - Output Panel (`Ctrl+Shift+U`) → "DevSteps MCP Server" auswählen → Logs checken

---

## 📦 Production-like Test (Install VSIX)

**Best für End-to-End Testing:**

1. **Install Extension:**
   ```bash
   code --install-extension dist/vscode/devsteps-vscode-0.1.0.vsix
   ```

2. **Reload VS Code:**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

3. **Verify Installation:**
   ```bash
   code --list-extensions | grep devsteps
   # Should show: devsteps.devsteps-vscode
   ```

4. **Uninstall after testing:**
   ```bash
   code --uninstall-extension devsteps.devsteps-vscode
   ```

---

## ✅ Test Checklist

### Extension Basics
- [ ] Activity Bar: DevSteps icon erscheint
- [ ] TreeView: Shows devsteps items (wenn `.devsteps/` existiert)
- [ ] Commands: `Ctrl+Shift+P` → Type "DevSteps" → Commands sichtbar

### MCP Server Status
- [ ] **Status Bar** (bottom right): Shows `✓ DevSteps MCP: Running`
- [ ] Click Status Bar → Opens Settings to `devsteps.mcp`
- [ ] **Extensions View**: Search `@mcp` → "devsteps-embedded" in MCP SERVERS section
- [ ] **Output Panel**: `Ctrl+Shift+U` → Select "DevSteps MCP Server" → See startup logs

### MCP Server Functionality

**Check HTTP Endpoint:**
```bash
# Test health endpoint
curl http://localhost:3098/health

# Should return:
# {"status":"ok","transport":"streamable-http","tools":15}
```

**Check MCP Protocol:**
```bash
# Test tools/list
curl -X POST http://localhost:3098/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Should return all 15 tools
```

### GitHub Copilot Integration

1. **Open Copilot Chat:** `Ctrl+Shift+I` (or `Ctrl+Alt+I`)

2. **Test Commands:**
   ```
   @workspace Initialize a devsteps project
   ```
   - Copilot sollte devsteps-init tool verwenden
   - Response: Project initialization steps

   ```
   @workspace List my devsteps tasks
   ```
   - Copilot sollte devsteps-list tool verwenden
   - Response: Current tasks

   ```
   @workspace Show devsteps status
   ```
   - Copilot sollte devsteps-status tool verwenden
   - Response: Project statistics

3. **Verify Tool Usage:**
   - Check Output Panel → DevSteps MCP Server
   - Should show: "Tool executed successfully" logs

### Settings

**Open Settings:** `Ctrl+,` → Search "devsteps.mcp"

Check these settings exist:
- [ ] `devsteps.mcp.autoStart` = `true` (default)
- [ ] `devsteps.mcp.port` = `3098` (default)

**Test Auto-Start Disable:**
1. Set `devsteps.mcp.autoStart` = `false`
2. Reload Window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Status Bar should show: `⊘ DevSteps MCP: Stopped`
4. Re-enable and reload

**Test Port Change:**
1. Set `devsteps.mcp.port` = `3099`
2. Reload Window
3. Status Bar tooltip should show new port
4. Test: `curl http://localhost:3099/health`

### Error Scenarios

**Port Already in Use:**
1. Start MCP server manually: `node packages/mcp-server/dist/index.js`
2. Try to activate extension
3. Status Bar should show error state
4. Output Panel should show error message

**MCP Server Crash:**
1. With extension running, kill MCP process
2. Status Bar should update to error state

---

## 🐛 Debugging

### Enable Debug Logs

**Extension Logs:**
```
Developer Tools → Console → Filter: "DevSteps"
```

**MCP Server Logs:**
```
Output Panel → Select "DevSteps MCP Server"
```

**VS Code Logs:**
```
Help → Toggle Developer Tools → Console
```

### Common Issues

**Issue: MCP Server doesn't start**
- Check Output Panel for errors
- Verify port 3098 is free: `lsof -i :3098`
- Check Settings: `devsteps.mcp.autoStart` = true

**Issue: Copilot doesn't see MCP tools**
- Verify in Extensions: `@mcp` shows "devsteps-embedded"
- Check `curl http://localhost:3098/health`
- Restart VS Code completely

**Issue: Status Bar shows error**
- Click status bar → See error details
- Check Output Panel → DevSteps MCP Server
- Verify dependencies: `cd packages/mcp-server && pnpm install`

---

## 📊 Success Criteria

Extension is working correctly when:

✅ Status Bar shows: `✓ DevSteps MCP: Running`
✅ Extensions View shows "devsteps-embedded" under MCP SERVERS
✅ `curl http://localhost:3098/health` returns `{"status":"ok"}`
✅ GitHub Copilot can execute devsteps commands
✅ Output Panel shows MCP server logs
✅ Settings page shows devsteps.mcp.* options

---

## 🔄 Development Workflow

### Make Changes → Test

1. **Edit Extension Code:**
   ```
   packages/extension/src/*.ts
   ```

2. **Rebuild:**
   ```bash
   pnpm build
   # Or watch mode:
   cd packages/extension && pnpm watch
   ```

3. **In Extension Development Host:**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```
   - Extension reloads with changes
   - MCP server restarts

4. **Check Logs:**
   - Debug Console (in main VS Code)
   - Output Panel (in Development Host)

### Hot Reload

**Watch Mode (Terminal 1):**
```bash
cd packages/extension
pnpm watch
```

**Development Host (Terminal 2):**
- Press F5 in VS Code
- Code changes auto-compile
- Reload Window to apply

---

## 📋 Test Matrix

| Test | Method | Expected Result |
|------|--------|----------------|
| Extension loads | F5 | Development Host opens |
| MCP starts | Check Status Bar | "✓ DevSteps MCP: Running" |
| MCP visible | Extensions View | "devsteps-embedded" shown |
| HTTP endpoint | curl health | {"status":"ok"} |
| Copilot integration | Chat command | Tool executed |
| Auto-start setting | Toggle & reload | Starts/stops accordingly |
| Port setting | Change & reload | Runs on new port |
| Error handling | Kill server | Status shows error |

---

## 🎯 Next Steps After Testing

1. **Document Issues:** Create tasks for any bugs found
2. **Update INSTALL.md:** Add troubleshooting from test findings
3. **Create Test Cases:** Automated tests for CI/CD
4. **Performance Test:** Test with large devsteps projects
5. **User Acceptance:** Beta test with real users

---

## 💡 Tips

- **Fast Iteration:** Use F5 + Watch mode for quick development
- **Production Test:** Install VSIX before releasing
- **Clean State:** Uninstall extension between tests to verify fresh install
- **Log Everything:** Check both Extension logs and MCP Server logs
- **Test All Tools:** Verify all 15 MCP tools work via Copilot

Happy Testing! 🚀
