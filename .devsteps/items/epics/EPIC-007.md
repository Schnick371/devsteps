# Update all npm dependencies to latest versions

## Context
Before publishing to GitHub/npm, update all dependencies to latest stable versions to ensure security, performance, and compatibility.

## Discovered Updates (npm outdated)
- @biomejs/biome: 2.3.6 → 2.3.7
- @types/node: 22.10.2 → 24.10.1
- @inquirer/prompts: 7.10.1 → 8.0.1
- chalk: 4.1.2 → 5.6.2 (ESM-only)
- esbuild: 0.24.2 → 0.27.0
- express: 4.21.2 → 5.1.0 (breaking changes)
- ora: 8.2.0 → 9.0.0
- vitest: 4.0.12 → 4.0.14
- zod: 4.1.12 → 4.1.13
- @vscode/vsce: 3.7.0 → 3.7.1
- @types/bun: 1.3.2 → 1.3.3

## Success Criteria
- All packages updated to latest versions
- All builds pass (npm run build)
- All tests pass (npm test)
- No runtime errors in CLI/MCP-Server/Extension
- Documentation updated if needed