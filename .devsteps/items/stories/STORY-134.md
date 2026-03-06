## Ziel

Zod-Schemas für das Plan- und Trail-System in `packages/shared/src/schemas/`.

### Schemas

1. **PlanType** — Enum mit 15 Plan-Typen (implementation, test, migration, deployment, rollback, code-review, security-audit, perf-benchmark, a11y-audit, prerequisite, refactoring, debug, spike, integration, dep-upgrade)
2. **PlanStepStatus** — Enum (pending, active, completed, failed, blocked, skipped, inserted)
3. **PlanStep** — Einzelner Schritt mit step_number (Gap-Nummerierung), title, description, status, affected_paths, acceptance_criteria, depends_on, estimated_minutes, origin (original/inserted), inserted_because
4. **Plan** — Gesamtplan mit plan_id, type, title, parent_item_id, steps[], status, next_top_step, schema_version
5. **TrailEventType** — Enum (step_started, step_completed, step_failed, step_blocked, step_skipped, step_retried, step_inserted, prerequisite_discovered, plan_renumbered, substep_started, substep_completed, substep_failed)
6. **TrailEvent** — Einzelnes Event mit event_id, event_type, step_number, timestamp, error?, blocked_reason?, inserted_step?, attempt?, outcome?, agent?, duration_ms?
7. **Trail** — Event-Log mit trail_id, plan_id, parent_item_id, events[], schema_version
8. **StepNumber** — Utility-Schema mit number, original_number, aliases[], sort_key

### Acceptance Criteria

- [ ] Alle Schemas validieren korrekt gegen Test-Daten
- [ ] Sort-Key Berechnung: `10.2.1 → 10.002001` für korrekte Sortierung
- [ ] Schema-Version `1.0` als Default
- [ ] Export über `packages/shared/src/index.ts`