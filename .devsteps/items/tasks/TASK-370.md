## Target File

`.github/agents/AGENT-DISPATCH-PROTOCOL.md` (aktuell v4.0, 2026-03-02)

## Required Changes

### §1 — Architectural Invariants

**I-2 (Erweitern):**
```
Alt:  Non-coord agents NEVER call runSubagent — all are Leaf Nodes
Neu:  Non-coord agents NEVER call runSubagent — with TWO exceptions:
       (a) exec-impl, exec-test, exec-doc MAY dispatch worker-* (Ring 4.1)
       (b) gate-reviewer MAY dispatch reviewer-domain-* (Ring 5.1) after Phase 1 PASS
       All other agents remain strict Leaf Nodes.
```

**I-3 (Erweitern):**
```
Alt:  Workers/aspects NEVER call runSubagent
Neu:  worker-* and reviewer-domain-* agents are ALWAYS Leaf Nodes (no 'agent' in tools).
      This is enforced by Tool-Whitelist, not by logic.
```

**NEW I-1 (gate-reviewer nesting guard):**
```
reviewer-domain-* NEVER dispatch further agents.
Enforced: Tools = ['vscode','read','search','bright-data/*','devsteps/*'] — no 'agent'.
Sub-Reviewer produce Evidence-Reports only (write_analysis_report).
gate-reviewer holds exclusive Verdict authority (write_mandate_result).
```

**NEW I-2 (Phase-Gate):**
```
gate-reviewer Sub-Reviewer dispatch ONLY when Phase 1 AUTOMATED GATES are PASS.
Never dispatch Sub-Reviewers for failing build/test/lint — fix first.
```

**NEW I-3 (Conductor-Constraint):**
```
exec-conductors (exec-impl, exec-test, exec-doc) NEVER dispatch other exec-* agents.
They dispatch ONLY their own worker-* subset:
  exec-impl  → worker-coder, worker-refactor, worker-build-diagnostics
  exec-test  → worker-tester, worker-integtest, worker-build-diagnostics
  exec-doc   → worker-documenter, worker-doc
```

### §2 — Ring/Spoke Table Update

Aktualisieren: Ring 4 Beschreibung von "Workers dispatched by conductors NOT coord" korrekt documented (bereits teilweise vorhanden, präzisieren).

Hinzufügen Ring 5.1:
```
| 5.1 | Domain Review | reviewer-domain-security, reviewer-domain-quality, reviewer-domain-docs | Leaf Node |
```

### §5 — Communication Contracts Summary

Neue Zeilen einfügen:
```
gate → reviewer-domain-* prompt   runSubagent prompt param             —                   gate builds prompt
reviewer-domain-* → gate Evidence .devsteps/analysis/[itemId]/[agent].json  read_analysis_envelope  write_analysis_report
exec-conductor → worker-* prompt  runSubagent prompt param             —                   conductor builds prompt
```

### Header Update

Version: v5.0, Date: 2026-03-30, note "Selective Nesting — exec-conductors + gate-reviewer Sub-Reviewer"

## Acceptance Criteria

- [ ] I-2 und I-3 Ausnahmen klar dokumentiert mit "Bounded Nesting" Sprache
- [ ] NEW I-1, I-2, I-3 (Gate-Nesting) als Abschnitt nach I-14
- [ ] Ring 5.1 Sub-Ring im Architektur-Diagramm (ASCII) ergänzt
- [ ] §5 Communication Contracts vollständig (beide neuen Dispatch-Kanäle)
- [ ] VS Code 1.113 Requirement-Note ergänzt (maxDepth, allowInvocationsFromSubagents)