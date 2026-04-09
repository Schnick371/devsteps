Ein Health-Check für DOC-Items fehlt. Die `devsteps doctor` Ausgabe prüft allgemeine Item-Integrität, aber nicht DOC-spezifische Qualitätsmetriken.

**4 zu implementierende Metriken:**
1. **`affected_paths_empty`** — DOC-Items ohne `affected_paths` (Migration-Tracking)
2. **`missing_bom_entry`** — DOC-Items die nicht in `docs-map.json` registriert sind
3. **`broken_documents_link`** — `documents`/`documented-by` Links die auf nicht-existente Items zeigen
4. **`content_empty`** — DOC-Items deren `.md`-Datei leer ist (<50 Zeichen)

**Optionaler Filter** im `devsteps_health`-Tool: `item_type: 'doc'` (aus Research-Brief `research-brief-ai-tool-parameter-design.md`)

**Output:** Liste der auffälligen Items pro Metrik mit Empfehlungen.

**Abgrenzung:** Neue Implementierung in `packages/mcp-server/src/handlers/devsteps_health.ts` ergänzen — NICHT eigenständiges Tool.