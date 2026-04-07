Phase C GATE — no Phase C implementation may begin until this spike is resolved. VS Code contributes.markdown.previewScripts can use acquireVsCodeApi().postMessage() for in-session state (stable API). But routing from previewScript to extension HOST for cross-session state persistence is not clearly stable in VS Code 1.109+. Research questions: (1) Is window.addEventListener('message', ...) in a previewScript the correct stable pattern for receiving host messages? (2) Is acquireVsCodeApi().postMessage() → extension host routing stable or proposed/proposed? (3) What is the minimum VS Code version for stable previewScript ↔ host bidirectional messaging? Output: document findings to docs/architecture/tsd-vscode-api-research.md. Decision: if API is proposed/unstable → fall back to custom WebviewPanel for Phase C (not built-in preview).

## Completion

Research output at `docs/architecture/tsd-vscode-api-research.md`.

**Answers to research questions:**

1. **Q1 (host → previewScript via `window.addEventListener`):** Technically works browser-side, but there is NO public VS Code API for third-party extensions to send messages TO the built-in markdown preview. Only the built-in `markdown-language-features` extension can post to its own preview webview.

2. **Q2 (`acquireVsCodeApi().postMessage()`):** NOT AVAILABLE. Throws `"An instance of the VS Code API has already been acquired"`. Labeled `*as-designed` (issue #122961). Feature requests to expose it (#174080 Feb 2023, #248934 May 2025) both closed as not-planned/out-of-scope.

3. **Q3 (minimum VS Code version for bidirectional messaging):** DOES NOT EXIST — architectural constraint, not a versioning gap.

**Phase C decision:** Any feature requiring cross-session state persistence or extension host communication MUST use a custom `WebviewPanel`. The `depthSlider.js` (TASK-375) is viable for ephemeral in-session DOM manipulation only. Three implementation options documented (A: ephemeral previewScript, B: custom WebviewPanel, C: hybrid with command-based depth setting).