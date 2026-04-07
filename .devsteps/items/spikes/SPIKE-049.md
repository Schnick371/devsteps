# Spike: commits[] Feld in ItemMetadata — Bereinigen oder implementieren?

Das Feld `commits: ItemGitInfo[]` existiert im ItemMetadata-Schema seit langer Zeit und ist **immer leer** (nie programmatisch befüllt). Kein Code-Pfad schreibt in dieses Feld.

## Optionen

**A) Feld beibehalten + EPIC-026 (Bidirectional Git Sync) vorantreiben**
- Das Feld ist korrekt designed
- Implementierung wurde nur aufgeschoben (EPIC-026 ist `draft`)
- Keine Aktion nötig außer EPIC-026 zu priorisieren

**B) Feld deprecaten/entfernen**
- Schema-Bereinigung
- Breaking Change für externe Clients die das Feld erwarten
- EPIC-026 würde trotzdem kommen — dann würde das Feld wieder gebraucht

**C) Feld befüllen (Minimal-Implementation)**
- Bei Status `done` in update.ts: `git log --oneline --follow -- {ID}.md` nutzen
- `simple-git` ist bereits als Dependency vorhanden
- Nur bei `git_integration: true`

## Untersuchungsfragen

1. Gibt es externe Clients (z.B. VS Code Extension, eigene Skripte) die `commits: []` bereits parsen?
2. Ist EPIC-026 (Bidirectional Git Sync) realistisch bald umsetzbar?
3. Würde Minimal-Implementation (Option C) das EPIC-026-Scope verkleinern?

## Bezug zu SPIKE-048

Aus SPIKE-048 (MD-Revisionen Research) wurde festgestellt: `commits: []` ist immer leer. `simple-git` wird nur für UX-Hints genutzt (git.checkIsRepo()). Ein MCP-zugänglicher Git-History-Mechanismus wäre für AI-Agent-Staleness-Detection wertvoll.

Relates-to: SPIKE-048, EPIC-026