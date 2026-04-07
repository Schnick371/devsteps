Manually test whether `vscode.commands.executeCommand('markdown.showPreviewToSide', Uri.parse('path/to/doc.md#heading-anchor'))` correctly scrolls to the target heading in VS Code's built-in Markdown preview.

**Test scenario:**
- Create `tmp/anchor-smoke-test.md` with 5+ sections including `## Phase 2 — Infrastructure`
- Call `markdown.showPreviewToSide` with URI `tmp/anchor-smoke-test.md#phase-2-infrastructure`
- Observe: does the preview panel open AND scroll to the `## Phase 2` heading?

**Outcomes to document in `tmp/SPIKE-039-anchor-smoke-test.md`:**
- ✅ `#anchor` works: navigation confirmed, proceed with URI fragment approach in WI-2/WI-3
- ⚠️ Partial: preview opens but doesn't scroll → implement fallback via `postMessage` from previewScript
- ❌ Does not open at anchor: implement custom `selection` range in `showTextDocument` as fallback