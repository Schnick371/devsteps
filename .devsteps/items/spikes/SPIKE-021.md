## Forschungsziel

Untersuche das genaue Format und die Mechanismen der Kommunikation zwischen GitHub Copilot `#runSubagent`-Agenten und dem Koordinator.

## Beobachtung (Auslöser)

Statt JSON-Kommunikation werden Dateien im VS Code workspaceStorage angelegt, z.B.:
`~/.vscode-server/data/User/workspaceStorage/*/GitHub.copilot-chat/chat-session-resources/*/content.txt`

## Forschungsfragen

1. Wird das Format der Kommunikation in Copilot agent files spezifiziert?
2. Was ist das ideale Format (JSON, Markdown, Binär/Bild)?
3. Ist die Kommunikationsform in der Copilot-Dokumentation beschrieben?
4. Wie können wir die Kommunikation optimieren?
5. Können sub-agent-Outputs direkt an weitere Sub-Agenten weitergegeben werden?
6. Welche weiteren Aspekte lohnen sich zu eruieren?

## Umfang

COMPETITIVE+ Tier — Full Spider Web dispatch## Research-Ergebnis (2026-03-05)

**Gate: PASS ✅ | Konfidenz: 0.91 | 17 Quellen | 9 MandateResults**

### Kernergebnisse

1. **workspaceStorage content.txt** = VS Code-internes Session-Artefakt. Kein IPC-Kanal. Coord liest NIE diese Dateien.
2. **Echter IPC-Kanal** = `.devsteps/cbp/<sprint>/*.result.json` via `write_mandate_result` MCP-Tool. Atomar, Zod-validiert, bidirektional.
3. **Phantom-Felder** (`report_path`, `upstream_paths`, `verdict`) existieren in 4 Protokoll-Docs aber NICHT im live schema_version 1.0 JSON.
4. **Direkter Sub-Agent-Pass** (A→B ohne Parent) ist durch CIS-Architektur von VS Code physisch unmöglich.
5. **Qualitäts-Score**: 5.4/10 — Kernprotokoll stark, Error-Handling/Testbarkeit/Observability kritisch unterversorgt.

### Follow-up Items
- TASK-324: TIER2-PROTOCOL.md deprecieren (**SOFORT erledigt** ✅)
- TASK-325: Phantom-Felder aus 4 Docs entfernen
- TASK-326: Zod Schema-Erweiterungen
- TASK-327: Quorum-Check Protocol
- STORY-191: Contract-Tests Dispatch-Zyklus
- STORY-192: Extension CBP-Layer

### Research Brief
`docs/research/SPIKE-021-runsubagent-communication.md`