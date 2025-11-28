# Publish Extension to VS Code Marketplace

## Prerequisites
- ✅ TASK-084 completed (auto-download implemented)
- ✅ TASK-086 completed (npm packages published)
- ✅ Azure DevOps account with PAT token
- ✅ Publisher created on marketplace

## Setup Publisher
```bash
# Install vsce
npm install -g @vscode/vsce

# Create publisher (first time only)
vsce create-publisher schnick371
```

## Pre-Publish Checklist
- [ ] Extension builds: `npm run build`
- [ ] VSIX packages: `vsce package`
- [ ] Test VSIX locally: Extensions → Install from VSIX
- [ ] Version correct in package.json
- [ ] README with screenshots
- [ ] CHANGELOG updated
- [ ] Icon present
- [ ] Repository URLs point to docs repo

## Package Extension
```bash
cd packages/extension
vsce package
# Creates: devsteps-0.5.0.vsix
```

## Test Locally
```bash
# Install VSIX in fresh VS Code
code --install-extension devsteps-0.5.0.vsix

# Test auto-download
# 1. Reload VS Code
# 2. Check output channel for package installation
# 3. Verify MCP configured in settings
# 4. Test CLI: Open terminal → devsteps --version
```

## Publish to Marketplace
```bash
# Login with PAT
vsce login schnick371

# Publish
vsce publish
# Or publish specific VSIX
vsce publish --packagePath devsteps-0.5.0.vsix
```

## Verification
- Check marketplace: https://marketplace.visualstudio.com/items?itemName=schnick371.devsteps
- Install from marketplace in clean VS Code
- Verify auto-download works
- Test full workflow: init project → add item → open dashboard

## Rollback (if critical bug)
```bash
vsce unpublish schnick371.devsteps
# Then fix and republish
```

## Acceptance Criteria
- ✅ Extension visible on marketplace
- ✅ Install from marketplace works
- ✅ Auto-download installs CLI + MCP
- ✅ MCP configured automatically
- ✅ Full workflow functional