# TSD: VS Code Markdown previewScript ↔ Extension Host Messaging API Research

**Spike:** SPIKE-038  
**Date:** 2026-04-02  
**Status:** RESOLVED — decision documented below  
**Phase C gate:** No Phase C implementation requiring bidirectional host messaging may begin without reading this document.

---

## Research Questions

1. Is `window.addEventListener('message', ...)` in a `previewScript` the stable/correct pattern for **receiving** messages from the extension host?
2. Is `acquireVsCodeApi().postMessage()` — the reverse direction (**previewScript → host**) — stable, proposed, or unavailable in VS Code 1.109+?
3. What is the minimum VS Code version for stable **bidirectional** previewScript ↔ host messaging?

---

## Definitive Findings

### Q1 — Receiving messages (host → previewScript): technically possible, but effectively unavailable

`window.addEventListener('message', event => { ... })` works in the webview context, including in
`previewScript` scripts. The built-in markdown preview uses it internally
([`extensions/markdown-language-features/preview-src/index.ts`](https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/preview-src/index.ts)):

```ts
window.addEventListener('message', async event => {
  const data = event.data as ToWebviewMessage.Type;
  switch (data.type) { ... }
});
```

**However**: to send messages from the extension host *to* the preview webview, you need a handle
to the webview panel's `postMessage()` method. **No public VS Code API exposes this handle to
third-party extensions for the built-in markdown preview.** The built-in markdown extension itself
posts messages to its own preview; third parties cannot inject into that channel.

**Verdict for Q1:** The browser API call compiles and runs, but the round-trip requires host-side
infrastructure that the built-in markdown preview does not expose. Effectively **not viable** for
third-party extensions without a custom WebviewPanel.

---

### Q2 — Sending messages (previewScript → host): NOT available

`acquireVsCodeApi()` can only be called **once per webview**. The built-in
`markdown-language-features` extension calls it first in its own preview script. Any subsequent
call from a third-party `previewScript` throws:

```
[Embedded Page] Uncaught Error: An instance of the VS Code API has already been acquired
```

This behaviour is intentional and labelled **`*as-designed`** by the VS Code team:

- **Issue #122961** (May 2021): *"Extending markdown preview disallows using acquireVsCodeApi in
  embedded previewScripts"* — closed `*as-designed`.
- **Issue #174080** (Feb 2023): *"Communication between an extension and markdown preview script"*
  — closed `*out-of-scope`.
- **Issue #248934** (May 2025): *"Markdown preview scripts — expose postMessage api"* — closed
  **not planned**, assigned to `Backlog Candidates` milestone.

The May 2025 issue (most recent) makes clear that as of VS Code 1.100+ and beyond, exposing
`postMessage` to preview scripts is not on the roadmap.

**Known hack (previewScript → host, one direction only):**  
A URI handler trick works as an escape hatch: insert a hidden `<a href="vscode://publisher.ext?params">` and programmatically `.click()` it. The extension registers a `vscode.window.registerUriHandler`. This is URL-length-limited, fires a browser navigation, and is not a sanctioned API. Not suitable for high-frequency state sync.

**Verdict for Q2:** `acquireVsCodeApi().postMessage()` is **not available** in a third-party
`previewScript`. This is a permanent `*as-designed` constraint, not a versioning gap.

---

### Q3 — Minimum VS Code version for stable bidirectional messaging: N/A

There is **no VS Code version** at which stable bidirectional messaging between a third-party
`previewScript` and the extension host is available via public API. The constraint is
architectural, not versional.

---

## Implications for Phase C (TSD depth slider)

| Requirement | previewScript viable? | Notes |
|---|---|---|
| Render depth slider in preview | ✅ Yes | Pure DOM manipulation, no host required |
| Read current depth from CSS / DOM | ✅ Yes | In-preview only |
| **Persist depth selection to `.devsteps/docs-map.yaml`** | ❌ No | Requires host file I/O, not reachable from previewScript |
| **Sync slider state across preview reloads** | ⚠️ Partial | `localStorage` works within a session / origin; resets if webview is recreated |
| **Bidirectional host ↔ slider messaging** | ❌ No | `acquireVsCodeApi()` not available |

### Decision

> **Phase C features that require cross-session state persistence or extension host communication
> MUST use a custom `WebviewPanel`, NOT `contributes.markdown.previewScripts`.**

The `previewScript` at `./dist/preview/depthSlider.js` (registered in TASK-375) CAN be used for
**in-session ephemeral UI only** — e.g., a depth slider that collapses/expands DOM nodes within the
current preview session without persistence. If cross-session persistence of the selected depth is
required (e.g., remembering the last chosen depth per document in `docs-map.yaml`), a separate
WebviewPanel-based TSD viewer must be built instead.

### Recommended implementation path for Phase C

1. **Option A — Ephemeral depth slider (previewScript):**  
   Build `depthSlider.js` as a pure in-preview DOM manipulation script. State is in-memory only.  
   Suitable if: users accept that the slider resets on each preview open.

2. **Option B — Persistent depth slider (custom WebviewPanel):**  
   Build a full custom `WebviewPanel` that renders the TSD, has its own WebviewPanel handle, and
   can use `webview.postMessage()` / `onDidReceiveMessage` for full bidirectional communication.  
   Suitable if: persistence and cross-session state sync are required.

3. **Option C — Hybrid:**  
   Use `previewScript` for read-only visual rendering (depth-based CSS class toggling), store
   the depth preference in VS Code workspace configuration (`workspace.getConfiguration`) from the
   *extension host* side, not from the previewScript. Depth preference is set via a command
   (`devsteps.setTsdDepth`), not by the slider itself. The slider is decorative/informational only.

---

## Sources

| Source | Date | Status | Key fact |
|---|---|---|---|
| [VS Code Markdown Extension Docs](https://code.visualstudio.com/api/extension-guides/markdown-extension) | 2026-04-01 (live) | Stable | Only documents `previewStyles`, `previewScripts` (scripts), `markdownItPlugins`. No mention of `postMessage`. |
| [VS Code issue #122961](https://github.com/microsoft/vscode/issues/122961) | May 2021 | Closed `*as-designed` | `acquireVsCodeApi()` in previewScript is by-design unavailable |
| [VS Code issue #174080](https://github.com/microsoft/vscode/issues/174080) | Feb 2023 | Closed `*out-of-scope` | Bidirectional messaging request rejected |
| [VS Code issue #248934](https://github.com/microsoft/vscode/issues/248934) | May 2025 | Closed not planned | Expose `postMessage` in previewScripts — not planned |
| [VS Code source: preview-src/index.ts](https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/preview-src/index.ts) | main (live) | Stable | Built-in extension calls `acquireVsCodeApi()` first; uses `messaging.postMessage()` |
| [Stack Overflow #75421859](https://stackoverflow.com/questions/75421859) | Feb 2023, updated Jul 2025 | Community | Only working pattern: URI handler + link .click() hack |

---

## Summary

| Question | Answer |
|---|---|
| Is `window.addEventListener('message', ...)` the correct pattern for receiving host messages? | Technically yes, but no public API to send from the host side for third-party extensions |
| Is `acquireVsCodeApi().postMessage()` stable/proposed? | **Not available** — `*as-designed`, permanently blocked by built-in markdown script |
| Minimum VS Code version for bidirectional messaging? | **Does not exist** — architectural constraint, not a version gap |
| Phase C recommendation? | Custom `WebviewPanel` for any host-persistent feature; `previewScript` only for ephemeral in-session DOM manipulation |
