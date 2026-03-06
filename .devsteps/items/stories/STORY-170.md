# guide_blast_radius + guide_context_diff + guide_file_conventions_check

## Context
EPIC-038: Context Engineering. Three supporting tools that integrate into `guide_work_context` output and are also callable standalone.

---

## Tool A: guide_blast_radius

Traverse `depends-on`/`blocked-by` graph to depth 3. Used by T1 coordinator pre-execution check.

```typescript
Input  { item_id: string; include_transitive?: boolean }  // default: true
Output {
  can_start: boolean
  health_status: "green" | "yellow" | "red"
  blockers: Array<{ id; title; status; resolution_hint }>
  dependency_graph: { nodes: string[]; edges: [string, string][] }
  recommendation: "PROCEED" | "WAIT" | "ESCALATE" | "REPLAN"
}
```

**Resolution hints:** `cancelled` → "dependency may be obsolete; verify if still needed"; `in-progress` → "check with assignee for ETA"

**Cycle detection:** DFS with visited set — cycle → `health_status: "red"`, `recommendation: "ESCALATE"`

---

## Tool B: guide_context_diff

Explain what changed between two context fingerprint snapshots:
```typescript
Input  { item_id; fingerprint_before; fingerprint_after }
Output {
  changed_factors:    Array<{ factor; before; after; impact: "minor"|"major" }>
  staleness_severity: "none" | "minor" | "major" | "critical"
  recommendation:     "PROCEED" | "REFRESH_AND_REPLAN" | "ESCALATE"
}
```

---

## Tool C: guide_file_conventions_check

Scan file paths against `.devsteps/style-contract.json`:
```json
{
  "rules": [
    { "id": "no-default-exports", "scope": "packages/shared/**", "severity": "error" },
    { "id": "test-colocation", "description": "Tests must be .test.ts adjacent to src", "severity": "warning" },
    { "id": "kebab-case-files", "severity": "error" }
  ]
}
```

```typescript
Input  { paths: string[] }
Output { violations: Violation[]; score: number (0–10); pass: boolean }
```

Default contract auto-generated from biome.json + existing monorepo conventions if file missing.

---

## Acceptance Criteria

- [ ] `guide_blast_radius`: `can_start: false` when any direct blocker is not `done`
- [ ] `guide_blast_radius`: DFS depth exactly 3; cycle detection prevents infinite loop
- [ ] `guide_context_diff`: `staleness_severity: "critical"` when `blocking_count` changes
- [ ] `guide_file_conventions_check`: creates default contract if `.devsteps/style-contract.json` missing
- [ ] All 3 tools integrate as sub-calls within `guide_work_context`
- [ ] Unit tests: blast radius traversal with cycle, context diff edge cases, convention violation detection