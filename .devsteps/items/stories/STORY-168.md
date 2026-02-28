# guide_work_context — 14-Block Comprehensive AI Context Package

## Context
EPIC-038: Context Engineering. Research finding: "44% of developers cite lack of context as primary issue with AI tools" (2 independent sources: Aimonks Feb 2026, Upsun Jul 2025). "26% more completed tasks when AI has comprehensive context" (controlled study). This is the single most impactful Guide tool. Designed by T2-F subagent.

## 8 Output Blocks (14 top-level fields)

```
guide_work_context(item_id) →
  1. item             — full metadata, status, tags, acceptance_criteria
  2. hierarchy        — parent, siblings (max 5), children, related items
  3. execution_state  — active plan step, loop_signal, blocking items, open questions
  4. relevant_knowledge — max 8 entries, scored by relevance algorithm
  5. file_context     — per affected_path: exists, line_count, language, warnings
  6. trail            — last 10 trail events + max 3 similar past episodes
  7. agent_guidance   — recommended_next_action, mandatory_checks, anti_patterns, runbooks
  8. context_meta     — fingerprint, generated_at, stale_hint, token_estimate
```

## Relevance Scoring (no embeddings required)

```
score = path_score × 0.40 + tag_score × 0.25 + type_score × 0.15
      + recency_score × 0.10 + heat_score × 0.10
```

| Factor | Computation |
|--------|-------------|
| `path_score` | longest common prefix segments / max segment count |
| `tag_score` | Jaccard(item.tags, knowledge.tags) |
| `type_score` | exact=1.0, parent=0.6, sibling=0.4, none=0.0 |
| `recency_score` | linear decay to 0 over 180 days |
| `heat_score` | min(1.0, reference_count / 20) |

## context_fingerprint

`sha256(item.updated + children_count + blocking_count + loop_iteration + open_questions_count + knowledge_dir_mtime).slice(0,16)`

TTL: 30 minutes regardless of content equality. `stale_hint: true` when fingerprint is older than item's last `updated` timestamp.

## Performance Target

< 300ms (local file reads only; no AST parsing — that's `guide_code_health`; no network).

## Acceptance Criteria

- [ ] All 8 blocks present in every response (empty arrays, not omitted keys)
- [ ] `relevant_knowledge` returns max 8 entries sorted descending by score
- [ ] `context_fingerprint` changes when any of the 6 input factors change
- [ ] `stale_hint: true` when `generated_at > 30 min` vs item's `updated` timestamp
- [ ] `token_estimate` within ± 20% of actual serialized token count
- [ ] Response time < 300ms for items with ≤ 10 affected_paths
- [ ] Unit tests: scoring algorithm (6 cases), fingerprint change detection, stale hint