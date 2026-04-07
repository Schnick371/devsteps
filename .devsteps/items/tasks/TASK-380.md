Add `@vscode/test-electron` to `packages/extension/package.json` devDependencies (not yet present) and create contract tests for the doc navigation providers.

**Steps:**
1. Add `@vscode/test-electron` to devDependencies
2. Create fixture files:
   - `packages/extension/src/__tests__/fixtures/sample.ts` — sample TypeScript with JSDoc
   - `packages/extension/src/__tests__/fixtures/docs-map.yaml` — minimal docs-map with `devsteps_items` entries
   - `packages/extension/src/__tests__/fixtures/mpd-architecture.md` — minimal TSD section
3. Write contract test for `DocCodeLensProvider.provideCodeLenses()` — expects at least one lens when fixture symbols match docs-map entries
4. Write contract test for `DocHoverProvider.provideHover()` — expects doc excerpt in hover result