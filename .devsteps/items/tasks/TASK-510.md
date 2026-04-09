YAML Frontmatter in DOC-Item `.md` Dateien wird beim Assemblieren (BOM → Dokument) NICHT entfernt. Ergebnis: Frontmatter-YAML im Output-Dokument sichtbar.

**Lösung:**
1. `npm install gray-matter` in `packages/mcp-server` (NICHT in `packages/shared` — Extension Sandbox Constraint)
2. `stripFrontmatter(content: string): string` Hilfsfunktion in `packages/mcp-server/src/utils/docs-utils.ts`
3. Integration in den `devsteps_docs_assemble`-Handler: vor dem Zusammenführen von Chunks alle `.md`-Inhalte durch `stripFrontmatter()` schicken

**Constraint:** gray-matter NIEMALS in `packages/shared` oder `packages/extension` — nur `packages/mcp-server`.

**Test:** Unit-Test in `packages/mcp-server/src/utils/docs-utils.test.ts` — Input mit Frontmatter, erwarteter Output ohne.

Parent: STORY-253