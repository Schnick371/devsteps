Untersuchung und Implementierung eines Ring-Coordinator-Modells für den Spider Web Dispatch-Mechanismus.

**Hintergrund:** VS Code 1.109+ unterstützt Subagenten-Nesting bis Tiefe 5. Der bisherige Invariant "runSubagent does not support nesting" in copilot-instructions.md ist STALE. Conductors (exec-impl/test/doc) implementieren bereits depth-2 nesting (coord→conductor→worker).

**Ziel:** Ring-Coordinators (`devsteps-R{N}-ring-coord.agent.md`) zwischen R0-coord und Leaf-Agents einführen:
- Phase 1 (Story A): STORY-294 Triage-Korrekturen in R0-coord; 3 stale file fixes (pre-req commit)
- Phase 2 (Story B): Ring-Coordinator Agent-Dateien (R1–R5) + Protokoll-Extension im ADP §5
- Phase 3 (Story C): Schema-Extension `routing_verdict` + REGISTRY.md Update
- FALSE_ALARM-Mechanismus: ring-coord schreibt `write_mandate_result` mit `routing_verdict: "FALSE_ALARM"` wenn Ring irrelevant

**Forschungsgrundlage:** DEEP profile research abgeschlossen (Apr 2026). 12 externe Quellen. Generalist-Modell (nicht domain-spezifisch) empfohlen — OrgAgent empirische Evidenz.