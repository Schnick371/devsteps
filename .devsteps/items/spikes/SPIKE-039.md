Research how to link code symbols (functions, classes, variables) to specific TSD document sections so that VS Code's "Find References" sidebar shows associated documentation alongside code references. The user should be able to right-click a function name → References sidebar → see documentation entries linking to the TSD section that documents this function. Clicking the doc entry opens the document at the correct depth level and scrolled to the right section.

Research questions:
1. Which VS Code extension API enables contributing custom entries to the "Find References" / "References" sidebar? (ReferenceProvider, CodeLensProvider, or something else?)
2. How does the code → doc linking work? Does the symbol name embed in docs-map.yaml? Via annotations in source code? Via separate index file?
3. What is the persistence model: how does a dev associate a function with an ARCH-NNN BOM position?
4. Can the extension open a custom document at a specific depth level + scroll position when the doc entry is clicked?
5. Are there existing open-source extensions with reference-sidebar entries pointing to documentation (not code)?
6. How does this interact with the existing `doc_section: { doc_id, anchor }` metadata bag approach?## Research Output — Gate PASS (0.97)

Research brief: `tmp/SPIKE-039-CodeToDoc-Research-Brief.md`

### Binding Decisions
- **Approach A (ReferenceProvider) REJECTED:** Clicking `.md` Location opens text editor mode → depth slider (STORY-227 previewScript) is unavailable → broken UX
- **Approach B (CodeLensProvider) + Approach C (HoverProvider) RECOMMENDED:** Both execute `markdown.showPreviewToSide` → depth slider active ✅
- **Phase 2 symbol annotation:** JSDoc `@see ARCH-NNN` auto-scanned by extension; no DevSteps tool parameter needed; annotation survives function rename

### Phase 1 Deliverables (6 new work items)
1. TASK — `DocIndex.ts` abstraction (file-level lookup, vitest-testable)
2. STORY — `DocCodeLensProvider` (`📄 §3.2 · Architecture`)
3. STORY — `DocHoverProvider` (excerpt popup + nav link)
4. TASK — JSDoc `@see` scanner (Phase 2)
5. TASK — `@vscode/test-electron` test infra
6. TASK — Smoke test: `markdown.showPreviewToSide` + `#anchor` fragment