# guide_nl_to_item — Natural Language to Structured DevSteps Item

## Context
EPIC-010: Knowledge. T2-G: Shrimp Task Manager's "NL-to-task" reduces friction dramatically — from a conversation → structured task with one call. DevSteps requires knowing the exact `type`, `priority`, `affected_paths`, `tags` which is a barrier to quick capture.

## Tool Design

```typescript
GuideNlToItemInput {
  natural_language:    string      // user's description in any format/length
  context_item_id?:   string      // current working item — enriches tag inference
  infer_dependencies?: boolean     // search related existing items (default: false)
  dry_run?:           boolean      // DEFAULT: true (safety first)
}

GuideNlToItemOutput {
  proposed_item: {
    type:                 ItemType
    title:                string      // normalized, max 80 chars
    description:          string      // Markdown, includes original text + structure
    priority:             EisenhowerPriority
    affected_paths:       string[]    // matched against existing workspace file paths
    tags:                 string[]    // extracted from NL + context_item tags
    acceptance_criteria:  string[]    // bullet points extracted or inferred
    suggested_depends_on: string[]    // DevSteps IDs (when infer_dependencies: true)
  }
  confidence:        number      // 0.0–1.0
  inference_notes:   string[]    // explains each inferred field
  confirm_to_create: true        // always present → agent must call devsteps_add explicitly
}
```

**Type inference heuristics (keyword matching):**
| type | keywords |
|------|---------|
| `bug` | broken, error, crash, fails, regression, exception |
| `spike` | investigate, research, explore, prototype, POC, study |
| `story` | feature, implement, add, create, build, develop |
| `task` | (default fallback) |

**Priority inference:**
| priority | keywords |
|----------|---------|
| `urgent-important` | blocker, critical, ASAP, today, production, broken |
| `not-urgent-important` | improve, enhance, refactor, better, clean |
| `not-urgent-not-important` | nice-to-have, someday, maybe, wishlist |
| `urgent-not-important` | (default) |

**File path matching:** Substring-match NL tokens against workspace file index (built once per Guide session, refreshed on file change).

**NEVER auto-creates:** `dry_run: true` is the immutable default. Agent must call `devsteps_add` explicitly.

## Acceptance Criteria

- [ ] "The login button is broken on mobile" → `type: "bug"`, `priority: urgent-important`
- [ ] "Maybe someday add dark mode" → `type: "story"`, `priority: not-urgent-not-important`
- [ ] `confidence < 0.5` when < 3 heuristics match → sets `inference_notes: ["Low confidence — manual review recommended"]`
- [ ] `dry_run: true` (default) never calls `devsteps_add`
- [ ] `suggested_depends_on: []` when `infer_dependencies: false`
- [ ] Unit tests: type inference (5 patterns), priority inference (4 patterns), dry-run guard