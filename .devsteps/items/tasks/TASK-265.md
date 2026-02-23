## Goal

T1 Coordinator und T1 Sprint Executor explizit auf den "Session-Start: Check pending escalations" Schritt erweitern.

## Changes

### `devsteps-t1-coordinator.agent.md`

Nach dem Triage-Schritt, vor Phase A, neuer Abschnitt:

```markdown
## Step 0: Pending Escalation Check (MANDATORY — before every session)

1. `read_escalations(sprint_id, 'open')` — prüfe offene Escalations
2. Wenn `pending_count > 0`:
   ⚠️ DECISION REQUIRED
   Escalation von: [source_agent]
   Typ: [escalation_type]
   Entscheidung benötigt: [decision_needed]
   Geblockte Items: [blocking_items]
   
   → Warte auf User-Entscheidung
   → `resolve_escalation(...)` aufrufen wenn User entschieden hat
   → ERST DANN Phase A fortsetzen
3. Wenn `pending_count == 0` → direkt zu Triage
```

### `devsteps-t1-sprint-executor.agent.md`

"Pre-Sprint Analysis" → "Step 0" hinzufügen:

```markdown
### Step 0: Pending Escalations (MANDATORY)
read_escalations(sprint_id, 'open')
→ pending_count > 0 → Surface to user, HALT until resolved
→ pending_count == 0 → Continue to Step 1
```

## Acceptance Criteria
- [ ] Beide Agent-Files enthalten Step 0 Escalation Check an der richtigen Position
- [ ] Der Check kommt IMMER vor Phase A, IMMER nach Session-Start
- [ ] `sprint_id` Herkunft dokumentiert (aus User-Input oder aus letztem Sprint-Brief)
- [ ] Verhalten bei fehlendem `.devsteps/cbp/` Verzeichnis: kein leerer Fehler, graceful "no escalations" response