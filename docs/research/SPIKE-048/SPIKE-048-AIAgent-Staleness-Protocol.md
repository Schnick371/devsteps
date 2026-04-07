# AI-Agent Staleness-Detection via description_hash — Protokoll

<!-- bom-node: ARCH-SPIKE048-STALE | parent: ARCH-SPIKE048 | doc_subtype: reference | status: draft -->
<!-- devsteps_items: SPIKE-048, STORY-240, TASK-416, TASK-417 | created_at: 2026-04-04 | classification: ai/agents/aspect -->

**Item:** TASK-416 + TASK-417 (ausgehend von SPIKE-048)  
**Typ:** Referenz-Dokument (L2 unter Research Brief) — Protokoll für Agenten  
**Datum:** 2026-04-04  
**Status:** draft — abhängig von STORY-240 (description_hash Implementation)

> **Hinweis:** Dieses Protokoll ist nach STORY-240 (3 JSON-Felder) AKTIV. Bis dahin: Fallback auf Git-MCP (TASK-415 / Option B).

---

## Das Problem: Planning Drift

Ein vollständiger Spider-Web-Zyklus kann mehrere Sessions umfassen. Zwischen dem Zeitpunkt wo `exec-planner` seine Planung erstellt (T0) und dem Zeitpunkt wo `exec-impl` die Implementation abschließt (T2), könnte ein Mensch die Anforderungsbeschreibung geändert haben (T1):

```
T0: coord dispatcht exec-planner → Plan für STORY-XYZ Version A wird erstellt
T1: Mensch ändert STORY-XYZ.md (neue Anforderung: Version B)
T2: exec-impl implementiert basierend auf Plan (Version A) — aber Requirements sind jetzt B
T3: aspect-staleness-Prüfung in Ring 2 schaut auf AKTUELLE Beschreibung (Version B, korrekt)
     aber kann NICHT erkennen ob die Differenz zwischen Plan und Requirements neu ist!
```

**Resultat:** exec-impl liefert eine Implementierung die auf veralteten Requirements basiert. aspect-staleness findet möglicherweise keinen Drift (weil die Codebase zum Plan passt, nicht zu B).

---

## Lösung: description_hash als Invarianten-Anker

Nach STORY-240 enthält jedes `{ID}.json`:

```json
{
  "id": "STORY-042",
  "updated": "2026-04-04T10:00:00Z",
  "description_hash": "a4f8b2c1d3e5f7a9",
  "description_updated": "2026-03-28T14:30:00Z",
  "description_edit_count": 2
}
```

### Protokoll für coord-Agenten

**Beim Dispatch von exec-planner (Ring 3):**

Der coord SOLL den aktuellen `description_hash` aus dem Item-Metadata in den Dispatch-Prompt einbetten:

```markdown
## Dispatch Prompt Format (DPF) — Ring 3 / exec-planner

...
**snapshot_hash:** a4f8b2c1d3e5f7a9   ← REQUIRED ab STORY-240
**snapshot_taken_at:** 2026-04-04T12:00:00Z
```

**Beim Dispatch von Ring 2 Aspects (nach Ring 1):**

aspect-staleness erhält ebenfalls den `snapshot_hash` als `upstream_snapshot_hash`:

```markdown
## Dispatch Prompt Format (DPF) — Ring 2 / aspect-staleness

...
**upstream_snapshot_hash:** a4f8b2c1d3e5f7a9
**upstream_snapshot_taken_at:** 2026-04-04T12:00:00Z
```

---

## Protokoll für aspect-staleness-Agent

### Schritt 0: Requirements-Drift-Prüfung (NEU mit description_hash)

Bevor die normale Staleness-Analyse beginnt:

```
1. Lese aktuellen description_hash aus metadata via mcp_devsteps_get
2. Vergleiche mit upstream_snapshot_hash aus dem DPF
3. Wenn GLEICH: Requirements stabil seit Planung → normale Analyse fortsetzen
4. Wenn VERSCHIEDEN:
   a. Berechne wie lange her: metadata.description_updated vs. snapshot_taken_at
   b. Wenn description_updated > snapshot_taken_at: PLANNING DRIFT bestätigt
   c. Signalisiere: "Requirements changed DURING current sprint cycle"
   d. Empfehle: Re-Dispatch exec-planner mit aktuellen Requirements
```

### Schritt 1: description_edit_count Signal

```
Wenn description_edit_count > 3:
  → Item wurde mehrfach überarbeitet
  → Möglicherweise umstrittene oder unklar formulierte Anforderung
  → Empfehle: Klärung mit Stakeholder vor Implementation (FULL triage)
```

---

## Integration in devsteps-agent-protocol.instructions.md

**Ergänzung zum Triage-Abschnitt (nach STORY-240):**

> `description_edit_count > 3` → Automatic FULL triage recommended. Item was contested/revised multiple times — treat as ambiguous specification requiring broader analysis.

**Ergänzung zum DPF-Abschnitt:**

> When dispatching Ring 3 (exec-planner), coord SHOULD embed `snapshot_hash: metadata.description_hash` from current item state. Enables Planning Drift detection by aspect-staleness (Ring 2 on re-dispatch after Ring 1 anomaly).

---

## Verwendung ohne description_hash (Fallback vor STORY-240)

Wenn `description_hash` noch nicht im Item-Metadata vorhanden ist (ältere Items), kann aspect-staleness alternativ nutzen:

1. **Git-MCP (Option B):** `git_log --since=<sprint_start> -- .devsteps/items/{type}/{ID}.md` — Hat sich die MD-Datei seit Sprint-Start verändert?
2. **`metadata.updated` vs. Dispatch-Zeit:** Grober Indikator — überschätzt Drift (setzt auch bei Status-Änderungen)
3. **Keine Drift-Detection möglich:** Explizit vermerken in Staleness-Report

---

## description_edit_count als Kontroverenz-Signal

| edit_count | Bedeutung | Empfohlene Aktion |
|-----------|-----------|------------------|
| 0–1 | Normal — erstes Draft + ggf. eine Überarbeitung | Standard-Triage |
| 2–3 | Leicht erhöht — Anforderung war in Diskussion | Aufmerksam lesen |
| 4–5 | Erhöht — mehrfach überarbeitet | FULL Triage empfehlen |
| 6+ | Stark erhöht — umstrittene Anforderung | Stakeholder-Klärung vorschlagen; CSPG-Runde |

---

*Klassifikation: `ai/agents/aspect` · Scope: `module` · Cluster: `revision-md-001`*  
*Implements: TASK-416, TASK-417 · Depends-on: STORY-240 · Relates-to: SPIKE-048*
