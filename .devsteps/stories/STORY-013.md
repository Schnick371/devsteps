# Update Ora 8 → 9 and esbuild 0.24 → 0.27

## Updates
- ora: 8.2.0 → 9.0.0 (CLI spinner)
- esbuild: 0.24.2 → 0.27.0 (bundler)

## Ora 9 Changes
- Node.js 18+ required (✅ we use 22)
- No breaking API changes for our usage

## esbuild 0.27 Changes
- ESM/CJS bundling improvements
- Better TypeScript support
- Performance optimizations

## Risk Assessment
- **Low risk**: Stable tools, minor updates
- **CLI only**: ora used in packages/cli
- **Build tool**: esbuild for extension/mcp-server