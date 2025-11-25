# NPM Publishing Guide - DevSteps Packages

## Pre-Publish Status ✅

All packages prepared for npm publish with:
- ✅ Correct scopes (`@schnick371/devsteps-*`)
- ✅ Version 0.5.0 (breaking change - scope change)
- ✅ Complete metadata (author, homepage, repository, keywords)
- ✅ Files arrays configured
- ✅ publishConfig set to public
- ✅ READMEs created
- ✅ Build successful
- ✅ Import statements updated

## Publishing Order

**CRITICAL: Publish in this order due to dependencies!**

### 1. Shared Package (Foundation)
```bash
cd packages/shared
npm publish
```

**After publishing shared, update dependencies in other packages:**

```bash
# packages/cli/package.json
"@schnick371/devsteps-shared": "^0.5.0"  # Change from file:../shared

# packages/mcp-server/package.json
"@schnick371/devsteps-shared": "^0.5.0"  # Change from file:../shared

# packages/extension/package.json  
"@schnick371/devsteps-shared": "^0.5.0"  # Change from file:../shared
```

**Then reinstall and rebuild:**
```bash
npm install
npm run build
```

### 2. CLI Package
```bash
cd packages/cli
npm publish
```

### 3. MCP Server Package (Update)
```bash
cd packages/mcp-server
npm publish
```

## Post-Publish Verification

### Test Global Installation
```bash
# Test CLI
npm install -g @schnick371/devsteps-cli
devsteps --version
devsteps init test-project --methodology scrum

# Test MCP Server
npm install -g @schnick371/devsteps-mcp-server
devsteps-mcp --version
```

### Verify npm Pages
- https://www.npmjs.com/package/@schnick371/devsteps-shared
- https://www.npmjs.com/package/@schnick371/devsteps-cli
- https://www.npmjs.com/package/@schnick371/devsteps-mcp-server

## VS Code Extension

**Separate publishing process:**
```bash
cd packages/extension
vsce package
vsce publish
```

## Rollback Plan

If issues discovered after publish:
```bash
# Unpublish within 72 hours
npm unpublish @schnick371/devsteps-cli@0.5.0
npm unpublish @schnick371/devsteps-shared@0.5.0
npm unpublish @schnick371/devsteps-mcp-server@0.5.0

# Or deprecate
npm deprecate @schnick371/devsteps-cli@0.5.0 "Use version 0.5.1 instead"
```

## Known Issues

### Current State
- ✅ All packages build successfully
- ✅ Local `file:` dependencies work
- ⚠️ Must change to npm dependencies AFTER shared is published

### Post-Publish Required
1. Update all `file:../shared` → `^0.5.0` in dependencies
2. Run `npm install` in root to update lock file
3. Rebuild all packages
4. Test locally before publishing CLI/MCP
5. Update VS Code extension `npm install` to fetch from npm

## Package Details

### @schnick371/devsteps-shared@0.5.0
- **Size**: 62.4 kB unpacked
- **Files**: dist/, src/, README.md, LICENSE.md
- **Main**: ./dist/index.js
- **Types**: ./dist/index.d.ts

### @schnick371/devsteps-cli@0.5.0
- **Size**: 56.4 kB unpacked
- **Binary**: devsteps, devsteps-tsx
- **Dependencies**: @schnick371/devsteps-shared, @inquirer/prompts, ora

### @schnick371/devsteps-mcp-server@0.5.0
- **Size**: 1.7 MB unpacked (includes bundled dependencies)
- **Binary**: devsteps-mcp, devsteps-mcp-tsx
- **Dependencies**: @schnick371/devsteps-shared, MCP SDK, express, pino

## Checklist Before npm publish

- [ ] npm login as schnick371
- [ ] All builds pass
- [ ] READMEs reviewed
- [ ] package.json versions correct
- [ ] Keywords appropriate
- [ ] Repository URLs correct
- [ ] LICENSE.md exists
- [ ] npm pack --dry-run looks good

## Next Steps

1. **Decision**: Ready to publish? Y/N
2. **Publish shared** first
3. **Update dependencies** to ^0.5.0
4. **Rebuild** and test
5. **Publish CLI** and **MCP server**
6. **Test global install**
7. **Update VS Code extension** if needed
