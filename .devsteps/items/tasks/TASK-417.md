# Task: aspect-staleness Protocol-Update

Aktualisiere devsteps-agent-protocol.instructions.md und .github/agents/devsteps-R2-aspect-staleness.agent.md:

## Zu ergänzen

1. Mandate müssen description_hash als snapshot_hash einbetten wenn verfügbar:
   - coord embed bei exec-planner Dispatch: current metadata.description_hash
   - Ring 2 aspect-staleness kann prüfen: embedded hash == current metadata.description_hash?
   - Mismatch = Planning Drift (Anforderung hat sich nach Mandate-Erstellung geändert)

2. agent-protocol: Footnote `description_edit_count > 3 → FULL triage empfohlen`

Depends-on: STORY-240 (3 JSON-Felder)