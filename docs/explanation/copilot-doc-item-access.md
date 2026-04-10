# Wie Copilot doc-Items nutzt — Discovery, Index und Traceability vs. direkter Datei-Zugriff

## Background

DevSteps `doc`-Items registrieren Dokumentationsdateien im Backlog. Sie sind kein Content-Delivery-System,
sondern ein **Index- und Traceability-Layer**: Copilot findet Dokumente, ohne Pfade zu kennen, und kann
Docs mit Stories/Tasks verknüpfen.

## How It Works

### Zugriffspfade für Copilot

| Zugriffspfad | Was Copilot bekommt | Einsatz |
|---|---|---|
| `#file:.github/prompts/devsteps-35-guide-cycle.prompt.md` | Vollständiger Dateiinhalt im Kontext | Kapitelgenaue Nutzung, Analyse |
| `mcp_devsteps_get DOC-001` | Metadata + `description` (Markdown) + `affected_paths` | Discovery, kuratierte Zusammenfassung |
| `mcp_devsteps_search "ring dispatch"` | Volltextsuche über ALLE doc-descriptions | Querrecherche ohne Pfadwissen |
| `mcp_devsteps_list type=doc` | Alle registrierten Dokumente | Inventar, welche Docs existieren |

### Das `description`-Feld ist der Schlüssel

Die `description` eines doc-Items kann **kuratierte Auszüge, Kapitelübersichten oder Schlüsselregeln**
enthalten. Damit ist `get DOC-001` inhaltlich nützlich — ohne dass Copilot die Datei lesen muss.
Wer ein doc-Item anlegt, entscheidet, welche Kapitel dort zusammengefasst sind.

### Wann welcher Pfad?

- **Spezifisches Kapitel brauchen**: `#file:` oder `read_file` — voller Inhalt, direkt
- **Welche Docs gibt es zum Thema X?**: `search "X"` — findet alle doc-descriptions mit X
- **Welche Stories hat Dokument Y beschrieben?**: `trace DOC-001` — zeigt verknüpfte Items
- **Neues Dokument mit Skeleton anlegen**: `devsteps_docs_new` — erstellt Datei + registriert Item

## Trade-offs

**doc-Items erhöhen Auffindbarkeit** — `search` und `list` funktionieren ohne Pfadwissen.

**doc-Items ersetzen NICHT** den direkten Datei-Zugriff für spezifische Kapitel. Copilot liest
die verlinkte Datei weiterhin via `read_file` oder `#file:`-Attachment für vollständigen Inhalt.

**Mehrwert liegt in Traceability**: Welche Stories sind durch welche Docs abgedeckt? Welche Docs
sind veraltet (kein verlinkter Story mehr `in-progress`)? Das beantwortet `trace`, nicht `get`.

## Further Reading

- [devsteps-35-guide-cycle.prompt.md](../../.github/prompts/devsteps-35-guide-cycle.prompt.md) — Beispiel-Prompt der als doc-Item registriert werden kann
- [devsteps-classification.instructions.md](../../.github/instructions/devsteps-classification.instructions.md) — Taxonomie für doc-Items (domain: `docs`)
