# Story: Session-Kontinuität — T1 PROJECT-LOG.md Integration

## Scope

Beide T1-Agenten (Coordinator für Single-Item, Sprint-Executor für Multi-Item) lesen das Projekt-Log beim Session-Start und schreiben nach Session-Ende. Das ist der Kern des Musters aus Install-Guide-Dev.md — verallgemeinert auf alle T1-Einstiegspunkte.

## T1 Sprint Executor — Änderungen

### Neuer Step 0: Read Project Log (vor Backlog Discovery)
- Lies letzte 3 Einträge in `PROJECT-LOG.md` (falls vorhanden)
- Extrahiere: letzte offene Threads, bekannte Bugs, verworfene Ansätze
- Plane darauf aufbauend — nicht "fresh start" sondern "continuation"

### Neuer Post-Sprint Step: Write Log Entry (nach letztem done-Item)
- Schreibe Session-Eintrag mit: Datum, Session-Typ, bearbeitete Items (ID + Titel)
- Was wirklich passiert ist: Bugs gefunden, Designentscheidungen, verworfene Ansätze
- Was offen geblieben ist und warum
- Cross-cutting Observations: Muster über mehrere Items hinweg

## T1 Coordinator — Änderungen

### Vor Single-Item MPD: Read Project Log
- Letzte 2 Einträge lesen — gibt Kontext für welche Fehler schon gemacht wurden

### Nach Quality Gate PASS: Write Log Entry
- Session-Typ: Single-Item
- Item-ID, Titel, Implementierungsentscheidungen, was anders war als erwartet

## Akzeptanzkriterien

1. T1-Sprint-Executor: "Step 0: Read Project Log" vor Backlog Discovery eingebaut
2. T1-Sprint-Executor: Post-Sprint-Write-Schritt nach letztem merge `--no-ff` eingebaut
3. T1-Coordinator: Log-Read vor MPD-Dispatch eingebaut
4. T1-Coordinator: Log-Write nach Quality Gate PASS eingebaut
5. Beide referenzieren `devsteps-log-protocol.instructions.md` für Format
6. Log-Write an Pause-Trigger gekoppelt: auch bei ESCALATED wird ein Pause-Eintrag geschrieben

---

## Implementierungs-Update (Option C+)

T1 nutzt **MCP-Tool-Calls** statt `read_file` / direktem File-Edit:

- **Session-Start:** `list_log_entries(scope: 'project', since: 'letzte Woche')` → dann `read_log(scope: 'project', depth: 'last-3')` für den Narrative-Kontext
- **Session-Ende:** `write_log_entry(scope: 'project', entry: {...})` mit `decisions[]` + `open_threads[]`

`devsteps_context(level: 'standard')` enthält automatisch `log_summary` (via TASK-290) — der zweistufige Call ist nur nötig wenn mehr Detail gebraucht wird.

**Blocked-by STORY-133:** T1 kann erst umgestellt werden wenn die MCP-Tools existieren.