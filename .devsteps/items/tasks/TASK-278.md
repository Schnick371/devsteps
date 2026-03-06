# Task: .devsteps/logs/ Verzeichnis bootstrappen

Erstelle `.devsteps/logs/.gitkeep` damit das Verzeichnis versioniert wird (Git trackt keine leeren Verzeichnisse).

Erstelle außerdem Template-Header-Files als Startzustand:
- `PROJECT-LOG.md` mit Titel-Header und leerem Eintragsbereich (kein Inhalt-Eintrag)
- Kein initialer Session-Eintrag — das erste Log-Entry kommt vom ersten echten Sprint

## Inhalt PROJECT-LOG.md (initiale Version)
```markdown
# DevSteps — Projekt-Logbuch

> Chronologisches, narratives Session-Protokoll. Neueste Einträge oben.
> Format: siehe `.github/instructions/devsteps-log-protocol.instructions.md`

---

<!-- Einträge werden hier von T1-Agenten eingefügt — append-only -->
```

---

## Storage-Format-Update (Option C+)

Statt einer Markdown-Template-Datei wird die Verzeichnisstruktur für **JSON-Storage** angelegt:

```
.devsteps/logs/
  project/        # Projekt-Level-Logs (PROJECT-LOG.*.json)
  epic/           # Per-Epic-Logs (EPIC-031/*.json)
  .gitkeep        # Verzeichnisse im Git halten
```

Zusätzlich eine `logs/README.md` die erklärt:
- Dateien werden durch MCP-Tool `write_log_entry` geschrieben — **niemals direkt editieren**
- Format: `YYYY-MM-DD-<6chars>.json` pro Eintrag
- Lesbar via `read_log` Tool oder `devsteps log show` CLI-Befehl

Kein Markdown-Template mehr — die Zod-Schema-Definition (TASK-286) ist das Template.