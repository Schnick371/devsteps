# guide_observe + guide_playbook_find — Lightweight Knowledge Accumulation & Playbooks

## Context
EPIC-037: Pattern Library. Two features that directly map to competitive gaps identified in T2-C:

1. **Observation Auto-Capture** (from GitHub Copilot Persistent Memory Jan 2026): zero-friction knowledge accumulation — agent calls `guide_observe` with 1-2 sentences after a task; accumulates into KB automatically
2. **Playbook Surfacing** (from LinkedIn CAPT): team-authored step-by-step guides auto-surfaced when agent starts relevant task → 70% triage reduction, 20% adoption increase

## Design A: Observations

Storage: `.devsteps/observations/YYYY-MM-DD-[ID].json`
```typescript
ObservationSchema {
  id:             string     // OBS-001
  text:           string     // max 500 chars, 1-2 sentences
  kind:           "fact"|"gotcha"|"decision"
  source_item_id?: string
  author:         "agent"|"human"
  timestamp:      datetime
  tags:           string[]
}
```

**`guide_observe`**: `Input { text, kind?, source_item_id?, tags? }` → `Output { observation_id, stored: true }`

**`guide_observations_list`**: `Input { kind?, since_date?, text_search?, limit? }` → chronological list

**Context injection:** `devsteps_context(level: quick)` auto-includes last 10 observations + any matching current in-progress item's tags.

## Design B: Playbooks

Storage: `.devsteps/playbooks/[slug].md` with YAML frontmatter:
```yaml
---
title: "Add new MCP tool"
tags: [mcp, tools, extension]
applies_to: task
category: implementation
---
```

**`guide_playbook_find`**:
```typescript
Input { query: string, tags?: string[], limit?: number }
Output {
  playbooks: Array<{
    slug, title, tags, excerpt (first 500 chars)
    relevance: number   // keyword match score
  }>
}
```

**Context injection:** `devsteps_context` auto-includes top relevant playbook excerpt (up to 500 chars) when in-progress item's tags match playbook's `tags`.

## Acceptance Criteria

- [ ] `guide_observe` stores observation atomically in < 50ms
- [ ] Observations appear in next `guide_observations_list` call (no cache invalidation needed)
- [ ] `devsteps_context(quick)` includes last 10 observations in `dynamic_context`
- [ ] `guide_playbook_find` searches title + tags + first 200 chars of playbook body
- [ ] Playbook markdown added to `.devsteps/playbooks/` is discoverable within same session without restart
- [ ] Context injection: playbook excerpt < 500 chars injected in `devsteps_context` when tag overlap ≥ 1
- [ ] Unit tests: observation CRUD, playbook search ranking, context injection trigger