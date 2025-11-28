# Prepare npm Packages for Publication

## Tasks

### 1. Create/Update `.npmignore` files
**CLI (`packages/cli/.npmignore`):**
```
src/
tsconfig.json
*.ts
!*.d.ts
node_modules/
.git/
```

**MCP Server (`packages/mcp-server/.npmignore`):**
```
src/
tsconfig.json
esbuild.cjs
copy-deps.cjs
*.ts
!*.d.ts
node_modules/
.git/
```

### 2. Fix `package.json` dependencies
- Change `@schnick371/devsteps-shared` from `file:../shared` to published version
- Add `publishConfig.access: "public"` (already present)
- Verify `files` array includes only dist/bin

### 3. Update README files
- Add installation instructions
- Add usage examples
- Link to docs repo (will be created in TASK-085)

### 4. Build and verify
```bash
npm run build
npm pack --dry-run  # Preview what will be published
```

## Acceptance Criteria
- ✅ `.npmignore` excludes source code
- ✅ `npm pack` shows only dist/bin/README/LICENSE
- ✅ Dependencies reference correct versions
- ✅ Build produces clean dist/