## Vision

Spider Web v1 (EPIC-028) established the Flat 2-Tier Architecture: coord dispatches ALL agents directly, no nesting. VS Code 1.113 (March 25, 2026) introduced `chat.subagents.allowInvocationsFromSubagents` + `chat.subagents.maxDepth`, making controlled nesting stable.

Spider Web v2.0 introduces **Selective Nesting**: NOT a rewrite of the entire architecture, but targeted nesting at two specific layers where flat dispatch creates cognitive overload.

## Evidence for Nesting (Research Summary)

| Source | Finding |
|--------|---------|
| AdaptOrch (arXiv 2602.16873v1, Feb 2026) | Hierarchical topology +12–23% over flat (SWE-Bench) |
| c-CRAB (arXiv 2603.23448v1, Mar 2026) | Code review agents cover only ~40% of issues. DIFFERENT agents cover COMPLEMENTARY gaps |
| Microsoft Azure AI Agent Patterns (Feb 2026) | Hierarchical recommended for 20+ agents: "no single agent needs full context" |
| GuruSup Orchestration (Mar 2026) | Hierarchical critical advantage = context window management |
| VS Code 1.113 (Mar 2026) | `allowInvocationsFromSubagents` + `maxDepth` — stable API |
| Cognition/Devin Anti-Pattern (Jun 2025) | Warning: parallelize only WITH shared context; avoid implicit conflicting decisions |

## Architecture Changes

### Ring 4: Exec-Conductors (Mini-Coordinators)
exec-impl, exec-test, exec-doc become **Mini-Coordinators** — they dispatch their own `worker-*` agents (worker-coder, worker-tester, worker-documenter). coord no longer dispatches workers directly.

```
coord (Ring 0)
└── exec-impl (Ring 4, Conductor)
    ├── worker-coder (Ring 4.1) — one per implementation step
    └── worker-coder (Ring 4.1) — parallel per non-conflicting files
```

### Ring 5: gate-reviewer Sub-Reviewer (Domain Specialists)
gate-reviewer becomes a Mini-Coordinator for Phase 2. After Phase 1 (Build/Test/Lint PASS), dispatches domain-specific sub-reviewers in parallel:

```
gate-reviewer (Ring 5, thin coordinator)
├── Phase 1: Automated Gates (direct — no dispatch)
├── Phase 2 Fan-Out (FULL/STANDARD only, after Phase 1 PASS):
│   ├── reviewer-domain-security  (OWASP, injection, auth)
│   ├── reviewer-domain-quality   (patterns, coverage gaps)
│   └── reviewer-domain-docs      (stale docs, TODOs, drift)
└── Phase 3: Verdict Synthesis — gate-reviewer decides PASS/FAIL
```

## Anti-Recursion Guard

```
maxDepth = 3 (hard limit via VS Code setting)
reviewer-domain-* and worker-* = Leaf Nodes (no 'agent' in tools)
Sub-Reviewer produce Evidence-Reports ONLY (write_analysis_report)
gate-reviewer retains exclusive Verdict authority (write_mandate_result)
```

## Invariants Delta (AGENT-DISPATCH-PROTOCOL v4 → v5)

| Invariant | v4 | v5 |
|-----------|----|----|
| I-2 | Non-coord agents NEVER call runSubagent | Exception: exec-conductors + gate-reviewer (bounded) |
| I-3 | Workers/aspects NEVER call runSubagent | New layer: reviewer-domain-* explicitly Leaf Nodes |
| NEW I-1 | — | gate-reviewer Sub-Reviewer are ALWAYS Leaf Nodes |
| NEW I-2 | — | Sub-Reviewer dispatch ONLY after Phase 1 PASS |
| NEW I-3 | — | Sub-Reviewer produce Evidence, gate-reviewer holds Verdict |

## Success Criteria

- [ ] AGENT-DISPATCH-PROTOCOL v5.0 published with Selective Nesting invariants
- [ ] exec-impl, exec-test, exec-doc dispatch workers (not coord)
- [ ] gate-reviewer dispatches reviewer-domain-* for FULL triage
- [ ] 3 new reviewer-domain-* agents as Leaf Nodes
- [ ] VS Code 1.113 maxDepth=3 configured + tested
- [ ] LessonsLearned from SPIKE-030 + SPIKE-015 documented