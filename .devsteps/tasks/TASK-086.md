# Publish to npm Registry

## Prerequisites
- ✅ TASK-083 completed (packages prepared)
- ✅ npm account created
- ✅ npm auth token generated
- ✅ Scope `@schnick371` reserved on npmjs.com

## Publishing Order (CRITICAL!)
```bash
# 1. Publish shared package first (dependency)
cd packages/shared
npm publish --access public

# 2. Publish CLI (depends on shared)
cd ../cli
npm publish --access public

# 3. Publish MCP server (depends on shared)
cd ../mcp-server
npm publish --access public
```

## Pre-Publish Checklist
- [ ] Build all packages: `npm run build`
- [ ] Test local installs: `npm pack` → test installation
- [ ] Version numbers correct (0.5.0)
- [ ] README files complete
- [ ] LICENSE files present
- [ ] `.npmignore` excludes source code

## npm Login
```bash
npm login
# Enter credentials or use auth token
npm whoami  # Verify logged in
```

## Publish Commands
```bash
# Dry-run to preview
npm publish --dry-run

# Actual publish
npm publish --access public
```

## Verification
```bash
# Check published packages
npm view @schnick371/devsteps-cli
npm view @schnick371/devsteps-mcp-server
npm view @schnick371/devsteps-shared

# Test install in clean directory
mkdir test-install && cd test-install
npm install @schnick371/devsteps-cli
npx devsteps --version
```

## Rollback (if needed)
```bash
npm unpublish @schnick371/devsteps-cli@0.5.0
# Note: Can only unpublish within 72 hours
```

## Acceptance Criteria
- ✅ Packages visible on npmjs.com
- ✅ Clean install works
- ✅ CLI executable works: `npx devsteps --version`
- ✅ No source code in published package