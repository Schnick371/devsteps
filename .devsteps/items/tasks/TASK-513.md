Die Agent-Instructions (`.github/instructions/`, `.github/copilot-instructions.md`, ggf. Agenten-System-Prompts) referenzieren DOC-Items und die doc-Workflow-Pipeline noch nicht.

**Zu ergänzen:**
1. `copilot-instructions.md`: ItemType-Tabelle um `doc` mit korrekter Semantik ergänzen (cross-cutting, parallel zur Hierarchie)
2. Wenn SPIKE für `research` ItemType abgeschlossen: `research` ebenfalls ergänzen
3. Hinweis: `description`-Feld bei DOC-Items = Hauptinhalt (nicht Kurzbeschreibung)
4. Docs-Pipeline Tools (`devsteps_docs_new`, `devsteps_docs_map_read`, `devsteps_docs_assemble`) in Tool-Referenz aufführen

**Scope:** Nur Instructions-Dateien, keine Implementierungsänderungen.