# Fix esbuild Output Format to ESM

## Objective
Change esbuild output from CommonJS to ESM to match package.json `"type": "module"`.

## Changes Required

### packages/extension/esbuild.js
```typescript
const extensionBuildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'esm', // CHANGE: was 'cjs'
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
  mainFields: ['module', 'main'],
  conditions: ['node'],
  metafile: true,
};
```

## Rationale
- **Safe for STORY-061**: No changes to TypeScript source files
- **Preserves conventions**: `.js` import extensions remain valid
- **Fixes activation**: VS Code will load ESM output correctly
- **Low risk**: Only changes build output format

## Testing
1. Build extension: `npm run build`
2. Launch debug mode (F5)
3. Verify extension activates
4. Test MCP runtime detection (STORY-061 feature)
5. Verify TreeView loads
6. Test production VSIX build

## Success Criteria
- Extension activates in debug mode without errors
- All STORY-061 functionality still works
- No "module is not defined" errors
- MCP server starts correctly
