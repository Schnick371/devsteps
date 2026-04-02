## Context

Spider Web v1: coord dispatcht worker-* direkt. Spider Web v2.0: exec-impl, exec-test, exec-doc werden **Conductors** — sie dispatchen ihre eigenen Workers. coord delegiert nur noch auf Conductor-Ebene.

## Motivation

- coord's context window explodiert bei großen Sprints = Tier-4 worker state floats back to Ring 0
- exec-conductors haben domänen-spezifischen Kontext (Impl-Plan) — sie wissen wann welcher Worker was tun soll
- AdaptOrch: +12–23% Improvement durch hierarchische Orchestration (SWE-Bench 2026)

## Scope

### exec-impl (Conductor)
- Liest exec-planner MandateResult (Implementation-Plan)
- Dispatcht **worker-coder** für jeden implementierten Step (parallel bei nicht-konfliktierenden Dateien)
- Dispatcht **worker-refactor** wenn Scope = refactoring
- Dispatcht **worker-build-diagnostics** bei Build-Fehler (RESOLVE phase)
- Schreibt MandateResult an coord (keine worker state details)

### exec-test (Conductor)
- Dispatcht **worker-tester** (unit) und **worker-integtest** (integration)
- Parallel wenn keine file-overlap
- Koordiniert TDD-Loop intern (max 3 Iterationen)

### exec-doc (Conductor)
- Dispatcht **worker-documenter** für Docs-Änderungen
- Dispatcht **worker-doc** für komplexere Dokumentations-Arbeit

## Invarianten-Änderungen

`AGENT-DISPATCH-PROTOCOL.md` §1 muss folgende Ausnahmen erhalten:
- I-2 Exception: "exec-impl, exec-test, exec-doc MAY dispatch worker-* via runSubagent"
- I-3 Exception: "worker-* dispatched by exec-conductors are Leaf Nodes"
- NEW I-4 (Conductor-Constraint): "exec-conductors NEVER dispatch other exec-* agents — only worker-*"

## Agent Files zu ändern

- `.github/agents/devsteps-R4-exec-impl.agent.md` → add worker dispatch instructions
- `.github/agents/devsteps-R4-exec-test.agent.md` → add worker dispatch instructions
- `.github/agents/devsteps-R4-exec-doc.agent.md` → add worker dispatch instructions
- `.github/agents/devsteps-R4-worker-coder.agent.md` → confirm Leaf Node contract
- `.github/agents/devsteps-R4-worker-tester.agent.md` → confirm Leaf Node contract
- `.github/agents/devsteps-R4-worker-documenter.agent.md` → confirm Leaf Node contract

## Acceptance Criteria

- [ ] exec-impl dispatcht worker-coder per Impl-Plan-Step via runSubagent
- [ ] coord dispatcht KEINE worker-* mehr direkt (nur exec-conductors tun das)
- [ ] Worker Leaf Node-Status in Tool-Deklaration erzwungen (kein 'agent' in tools)
- [ ] TDD-Loop bleibt intern bei exec-test (nicht sichtbar für coord)
- [ ] AGENT-DISPATCH-PROTOCOL v5.0 §1 enthält Conductor-Ausnahmen