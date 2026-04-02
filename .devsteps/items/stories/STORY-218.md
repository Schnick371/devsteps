## Context

gate-reviewer v1 führt Phase 2 (Inline Quality Analysis) vollständig selbst aus — ein Agent prüft Security, Patterns, Docs gleichzeitig. c-CRAB (Mar 2026) zeigt: ~40% Issue-Abdeckung bei Single-Agent-Code-Review. Unterschiedliche Spezialisten decken komplementäre Lücken ab.

## Design: gate-reviewer als schlanker Coordinator

```
gate-reviewer (Ring 5)
├── Phase 1: Automated Gates (Build/Test/Lint) — DIREKT, kein Dispatch
│   → FAIL sofort → ReviewFix loop (unverändert)
├── Phase 2: Sub-Reviewer Fan-Out (NUR nach Phase 1 PASS)
│   ├── reviewer-domain-security   (OWASP Top 10, injection, auth)
│   ├── reviewer-domain-quality    (pattern-consistency, coverage gaps)
│   └── reviewer-domain-docs       (stale docs, TODO-drift, comment-code divergence)
│   [alle drei parallel, FULL triage; STANDARD: 1-2 on-demand]
├── Phase 3: Verdict Synthesis — gate-reviewer entscheidet allein
└── Phase 4: PASS → write_mandate_result | FAIL → write_rejection_feedback
```

## Trigger-Bedingungen

| Triage | Sub-Reviewer-Dispatch |
|--------|----------------------|
| QUICK | NEIN — gate bleibt Leaf Node |
| STANDARD | Optional — nur bei Unsicherheit in einer Domain nach Phase 1 |
| FULL | Pflicht — security + quality + docs parallel |
| COMPETITIVE | NEIN — kein Docs/Security-Scope bei Approach-Evaluation |

## Semantik: Evidence vs. Verdict

| Sub-Reviewer darf | Sub-Reviewer darf NICHT |
|-------------------|------------------------|
| write_analysis_report (Evidence) | write_mandate_result |
| read, search, bright-data scrape | write_rejection_feedback |
| Confidence 0.0–1.0 setzen | Eigenständig PASS/FAIL entscheiden |
| Domain-spezifische Checks | Weitere Sub-Agents dispatchen |

**Verdict-Reserve:** gate-reviewer synthetisiert ALLE Evidence-Reports + entscheidet PASS/FAIL/ESCALATE.

## Anti-Rekursions-Guard (Invariante NEW I-1)

```
reviewer-domain-* Tools = ['vscode', 'read', 'search', 'bright-data/*', 'devsteps/*']
KEIN 'agent' in Tools → Leaf Nodes durch Tool-Whitelist enforced
maxDepth = 3 (VS Code setting) als Hard Guard
```

## Neue Agent Files

1. `.github/agents/devsteps-R5-reviewer-domain-security.agent.md`
   - OWASP Top 10 Checkliste, injection patterns, auth flows
   - bright-data scrape für OWASP current = IMMER

2. `.github/agents/devsteps-R5-reviewer-domain-quality.agent.md`
   - Pattern-Konsistenz vs. Codebase-Conventions
   - Coverage-Gap-Analyse (Absence Audit)
   - DRY-Verletzungen, God-Functions

3. `.github/agents/devsteps-R5-reviewer-domain-docs.agent.md`
   - Stale docs (Docs referenziert alte API)
   - TODO/FIXME-Drift (marker zu gelöstem Issue)
   - Comment-Code-Divergenz

## Agent Files zu ändern

- `.github/agents/devsteps-R5-gate-reviewer.agent.md` → Phase 2 → Sub-Reviewer Fan-Out
- `.github/instructions/devsteps-agent-protocol.instructions.md` → I-2 Exception für gate-reviewer
- `AGENT-DISPATCH-PROTOCOL.md` → §5 Communication Contracts + NEW I-1/I-2/I-3

## Acceptance Criteria

- [ ] 3 reviewer-domain-* agents als Leaf Nodes (keine 'agent' in tools)
- [ ] gate-reviewer dispatcht Sub-Reviewer nach Phase 1 PASS (FULL triage)
- [ ] Sub-Reviewer schreiben write_analysis_report, NICHT write_mandate_result
- [ ] gate-reviewer liest via read_analysis_envelope und synthetisiert
- [ ] PASS/FAIL/ESCALATE bleibt Privilege des gate-reviewers
- [ ] STANDARD triage: gate-reviewer dispatcht optional 1–2 domains bei Unsicherheit
- [ ] QUICK triage: gate-reviewer bleibt Leaf Node (kein Dispatch)