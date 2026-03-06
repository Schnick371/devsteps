# Epic: Projekt-Logbuch & Epic-Logbuch System

## Vision

Verallgemeinert das bewährte Muster aus `Install-Guide-Dev.md` auf das gesamte Projekt. Gibt T1-Agenten eine persistierte, narrative Außenerinnerung — unabhängig vom instabilen Kontext-Window.

## Problem (konkret)

- Neue Sessions wissen nicht, wo die letzte aufgehört hat → Wiederholung derselben Fehler
- Bug-Fix-Loop: Fix Bug A → verursacht Bug B → Fix Bug B → verursacht Bug A → ...
- Architekturentscheidungen und verworfene Alternativen sind nirgends festgehalten
- DevSteps-Items zeigen Status, aber kein Narrativ — "Warum EPIC-027 in Richtung DC-Upgrade?" bleibt unbeantwortet

## Ziel nach Implementierung

1. Nach jeder Sprint-Session: `PROJECT-LOG.md` automatisch erweitert
2. Nach Abschluss jedes Epic-Items: Epic-Log erweitert
3. Beim Session-Start: T1 liest Projekt-Log → weiß sofort Zustand, Stoppstelle, nächster Schritt
4. Alle Entry-Points abgedeckt: T1-Coordinator, T1-Sprint-Executor, T2-Impl, T2-Reviewer, Prompts 20/25/30

## Implementierungsansatz

Option B — Agent-File-Protokoll (reines Markdown, keine neuen MCP-Tools).
SSOT: Eine Log-Protocol-Instructions-Datei definiert Format + Anti-Patterns.
Alle betroffenen Agent-Files + Prompts referenzieren diese Spec.

## Struktur

```
DevSteps Items    → strukturiert, maschinenlesbar, status-orientiert
Logbuch          → narrativ, menschenlesbar, kontext-orientiert, session-orientiert
```

Keine Redundanz — Items halten Status, Log hält das Warum.