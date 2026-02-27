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

---

## Architektur-Update (Option C+)

Nach T2-Analyse: Die Spec muss auch die **MCP-Tool-Schnittstelle** beschreiben — nicht nur das Instructions-File. Die Instructions-Datei (`devsteps-log-protocol.instructions.md`) verändert ihre Rolle: Sie erzwingt nicht mehr das Format (das übernehmen Zod-Schemas in STORY-133), sondern definiert **Content-Quality-Guidance**:
- Anti-Patterns für schlechte Eintragsqualität
- Was in `decisions[]` vs. `open_threads[]` vs. `observations` gehört
- Ton: Entscheidungs-fokussiert, narrativ / nicht Status-Reporting
- Sprachregeln (konsistent Deutsch oder Englisch)

Die STORY-133 (MCP-Implementation) blockiert STORY-130 — erst wenn `write_log_entry` existiert, können T1-Agents es nutzen.