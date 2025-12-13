# Production Publication Pipeline

## Goal
Enable users to install DevSteps from VS Code Marketplace with full auto-configuration (MCP + CLI) while keeping source code private.

## Strategy: Option B (Download on Demand)
Extension downloads CLI + MCP from npm on first activation → Clean, standard approach.

## Publishing Order (CRITICAL!)
```
1. npm publish CLI package
2. npm publish MCP server package  
3. VS Code Marketplace publish extension
```

**Why?** Extension needs packages available for download. If extension publishes first → installation fails.

## What Gets Published

### 1. npm Packages (Compiled Only)
- `@schnick371/devsteps-cli` - compiled dist/ only
- `@schnick371/devsteps-mcp-server` - compiled dist/ only
- Source code stays private (use `.npmignore`)

### 2. VS Code Marketplace
- Extension VSIX with compiled code
- Auto-download mechanism for CLI + MCP
- Links to docs repo in README

### 3. GitHub Repository (Docs Only)
- `devsteps-docs` repo (public)
- README, LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY
- Installation guides, usage docs
- NO source code

## User Experience Flow
1. User: Install extension from marketplace
2. Extension: Detects first activation
3. Extension: Downloads `@schnick371/devsteps-cli` from npm
4. Extension: Downloads `@schnick371/devsteps-mcp-server` from npm
5. Extension: Configures MCP in VS Code settings
6. User: Can use `devsteps init` immediately ✅

## Success Criteria
- ✅ User installs from marketplace in fresh VS Code
- ✅ Extension auto-configures MCP + CLI
- ✅ `devsteps init` works without manual setup
- ✅ Docs on GitHub, source code stays private
- ✅ Updates work via marketplace/npm