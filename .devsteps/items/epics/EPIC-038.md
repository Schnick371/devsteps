# EPIC-038: Context Engineering — guide_work_context & Cognitive Gates

## Context

From R4 Research (Feb 2026):
- **44% of developers cite "lack of context" as the primary issue** with AI tools (Aimonks Feb 2026, Upsun Jul 2025)
- "26% more completed tasks when using AI tools with comprehensive context"
- "44% of quality issues stem from missing context"

From T2-F + T2-G competitive analysis:
- Shrimp Task Manager's chain-of-thought gate is its primary quality differentiator — DevSteps lacks this
- No single MCP call gives Copilot everything it needs before implementation
- No enforcement gate prevents agents from starting work without understanding the context

## Problem

The current `devsteps_context` tool gives project-level overviews. An agent starting work on STORY-141 must make 5-8 separate calls to collect: the item itself, its hierarchy, relevant conventions/ADRs, active trail events, open questions, blocking items, and applicable runbooks. This massively increases token overhead and increases the probability of the agent missing critical context.

Additionally, there is no mechanism to verify the agent has UNDERSTOOD the context before touching files.

## Scope

### Included
- **`guide_work_context(item_id)`**: THE single comprehensive context call — item + hierarchy + execution state + relevant knowledge (scored by relevance) + file context + trail summary + similar episodes + agent guidance. Deterministic relevance scoring: path-score × 0.40 + tag-score × 0.25 + type-score × 0.15 + recency × 0.10 + heat × 0.10.
- **`context_fingerprint`**: SHA-256 of (item.updated + children_count + blocking_count + loop_iteration + open_questions_count + knowledge_dir_mtime) → 16-char hex. Detects staleness without re-fetching.
- **`guide_verify_understanding(item_id, summary, fingerprint)`**: Chain-of-thought gate with 8 validation checks (3 hard gates + 5 soft). Returns `verification_token` consumed by plan execution.
- **`guide_blast_radius(item_id)`**: Traverses `depends-on` / `blocked-by` graph up to depth 3; surfaces potential breakage before destructive refactors.
- **`guide_context_diff(fingerprint_before, fingerprint_after, item_id)`**: Human-readable change log between two context snapshots.
- **`guide_file_conventions_check(paths)`**: Scan `affected_paths` against `.devsteps/style-contract.json` rules for file naming, exports, test pairing, import patterns.

### Excluded
- Vector embedding retrieval (path + tag + recency scoring is sufficient for v1)
- Real-time file watcher (fingerprints are computed on-demand, not pushed)

## Research Evidence

- "When asked about missing features in AI tools, 44% cite 'lack of context'" — Aimonks 12 AI Coding Trends 2026
- Shrimp Task Manager's chain-of-thought requirement → T2-G: "DevSteps needs this to match Shrimp's cognitive discipline while surpassing it with structural depth"
- T2-F complete `guide_work_context` output schema: 14 blocks ordered for LLM token efficiency
- LangGraph's "super-step" checkpoint = this system's `context_fingerprint`

## Success Criteria

- One call to `guide_work_context(item_id)` returns all 14 context blocks in under 300ms (local file reads only)
- `guide_verify_understanding` correctly rejects a summary that doesn't reference any `affected_paths` value
- `guide_blast_radius` returns dependency chain depth ≤ 3 with `can_start: boolean` for the CBP T1 pre-execution check
- `context_fingerprint` changes whenever item is updated, child count changes, or new knowledge entry is added