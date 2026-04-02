Three additions needed in the extension manifest: (1) "extensionDependencies": ["vscode.markdown-language-features"] to guarantee activation order; (2) "contributes": { "markdown": { "markdownItPlugins": true, "previewScripts": ["./dist/preview/depthSlider.js"] } } entry for the depth slider previewScript. These must be added BEFORE any embed plugin or depth slider code is written, as VS Code silently ignores they are not in the manifest. Phase C pre-requisite.

---
## Completion (Sprint 2026-04-02)

Added `extensionDependencies: ["vscode.markdown-language-features"]`, `contributes.markdown.markdownItPlugins: true`, and `contributes.markdown.previewScripts: ["./dist/preview/depthSlider.js"]` to extension package.json. Merged branch task/TASK-375 → main.