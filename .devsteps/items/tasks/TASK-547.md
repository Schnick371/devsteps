## Aufgabe

Nach Implementierung der Frontmatter-Story (STORY-278) und Ingestion Mode (STORY-268) müssen die internen Dokumentationen des MCP und die CLI-Hilfstexte aktualisiert werden:

### MCP Tool Descriptions (MCP Protokoll)

1. `addTool` description: doc/test Types explizit erwähnen als cross-cutting
2. `docsNewTool` description: Ingestion Mode + content_markdown Parameter dokumentieren
3. `docReadContentTool` description: Frontmatter-Daten in Response erwähnen
4. `linkTool` description: documents/documented-by Verwendung für doc Items klarer beschreiben

### CLI Help Texts

1. `devsteps add` help: doc/test als cross-cutting Types erklären
2. `devsteps docs import` help: Frontmatter-Support erwähnen

### copilot-instructions.md

1. `doc` Type Beschreibung: \"H1=Diataxis\" → \"Content Fragment, authored at H1, assembler adjusts\"
2. `test` Type Beschreibung: \"Supported via generic CRUD. No specialized tools yet.\"

## Abhängigkeiten

Diese Task MUSS nach STORY-268 und STORY-278 implementiert werden (erst implementieren, dann dokumentieren).

## Acceptance Criteria

- [ ] Alle MCP Tool descriptions korrekt und vollständig
- [ ] CLI help texts aktualisiert
- [ ] copilot-instructions.md doc/test Beschreibungen aktualisiert## Partial Resolution

Updated copilot-instructions.md (doc: frontmatter support note, test: generic CRUD + link clarification), addTool description (cross-cutting types), docReadContentTool description (frontmatter in response). Remaining: STORY-268 (Ingestion Mode) must be done before docsNewTool and CLI help updates.