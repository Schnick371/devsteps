# EPIC-037: Pattern Library — Collective Learning, Playbooks & Observations

## Context

From T2-C (Competitive Intelligence) research, three features are the primary differentiators between DevSteps Guide and its competitors:

1. **Pattern Trust Library** (from APEX AI Memory): Implementation patterns with dynamic trust scores that update based on success/failure outcomes — the system gets smarter over sessions
2. **Contextual Playbook Surfacing** (from LinkedIn CAPT): Team-authored step-by-step guides auto-surfaced when an agent starts a relevant task — produced LinkedIn's 70% triage reduction
3. **Observation Auto-Capture** (from GitHub Copilot Persistent Memory): Lightweight, low-friction knowledge accumulation — the agent calls `guide_observe` with 1-2 sentences after a task, which accumulates into the knowledge base

## Why This Matters

The T2-C analysis identifies DevSteps Guide's unique market position as "methodology-aware AI guidance." But without learning, every session starts from zero. This epic adds the feedback loop that makes DevSteps Guide improve with use.

## Scope

### Included
- `guide_pattern_record`: save an implementation approach (tags, outcome, summary) after task close
- `guide_pattern_suggest`: retrieve top patterns by similarity × trust score when starting work (Laplace-smoothed trust formula: successes / (successes + failures + 0.5), 90-day decay × 0.95)
- `guide_observe`: 1-sentence observation capture with `kind: fact | gotcha | decision`, auto-accumulated in `.devsteps/observations/`
- `guide_observations_list`: filter + retrieve recent observations, injected into `devsteps_context` automatically
- Playbook Storage: `.devsteps/playbooks/*.md` with YAML frontmatter (title, tags, applies_to, category)
- `guide_playbook_find`: search playbooks by query string / tags; top match excerpt auto-injected in `devsteps_context` response

### Excluded
- Semantic/vector search for patterns (keyword + tag matching sufficient for v1)
- Cross-project pattern sharing (filesystem scope only)

## Research Evidence

- APEX AI Memory: "library of proven implementation patterns with dynamic trust scores" — top feature of 13-tool suite
- LinkedIn CAPT: 20% adoption increase + 70% triage reduction from playbook surfacing
- GitHub Copilot Persistent Memory (Jan 2026): "automatic repository-level knowledge extraction" — validates observation capture pattern

## Success Criteria

- After 10 tasks with the same tag, `guide_pattern_suggest` returns at least 1 pattern with trust score > 0.7
- A new playbook in `.devsteps/playbooks/` is surfaced in `devsteps_context` within the same session it was added
- `guide_observe` can be called in under 2 seconds with a one-sentence string; observation appears in next `guide_observations_list` call