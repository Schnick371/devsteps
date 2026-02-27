# Story: Log-Protokoll Spezifikation

## Warum zuerst

Prerequisite für alle anderen Stories. Definiert Format, Regeln und Anti-Patterns einmalig — alle Agents und Prompts referenzieren diese Spec. DRY: Eine Quelle, viele Konsumenten.

## Akzeptanzkriterien

1. `devsteps-log-protocol.instructions.md` existiert in `.github/instructions/` mit korrektem YAML-Frontmatter (`applyTo: .devsteps/logs/**`)
2. Spec definiert **PROJECT-LOG.md Format** (Pflichtfelder pro Session-Eintrag, Markdown-Struktur, Beispiel-Eintrag)
3. Spec definiert **Epic-Log Format** pro Epic (Pflichtfelder, Struktur, Beispiel)
4. Spec enthält Anti-Patterns (was NICHT ins Log gehört: raw Envelope-Content, Item-Status-Duplikate, Bullet-Dumps ohne Kontext)
5. Spec definiert **Persistenz-Regeln**: append-only, kein Löschen, Schreibreihenfolge
6. `.devsteps/logs/.gitkeep` existiert (Verzeichnis ist versioniert)
7. Spec spezifiziert den Session-Start-Read-Protokoll (T1 liest letzte N Einträge, nicht alles)