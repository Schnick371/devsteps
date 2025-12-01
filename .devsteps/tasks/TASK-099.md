# Deploy HIERARCHY.md + AI-GUIDE.md on Init

## Objective
Copy `.devsteps/HIERARCHY.md` and `.devsteps/AI-GUIDE.md` to new projects during `devsteps init`.

## Current State
- Files exist in DevSteps repo `.devsteps/` directory
- NOT deployed to new projects
- Copilot has no reference when creating items

## Target State
After `devsteps init`:
```
my-project/
├── .devsteps/
│   ├── config.json
│   ├── index.json
│   ├── HIERARCHY.md      ← NEW!
│   ├── AI-GUIDE.md        ← NEW!
│   ├── epics/
│   └── ...
```

## Implementation

### 1. CLI Init Command
**File**: `packages/cli/src/commands/init.ts`

Around line 348 (after creating SETUP.md):
```typescript
// Copy HIERARCHY.md
const hierarchySource = join(sourceGithubDir, '..', '.devsteps', 'HIERARCHY.md');
if (existsSync(hierarchySource)) {
  const hierarchyContent = readFileSync(hierarchySource, 'utf8');
  writeFileSync(join(devstepsDir, 'HIERARCHY.md'), hierarchyContent);
}

// Copy AI-GUIDE.md
const aiGuideSource = join(sourceGithubDir, '..', '.devsteps', 'AI-GUIDE.md');
if (existsSync(aiGuideSource)) {
  const aiGuideContent = readFileSync(aiGuideSource, 'utf8');
  writeFileSync(join(devstepsDir, 'AI-GUIDE.md'), aiGuideContent);
}
```

### 2. MCP Init Handler
**File**: `packages/mcp-server/src/handlers/init.ts`

Around line 113 (after creating agent files):
```typescript
// Copy HIERARCHY.md
const hierarchySource = join(packageRoot, '.devsteps', 'HIERARCHY.md');
if (existsSync(hierarchySource)) {
  const hierarchyContent = readFileSync(hierarchySource, 'utf8');
  writeFileSync(join(devstepsDir, 'HIERARCHY.md'), hierarchyContent);
}

// Copy AI-GUIDE.md
const aiGuideSource = join(packageRoot, '.devsteps', 'AI-GUIDE.md');
if (existsSync(aiGuideSource)) {
  const aiGuideContent = readFileSync(aiGuideSource, 'utf8');
  writeFileSync(join(devstepsDir, 'AI-GUIDE.md'), aiGuideContent);
}
```

### 3. Update Success Messages
Add to console output:
```
✓ Documentation: .devsteps/HIERARCHY.md
✓ Documentation: .devsteps/AI-GUIDE.md
```

### 4. Package Build
Ensure files are copied during `npm run build`:
- Update `packages/cli/package.json` files array
- Update `packages/mcp-server/copy-deps.cjs`

## Acceptance Criteria
- [ ] HIERARCHY.md deployed to `.devsteps/` on CLI init
- [ ] AI-GUIDE.md deployed to `.devsteps/` on CLI init
- [ ] HIERARCHY.md deployed to `.devsteps/` on MCP init
- [ ] AI-GUIDE.md deployed to `.devsteps/` on MCP init
- [ ] Success messages show file creation
- [ ] Files included in npm packages
- [ ] Test on fresh project init

## Affected Files
- `packages/cli/src/commands/init.ts`
- `packages/mcp-server/src/handlers/init.ts`
- `packages/cli/package.json`
- `packages/mcp-server/copy-deps.cjs`