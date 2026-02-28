## Ziel

4 MCP-Tools für Plan-Verwaltung (Create, Read, Update, Reorder).

### Tools

1. **create_plan** — Erstellt neuen Plan für ein DevSteps-Item. Steps werden auto-nummeriert (10, 20, 30...). Input: item_id, plan_type, title, steps[{title, description, acceptance_criteria, affected_paths, depends_on}]
2. **get_plan** — Abrufen eines Plans mit aktuellem Status. Optional: include_trail für Trail-Events. Input: item_id, plan_type, include_trail
3. **update_plan_step** — Aktualisiert Titel/Beschreibung/Criteria eines PENDING Steps. Input: item_id, plan_type, step_number, title?, description?, acceptance_criteria?
4. **reorder_plan_steps** — Ordnet PENDING Steps neu (nur nicht-abgeschlossene). Input: item_id, plan_type, new_order[]

### Storage

- `.devsteps/plans/[item_id]/[plan_type].plan.json`

### Acceptance Criteria

- [ ] create_plan auto-nummeriert Steps mit Gap 10
- [ ] get_plan gibt Plan mit projiziertem Status zurück
- [ ] update_plan_step nur für pending Steps erlaubt
- [ ] reorder_plan_steps bewegt keine completed Steps
- [ ] Storage-Dateien werden atomar geschrieben (.tmp → rename)