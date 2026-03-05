## Summary

Fix all P0 and P1 security/staleness issues before GPU or AI work can proceed. These are hard blockers for every subsequent GPU story and for EPIC-040 STORY-184.

## Acceptance Criteria

- [ ] `getNonce()` replaced: `Math.random()` → `globalThis.crypto.getRandomValues(new Uint8Array(16))` (Node 19+ Electron compatible)
- [ ] CSP updated with minimum required directives (Ollama via MCP proxy path):
  ```
  default-src 'none';
  style-src ${cspSource} 'unsafe-inline';
  script-src 'nonce-${nonce}' ${cspSource};
  connect-src http://localhost:3100;
  ```
- [ ] `connect-src` origin derived dynamically from `devsteps.ai.ollamaBaseUrl` setting (never hardcoded)
- [ ] Full HTML re-render replaced with `postMessage` incremental protocol in `dashboardPanel.ts`:
  - `webview.html` set ONCE at panel creation (skeleton + script tags)
  - `_update()` sends `{ type: 'data-update', payload }` via `webview.postMessage()`
  - Typed `DashboardMessage` discriminated union defined
  - WebGL/WebGPU context never destroyed on data update
- [ ] `retainContextWhenHidden: true` verified present after refactor
- [ ] `esbuild.js`: second entry point added with `platform: 'browser'` for webview bundle
- [ ] `tsconfig.webview.json` created (lib: ["ES2022", "DOM"]) with `@webgpu/types`
- [ ] Biome override for `src/webview-bundle/**` (relax `useNodejsImportProtocol` rule)
- [ ] D3 v7 dependency: minimum stub import added OR removed from package.json (resolves dead-weight)
- [ ] Chart.js v4: removed from package.json
- [ ] All existing extension tests pass
- [ ] `npm run build` succeeds

## Security Notes

- `getNonce()` location: `packages/extension/src/webview/utils/htmlHelpers.ts:24`
- Current code uses `Math.random()` but JSDoc claims "cryptographically random" — active security bug
- Context: CSP nonce is the only XSS barrier for all webview scripts

## Why This Blocks GPU Work

`webview.html = fullString` triggers full DOM teardown. `retainContextWhenHidden: true` only preserves context when panel is *hidden* — NOT on programmatic HTML reassignment. This destroys all WebGL/WebGPU contexts on every data update. Reference: aspect-staleness P1-A finding.

## Effort Estimate

2 days