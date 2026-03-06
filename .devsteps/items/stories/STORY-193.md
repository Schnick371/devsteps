## Context

Research session (2026-03-05) surveying 9 real-world VS Code GPU extensions identified `dashboardPanel.ts` has two P1 architectural blockers for GPU adoption:

1. **Full HTML reassignment on every update** (`dashboardPanel.ts:83`): `this._panel.webview.html = this._getHtmlForWebview(...)` runs inside `_update()`. This destroys the DOM → GPU context loss on every data refresh. GPU context re-initialization takes 100–500ms. Compound risk score: 90 (FATAL for GPU).

2. **No browser SPA bundle** (`esbuild.js`): Single `platform: 'node'` entry. Zero browser SPA bundle. Without a browser-target bundle there is no import path for Sigma.js, Three.js, D3 (browser-only), or any GPU library. Compound risk score: 80 (FATAL for GPU).

## Required Changes

### Fix 1: One-Time HTML Init + postMessage Protocol
- `createOrShow()` sets `webview.html` once
- All data pushed via `panel.webview.postMessage({ type: 'updateItems', payload: items })`
- Webview listens: `window.addEventListener('message', handler)`
- Zod `WebviewMessage` schema in `packages/shared/src/schemas/webview-messages.ts`

### Fix 2: Browser SPA esbuild Entry
- Add to `esbuild.js`:
  ```javascript
  {
    entryPoints: ['src/webview/index.ts'],
    bundle: true,
    outfile: 'dist/webview/dashboard.js',
    platform: 'browser',
    target: ['chrome120'],
    sourcemap: true,
  }
  ```
- Load in HTML via `webview.asWebviewUri(Uri.joinPath(extensionUri, 'dist', 'webview', 'dashboard.js'))`
- Update `localResourceRoots` to include `dist/webview/` directory

## Acceptance Criteria
- Webview renders correctly
- Webview data updates without DOM teardown
- postMessage round-trip test passes (Zod schema validated)
- Browser bundle < 500KB gzipped
- `npm run build` clean

## References
- Research: `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` §Pattern 2 + §Pattern 3
- Validates: Continue.dev SPA pattern, OHZI GLB Viewer one-time init
- Required before: Sigma.js renderer (STORY-190 or successor)