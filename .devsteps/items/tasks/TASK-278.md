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