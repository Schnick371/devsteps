# SPIKE-045 Research Brief — Documentation BOM Production Architecture

## Schema Design · JSON vs YAML · Node Lifecycle · AI Integration · Failure Modes

**Item:** SPIKE-045
**Date:** 2026-04-04
**Status:** complete — gate pending
**Mandate author:** coord (inline synthesis — Ring 1 subagents did not persist results; coord conducted direct codebase analysis + knowledge synthesis)
**Related:** SPIKE-036 (TSD+BOM foundations), SPIKE-040 (Diataxis taxonomy), SPIKE-044 (MCP dialog / BOM gap analysis), ADR-007 (JSON adjacency list decision)

---

## 1. Executive Summary

The existing `DocsMapNode` adjacency-list schema is structurally sound but **critically incomplete for production use**. It is missing at minimum five field categories that will be desperately needed by month 3: `diataxis_type` (classification enforcement), `file_path` (the most basic navigation operation requires a two-hop lookup today), `status` (lifecycle management is absent entirely), `ai_metadata` (staleness detection and confidence tracking), and `xrefs` (cross-cutting documentation relationships are invisible). The JSON format decision from ADR-007 is correct and should not be reopened. The hierarchy depth cap should be set at 4 levels (L0–L3). The single-file BOM is correct at current scale; partition only when nodes exceed 2,000. Confidence: **0.94** on all Phase 1–2 decisions; **0.87** on Phase 3–4 AI metadata design (depends on operational patterns not yet established).

---

## 2. Research Horizon

**90-day window:** 2026-01-04 to 2026-04-04
**Evidence base:** Internal codebase (ADR-007, SPIKE-036, SPIKE-040, SPIKE-044 briefs; `packages/shared/src/types/docs-map.ts`; `.devsteps/docs-map.schema.json`; `packages/shared/src/core/docs-map.ts`) + general knowledge synthesis covering documentation management systems, JSON Schema specification, DIATAXIS framework specification, VS Code TreeDataProvider API behavior.

**Coverage axes applied:** structural schema design · technology radar (JSON/YAML/TOML) · AI integration patterns · lifecycle state machines · production failure modes · security/integrity hardening

---

## 3. Source Map

| Claim | Source | Coverage Axis |
|-------|--------|---------------|
| Adjacency list vs. nested tree — VS Code TreeView bug #235890 | ADR-007, 2026-04-03 | structural |
| JSON 5–10× faster parse than YAML | ADR-007 (multi-source, established) | performance |
| All `.devsteps/` files are JSON — YAML is the sole outlier | docs-map.ts, ADR-007 | ecosystem consistency |
| `doc_subtype` proposed but NOT yet in schema | SPIKE-040, 2026-04-03 | gap analysis |
| BOM has NO `file_path` field — navigation requires two-hop DOC item lookup | `packages/shared/src/types/docs-map.ts` | gap analysis |
| `devsteps_items: string[]` plural correct (JSON-LD best practice) | ADR-007, W3C citation | standards compliance |
| DIATAXIS is widely adopted (Django, Kubernetes, PyPA) | SPIKE-040, diataxis.fr | technology radar |
| Extended Diataxis 5th category "research" justified | SPIKE-040 brief | taxonomy design |
| Atomic `.tmp → rename` dual-write pattern | `docs-map.ts` implementation | write protocol |
| ARCH-NNN ID scheme with gap-ordered `order` field | ADR-007 final schema | structural |
| No cross-reference integrity validation runs on commit today | codebase analysis | quality gap |
| No lifecycle `status` field exists in DocsMapNode today | `packages/shared/src/types/docs-map.ts` | gap analysis |
| No `ai_metadata` fields exist in DocsMapNode today | `packages/shared/src/types/docs-map.ts` | gap analysis |

---

## 4. Technology Radar Signals

| Technology / Pattern | Signal | Confidence | Rationale |
|---------------------|--------|------------|-----------|
| JSON adjacency list for BOM | **ADOPT** | 0.97 | ADR-007 decided; JSON-native host; fast parse; VS Code TreeView compatible |
| YAML for BOM master structure | **HOLD** | 0.92 | Adds parser dependency; YAML 1.3 frozen 2022; no concrete upside in JSON-native host |
| TOML for BOM structure | **HOLD** | 0.95 | Good for human-authored config, wrong fit for 1000-node machine-indexed manifests |
| JSON5 for BOM | **HOLD** | 0.98 | No JSON Schema support; no TypeScript native support |
| JSON-LD for BOM | **ASSESS** | 0.70 | Overkill now; revisit if cross-system doc graph sharing is needed |
| DIATAXIS framework | **ADOPT** | 0.97 | Widely adopted, well-defined, AI-friendly categorical structure |
| Extended Diataxis (5th "research" category) | **TRIAL** | 0.85 | Justified by SPIKE-040; monitor whether `research` nodes belong in BOM at all |
| Per-node AI metadata (`confidence_score`, `staleness_signal`) | **TRIAL** | 0.80 | Useful; risk of staleness metadata itself becoming stale |
| Separate `edges[]` array for cross-references | **ADOPT** | 0.88 | Cleaner separation than inline `xrefs[]`; enables graph queries |
| Single-file BOM (`.devsteps/docs-map.json`) | **ADOPT** | 0.90 | Correct to ~2000 nodes; revisit at scale |

---

## 5. PHASE 1 — BOM Schema Design

### Q1: Canonical JSON Schema for a Single BOM Node

#### Current state (from `packages/shared/src/types/docs-map.ts`)

```typescript
export interface DocsMapNode {
  id: string;                         // ARCH-NNN
  doc_id?: string;                    // DOC-NNN optional
  parent_id: string | null;           // adjacency list key
  order: number;                      // gap numbering
  title: string;
  description?: string;               // human note (often unfilled)
  devsteps_items: string[];           // N:M work-item refs
  tsd_heading_depth_max?: number;     // presentation hint
  default_depth?: 1 | 2 | 3 | 4;     // presentation hint
}
```

#### Production-quality target schema

```typescript
export interface DocsMapNode {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: string;                          // ARCH-NNN — stable, unique, never reused
  parent_id: string | null;            // null for L0 root nodes
  order: number;                       // gap numbering: 10, 20, 30
  title: string;                       // section heading (mirrors H1 in file)

  // ── Diataxis Classification ───────────────────────────────────────────────
  doc_subtype: DocSubtype;             // REQUIRED — was optional in SPIKE-040 proposal; MUST be required
  // 'tutorial' | 'how-to' | 'reference' | 'explanation' | 'architecture' | 'research'

  // ── File Reference ────────────────────────────────────────────────────────
  // CRITICAL MISSING FIELD — the BOM must know WHERE the document lives.
  // Today: two-hop lookup via doc_id → DOC item → file path. Unacceptable at scale.
  file_path?: string;                  // Relative path from workspace root, e.g. "docs/architecture/adr-007.md"
  // NOTE: file_path is optional for "container" nodes (L0/L1 cluster nodes spanning
  // multiple files). Leaf nodes MUST have this field set.

  // ── Lifecycle / Status ────────────────────────────────────────────────────
  status: BomNodeStatus;               // REQUIRED — was entirely absent
  // 'draft' | 'ai-generated' | 'human-reviewed' | 'approved' | 'stale' | 'deprecated'

  // ── DevSteps Integration ─────────────────────────────────────────────────
  doc_id?: string;                     // Optional DOC-NNN item (cluster nodes may lack it)
  devsteps_items: string[];            // N:M work-item traceability

  // ── AI Metadata ───────────────────────────────────────────────────────────
  ai?: AiBomMetadata;                  // Absent for human-only nodes

  // ── Versioning / Timestamps ───────────────────────────────────────────────
  created_at: string;                  // ISO 8601 — set at creation, never mutated
  updated_at: string;                  // ISO 8601 — updated on any field change

  // ── Presentation Hints (optional, low priority) ───────────────────────────
  description?: string;                // Editorial context for AI/human consumers
  tsd_heading_depth_max?: number;      // Override Depth View ceiling for this subtree
  default_depth?: 1 | 2 | 3 | 4;      // Default Depth View zoom when doc opens
}

export type DocSubtype = 'tutorial' | 'how-to' | 'reference' | 'explanation' | 'architecture' | 'research';

export type BomNodeStatus = 'draft' | 'ai-generated' | 'human-reviewed' | 'approved' | 'stale' | 'deprecated';

export interface AiBomMetadata {
  last_reviewed_at: string;            // ISO 8601 — when AI last assessed this node
  confidence_score: number;            // 0.0–1.0 — AI's confidence in content completeness
  coverage_completeness: number;       // 0.0–1.0 — how fully the node covers its declared scope
  staleness_signal: 'fresh' | 'aging' | 'stale' | 'unknown';  // derived from last_reviewed_at + elapsed time
  model_version?: string;              // which AI model produced this (for deprecation tracking)
}

export interface DocsMapDocument {
  $schema?: string;                    // Link to docs-map.schema.json for VS Code IntelliSense
  version: string;                     // Schema version ("1.0"); major bump = migration required
  nodes: DocsMapNode[];                // Flat adjacency list — tree derived via parent_id at runtime
  edges?: BomEdge[];                   // Optional cross-reference graph (see Q2)
  updated_at: string;                  // Document-level last write timestamp
}

export interface BomEdge {
  from: string;                        // ARCH-NNN
  to: string;                          // ARCH-NNN
  type: 'see-also' | 'shares-concept' | 'specializes' | 'contradicts';
}
```

#### Self-challenge: what fields will never be filled in practice?

| Field | Predicted fill rate at month 6 | Why it will be skipped | Mitigation |
|-------|-------------------------------|------------------------|------------|
| `description` | 15–30% | Optional, authors skip it | Keep optional; AI can generate it |
| `doc_subtype` | <5% if optional | Same pattern as any optional classification field | **Make REQUIRED** |
| `ai.model_version` | 40% | Authors forget to include it | Default to `"unknown"` in AI write protocol |
| `file_path` on container nodes | N/A | Container nodes don't have files | Correctly optional for containers; REQUIRED for leaves |
| `tsd_heading_depth_max` | 10–20% | Specialist field for edge cases | Stays optional |

#### What is missing that will be desperately needed at month 6?

1. **`file_path`** — The #1 missing field. Navigation, validation, and AI generation all need to find the actual file. Today this requires loading the DOC item via `doc_id`. See "The One Dangerous Detail" (Q19).

2. **`status` lifecycle field** — Without this, there is no way to distinguish "draft auto-generated in 2026-04-04" from "human-approved 2025-12-01". Every doc has the same weight.

3. **`doc_subtype` as required** — SPIKE-040 proposed making it optional. That is wrong. Optional classification becomes no classification within 6 months.

4. **`created_at` / `updated_at`** — These are absent entirely. Even the shadow positions index (`DocsMapPositionsIndex`) has an `updated` field at the document level, but NOT per-node. Per-node timestamps are essential for staleness detection.

5. **`edges[]` at document level** — Cross-cutting concerns (shared concepts, specializations) are entirely invisible in the current schema.

---

### Q2: Graph Edges in a Tree-Structured JSON BOM

The BOM is a tree but documentation is a graph. Two approaches:

#### Approach A: Inline `xrefs` array per node

```json
{
  "id": "ARCH-042",
  "xrefs": ["ARCH-017", "ARCH-031"]
}
```

**Pros:** Co-located with node; easy to read for a single node; AI agent sees cross-refs when loading a node
**Cons:** Bidirectional refs must be maintained twice (A refs B → B must also ref A, or you have asymmetric graph); no edge type information; finding all nodes that ref ARCH-042 requires full scan; merge conflicts when multiple agents update different nodes that ref the same target

#### Approach B: Separate `edges[]` at document level (RECOMMENDED)

```json
{
  "version": "1.0",
  "nodes": [...],
  "edges": [
    { "from": "ARCH-042", "to": "ARCH-017", "type": "see-also" },
    { "from": "ARCH-042", "to": "ARCH-031", "type": "shares-concept" }
  ]
}
```

**Pros:** Centralized; graph queries are O(n) over edges (no full node scan); edge type is explicit; AI can load ONLY edges without loading all node metadata; merge conflicts are limited to the edges array; bidirectionality is queryable in both directions without duplication

**Cons:** Two-pass load to correlate edge with node data; editors must look in two places; edges array could grow large if every concept is extensively cross-referenced

**Verdict: Approach B. The edges array is the correct choice.** The tree gives you the primary hierarchy; the edges give you the secondary graph. Loading them separately enables AI agents to load only what they need for each task type. The cross-reference integrity check runs against the edges array, not scattered across 1000 nodes.

**Edge types:**
- `see-also` — related content worth consulting
- `shares-concept` — two nodes describe the same concept from different angles
- `specializes` — a more specific version of a concept in another node
- `contradicts` — apparent conflict (human must resolve) — rare but important for architectural documents that supersede each other

---

### Q3: How Deep Should the Hierarchy Go?

**Derived from user behavior and AI agent practicality — NOT from system topology.**

| Level | Label | Typical content | Typical count | Context load size |
|-------|-------|-----------------|---------------|------------------|
| L0 | System | Single root overview | 1 | Always loadable |
| L1 | Domain | Major subsystem (CLI, MCP, Extension, Shared) | 3–8 | Loadable as group |
| L2 | Component | Module, package, feature area | 20–60 | Load by domain |
| L3 | Document | Individual document node mapped to a file | 100–500 | Load by component |
| L4 | Section | Heading within a document | 500–5000 | CONTEXT OVERFLOW RISK |

**At L4 (heading-level nodes), the BOM becomes a table of contents, not an architecture manifest.** That function is already served by `tsd_heading_depth_max` (rendering depth control within a TSD file). An in-file heading is NOT a BOM node.

**AI agent practicality:** At 500 nodes an agent can load L0+L1+L2 (≈70 nodes) to understand the full architecture without context overflow. L3 is loaded lazily per component. L4 would require loading thousands of nodes to get a complete picture — that context size exceeds practical limits.

**User behavior:** Humans write and navigate documentation at file granularity (L3), not heading granularity (L4). Tree views beyond 4 levels are scrolling nightmares.

**Hard level cap: 4 (L0–L3). Strictly enforced.**

Depth 0 = root (1 node)
Depth 1 = domain (≤10 nodes)
Depth 2 = component (≤50 per domain)
Depth 3 = document (≤20 per component)

Validation rule: `max-depth-cap = 3` (depth is 0-indexed). Any node at depth 4 or greater triggers ERROR in CI.

---

### Q4: Single File vs. Sharded BOM

| Criterion | Single File | Sharded (one per L1 domain) |
|-----------|------------|----------------------------|
| AI context load | Full file = 20–200KB at scale; lazy subtree queries possible with adjacency list | Smaller files per domain; but cross-domain queries require loading multiple shards |
| Human editability | One file to open, search, edit | Must know which shard to edit; cross-domain restructuring requires editing multiple files |
| Merge conflict surface | Single array; high conflict risk when multiple agents write simultaneously | Isolated per domain; conflicts only when two agents edit the same domain shard |
| Tooling complexity | Simple: one read/write function | Requires manifest-of-manifests ("index.json" listing shard paths); two-level lookup |
| Cross-reference integrity | Single pass over one file's edges[] | Cross-shard edges require loading all shards for integrity validation |
| Performance (Node.js JSON.parse) | 200KB JSON parses in <5ms on any modern hardware | Marginal improvement; not the bottleneck |

**Decision: Single file is correct up to approximately 2,000 nodes.**

At 2,000 nodes, the file exceeds 500KB and AI context loading becomes impractical. The shard trigger should be automatic: when `nodes.length > 2000`, a migration creates per-domain shard files referenced from a manifest. That migration is a v2.0 schema change.

For this project's current scale (projected 100–500 nodes), a single file is the right choice and sharding would add complexity without benefit.

---

## 6. PHASE 2 — JSON vs. YAML: The Real Decision

### Q5: JSON for the BOM Master Structure

**Structural limitations for human-editable, richly typed tree:**
- No inline comments. The `description` field on each node partially substitutes, but intent cannot be annotated next to the data that needs context. Example: you cannot write `// TODO: split this node into L2 and L3 after refactor` in JSON.
- Arrays of objects are verbose. A 5-field node requires ~10 lines of JSON. At 500 nodes: 5,000 lines of dense JSON with no visual breathing room.
- Multiline string values (full descriptions) require escaped JSON strings. This makes rich editorial notes essentially unwritable by hand.

**No native comment syntax — how critical is this for a BOM?**

More critical than average, for one specific reason: a BOM is a living architecture document. Architects leave notes like "restructure this subtree after STORY-280 lands" or "this section duplicates ARCH-017 — merge planned for Q2". Without comments, these notes must be stored as `description` field values, polluting the semantic data field with editorial intent.

**Mitigation (adopted in recommended schema):** Add a `note` field separate from `description`:
- `description` — intended for AI and human consumers: explains the node's content scope
- `note` — intended for editors only: TODOs, migration plans, review flags (filtered from AI context payloads)

**JSON Schema validation — how far does it get you?**

JSON Schema validates structure and types excellently. It fails for cross-reference integrity:
- It CANNOT validate that `parent_id: "ARCH-042"` references an `id` that exists in the same array. This requires custom validation logic (BOM validator rule `parent-exists`).
- It CANNOT validate that `edges[n].from` references a node that exists in `nodes[]`. Again: custom rule.
- It CANNOT validate that `devsteps_items[]` entries reference existing DevSteps items without querying the items index. This is an application-level check, not schema-level.

**Performance at scale:**
- 1,000 nodes: ~100KB JSON → <2ms parse. No concern.
- 10,000 nodes: ~1MB JSON → ~15ms parse. Minor concern for interactive tools; non-issue for CI.
- 10,000+ nodes: File becomes unusable in VS Code IntelliSense (schema validation stalls). This is the real scalability ceiling, not Node.js parse performance.

### Q6: YAML for the BOM Master Structure

**Concrete technical advantages beyond "more readable":**

1. **Comments** — The one genuine advantage. `# TODO: merge with ARCH-042 post-sprint` is not possible in JSON.
2. **Multiline strings** (`|` or `>` block scalars) — Rich `description` fields become readable without escape sequences.
3. **Anchors/aliases** — Could reduce repetition for shared metadata patterns (e.g., a `&approved-ai` anchor for standard AI metadata). **However:** anchor/alias use in BOMs is maintenance chaos — see YAML footguns below.

**YAML footguns relevant here:**

| Footgun | Description | Severity in BOM context |
|---------|-------------|------------------------|
| **Norway problem** | `NO` parses as boolean `false` in YAML 1.1 (mitigated in 1.2+) | MEDIUM — ARCH-IDs use alphanumeric, but `status: NO` would be a catastrophic surprise |
| **Implicit typing** | `order: 1.0` parses as float even if schema expects int in YAML 1.1 | MEDIUM — gap numbering (10, 20, 30) is integers; float is valid but unexpected |
| **Anchor/alias abuse** | Anchors create shared references, not copies. Mutating the anchored object mutates all aliases. | HIGH — in a BOM, shared mutable references would corrupt the node array |
| **Indentation sensitivity** | A single wrong indent creates a different structure. 500-node YAML file = 5,000+ lines with silent structural errors possible | HIGH — this is a write-time corruption risk in AI-generated YAML |
| **String ambiguity** | `title: true` parses as boolean, not string "true" | LOW for ARCH-IDs; MEDIUM for titles that happen to match YAML keywords |

**YAML as a superset of JSON — does it matter operationally?**

In a JSON-native host: yes. "YAML is a superset of JSON" means every JSON file is valid YAML. But it also means every YAML file **must be parsed with a YAML parser, not `JSON.parse`**. Introducing YAML means introducing a dependency (`js-yaml` or `yaml` npm package) and a parse path that is not tested by the existing test suite.

**Tooling consistency outside Python:**

The YAML-native ecosystem is Python-first. In TypeScript/Node.js:
- `js-yaml` is the dominant library (3M downloads/week) — well-maintained but adds ~50KB to the bundle
- `yaml` (eemeli) is the modern alternative — full YAML 1.2 support, better TypeScript types
- VS Code IntelliSense for YAML Schema requires `redhat.vscode-yaml` extension (external dependency)
- JSON Schema validation for YAML requires adapters — the native `ajv` validator requires a YAML→JSON parse step

Real operational cost: one additional npm dependency + one additional VS Code extension recommendation + complexity in the MCP server's read path.

### Q7: TOML, JSON5, JSON-LD evaluation

**TOML:**
- Outperforms JSON: human-authored BOM files where each node is a `[[nodes]]` table entry. TOML is genuinely more readable than JSON for human-maintained configuration.
- Fails for this case: large adjacency lists with 500+ `[[nodes]]` table entries are unnavigable. TOML has no built-in array-of-object schema validation ecosystem in TypeScript. No VS Code IntelliSense for custom TOML schemas without significant tooling investment.

**JSON5:**
- Outperforms JSON: allows comments (`// TODO`) and trailing commas — eliminates JSON's two biggest human-authoring pain points.
- Fails for this case: JSON5 is NOT the JSON Schema target format. `ajv`, VS Code's `$schema` intellisense, and all JSON Schema tooling operate on JSON. JSON5 → JSON must be transpiled in the write path. `additionalProperties: false` validation requires a conversion step before every validation run.

**JSON-LD:**
- Outperforms JSON: if the BOM needs to be shared across systems or published as linked data. `@context` + `@type` enables semantic interoperability between documentation systems (e.g., BOM nodes as linked data consumed by external search engines).
- Fails for this case: `@context`, `@id`, `@graph` add 30–50% verbosity. For a private per-project BOM consumed by a single local MCP server, JSON-LD is architectural overreach. Revisit only if cross-project doc knowledge bases become a roadmap item.

### Q8: Split-Format Architecture (YAML for humans, JSON for AI metadata)

The operational seam analysis:

| Seam type | Where it hurts | Where it helps |
|-----------|----------------|----------------|
| Two parsers | Every read operation branches: is this a human-edited YAML node or AI-written JSON block? | Each format matches its writer's natural idiom |
| Node identity across formats | ARCH-NNN appears in both YAML (structure) and JSON (metadata). Keeping them in sync = merge surface | AI can update metadata without touching human-readable structure |
| Validation | Two validators must agree on the same node. Conflict: YAML `status: approved` but JSON `status: stale` for same ARCH-NNN | Enables independent validation per concern |
| Tooling | Two build paths, two test paths, two CI steps | |
| VS Code IntelliSense | Requires both `yaml.schemas` and `json.schemas` configuration | |

**Verdict: Split-format is a false optimization.** The pain of maintaining two parsers and two validation paths outweighs the benefit of "humans write YAML, AI writes JSON." The actual solution is better: AI writes to the same JSON BOM, and human-readable editorial notes live in the `note` field (filtered from AI context). One format, one parser, one write path.

### Q9: Hard Call — JSON or YAML for the BOM?

**JSON. Definitively.**

Confidence: **0.92**

Evidence: ADR-007 already made this decision for this codebase with 18 sources and correct analysis. The concerns about JSON's lack of comments are real but mitigated by the `note` field proposal. YAML's advantages (comments, readability) are genuine for human-maintained files but operationally costly in a TypeScript-native system where the BOM is primarily written by AI agents and MCP tools, not hand-authored by humans.

**One condition for reversal:** If the BOM reaches 70%+ human-authored at volume (i.e., human architects are manually maintaining most nodes, not AI agents), the comment argument becomes sufficiently strong to justify the `yaml` dependency and parse path complexity. This is unlikely given the system's design as an AI-assisted documentation toolchain.

---

## 7. PHASE 3 — Node Lifecycle and Versioning

### Q10: L3 Function Document Change — Upward Propagation

**Scenario:** L3 document `ARCH-042` is updated after a code refactor of `packages/shared/src/core/link.ts`.

**Propagation rules (formal):**

```
Rule P-1: Direct child status change → parent acquires staleness awareness
  When: child.status changes to 'stale'
  Action: parent.ai.staleness_signal = 'aging'
  (parent is NOT immediately 'stale' — other children may be fresh)

Rule P-2: All children stale → parent becomes stale
  When: ALL direct children of a node have status ∈ {'stale', 'deprecated'}
  Action: parent.status = 'stale', parent.ai.staleness_signal = 'stale'

Rule P-3: One child updated → parent freshness signal refreshes
  When: child.status changes to 'human-reviewed' or 'approved'
  Action: parent.ai.staleness_signal = 'fresh' (if ALL siblings are fresh or approved)
          parent.ai.staleness_signal = 'aging' (if any sibling is stale or aging)

Rule P-4: Upward propagation stops at first non-stale ancestor
  When: ancestor.ai.staleness_signal is already 'stale' and remains full-stale
  Action: propagate continues until L0 unless stopped by a fully-approved subtree on another branch
```

**What must be invalidated:**
1. The node's own `ai.staleness_signal` (set to `'stale'`) and `status` (set to `'stale'`)
2. The node's parent chain — each ancestor's `ai.staleness_signal` moves to `'aging'`
3. All `edges[]` where this node is the `from` OR `to` — edges point to potentially-stale content
4. The positions shadow index (`index/docs-map-positions.json`) — must be rebuilt

**What must NOT be invalidated:**
- Sibling nodes — they are independent (different files)
- Cross-reference targets that merely `see-also` this node — they remain valid; they just know a reference is now stale
- The parent's `status` field — it remains `approved` until all children are stale (Rule P-2)

### Q11: L0 Overview Changes Strategic Direction — Downward Cascade

**Scenario:** The L0 root document redefines the system's primary purpose, deprecating several architectural patterns.

**AI agent detection algorithm:**

```
1. Parse the L0 document diff (new vs. previous version).
2. Extract changed concept set: {removed_concepts, added_concepts, redefined_concepts}.
3. For each node at L1–L3:
   a. Load node.description + file_path excerpt (first 200 words).
   b. Semantic match: does node content reference removed_concepts?
   c. If match: node.ai.staleness_signal = 'aging', add to review queue.
4. Prioritize by doc_subtype:
   - 'explanation' nodes first (they describe "why" — most affected by strategic change)
   - 'architecture' nodes second (structural decisions tied to strategy)
   - 'reference' nodes third (may reference deprecated APIs/patterns)
   - 'tutorial' and 'how-to' nodes last (procedural — least affected by strategic direction)
5. Output: ordered list of nodes requiring human review, grouped by priority tier.
```

**At the BOM schema level:** The L0 change sets ALL children's `ai.staleness_signal = 'aging'`. The status remains `approved` — human review queue is populated but no automatic status change. The human reviewer closes the loop by updating each child to `human-reviewed` after verifying content.

**Critical invariant:** The AI NEVER automatically demotes a `human-reviewed` or `approved` node to `stale` based on L0 change alone. It signals `aging` and waits for human confirmation. This preserves human authority over lifecycle transitions.

### Q12: Lifecycle State Machine for a Single BOM Node

```
States:
  draft          → Initial state when node is created (empty or stub)
  ai-generated   → AI has written first-pass content
  human-reviewed → Human has read and accepted/edited content
  approved       → Explicit sign-off (human or CI gate)
  stale          → Content known to be outdated (triggered by code change or time)
  deprecated     → Node intentionally removed from active BOM (invisible in TreeView)

Valid transitions:

  draft ──────────────────────► ai-generated    (AI: writes content via devsteps_docs agent)
  draft ──────────────────────► human-reviewed   (Human: writes document directly)
  ai-generated ───────────────► human-reviewed   (Human: reviews and accepts/edits AI draft)
  ai-generated ───────────────► stale            (Time: AI content is >90 days old without review)
  human-reviewed ─────────────► approved         (Human or CI gate: explicit sign-off)
  approved ───────────────────► stale            (Code change detected, or 90-day review clock expired)
  stale ──────────────────────► human-reviewed   (Human: updates document content)
  stale ──────────────────────► deprecated       (Human: removes this section from BOM)
  approved ───────────────────► deprecated       (Human: section no longer needed)
  human-reviewed ─────────────► stale            (Concurrent change while in review)

FORBIDDEN transitions:
  × stale → approved            (must pass through human-reviewed first)
  × draft → approved            (cannot skip human review)
  × deprecated → any            (terminal state — create a new node instead)
  × ai-generated → approved     (must pass through human-reviewed — AI output is never auto-approved)
```

**Trigger rules:**
- `draft → ai-generated`: AI agent writes content, sets `ai.last_reviewed_at = now()`, `ai.confidence_score`
- `ai-generated → stale`: automated, time-based — staleness_decay after 90 days without human review
- `approved → stale`: automated, event-based — code change detected in `affected_paths` refs, OR 90-day clock
- `stale → human-reviewed`: human edit + explicit status update via `devsteps_docs_*` MCP tool
- `approved/stale → deprecated`: human only, via MCP tool with confirmation step

### Q13: Whole-BOM Versioning

**Recommended approach: Semantic versioning at the document level**

The existing `version: "1.0"` in `DocsMapDocument` is the right mechanism. The semantics:

| Version type | When to bump | What it means |
|-------------|-------------|---------------|
| Patch (1.0.x) | Node content updates, status changes, edge additions | No schema changes; all tools read without migration |
| Minor (1.x.0) | New optional fields added to DocsMapNode | Backward-compatible; old tools can ignore new fields |
| Major (x.0.0) | Required fields added, fields renamed/removed, format change | Migration gate required before reads |

**What a "diff" between BOM v1.0 and v1.1 means semantically:**
- New node IDs: documentation was added (coverage increased)
- Removed node IDs: sections were deprecated or merged
- `status` changes: approval state changed (review activity signal)
- `doc_subtype` changes: reclassification occurred (architecture review signal)
- `edges[]` additions: cross-reference graph became richer
- `file_path` changes: documentation was reorganized

**How the AI agent interprets a BOM diff:**
```
Step 1: Compute delta: {added_nodes, removed_nodes, modified_nodes}
Step 2: For removed_nodes: check edges[] for any references pointing to removed ids → cross-ref rot candidates
Step 3: For modified_nodes where status changed {approved → stale}: add to staleness review queue
Step 4: For modified_nodes where doc_subtype changed: log reclassification for human review
Step 5: For added_nodes: check that file_path exists on disk → file-ref-exists validation
```

**BOM versioning is NOT git-native.** The `version` field in `DocsMapDocument` is the semantic version. Git history provides the diff — the `version` field signals migratability. The combination is: git gives you "what changed", `version` gives you "whether your tools can read it."

---

## 8. PHASE 4 — AI Agent Integration

### Q14: Minimum Viable Context Payload Per Task

#### a) Detect missing documents

**Load:**
- All `DocsMapNode.id`, `doc_id`, `status`, `doc_subtype` for all nodes (no `description`, no `ai_metadata`)
- The edges array (to detect cross-ref orphans)
- The DevSteps items index (to cross-check `devsteps_items` references exist)

**Do NOT load:**
- `description`, `note` fields (irrelevant to gap detection)
- AI metadata fields (irrelevant to gap detection)
- File contents (only file existence needs to be checked)

**Detection rule:** Leaf nodes (no children in `nodes[]` with `parent_id === this.id`) where `doc_id` is absent OR `file_path` is absent OR `status === 'draft'` → missing document.

#### b) Detect stale documents

**Load:**
- All nodes filtered to `status ∈ {'approved', 'human-reviewed'}`, fields: `id`, `status`, `file_path`, `ai.last_reviewed_at`, `ai.staleness_signal`, `updated_at`
- Code change metadata: last committed timestamp for files in each node's `file_path`

**Do NOT load:**
- `description`, presentation hints, edge list (unnecessary for staleness)
- Nodes with `status ∈ {'draft', 'ai-generated', 'deprecated'}` (already in review queue or inactive)

**Detection rule:** `ai.last_reviewed_at` > 90 days OR `file_path`'s last git commit > `ai.last_reviewed_at` → stale candidate.

#### c) Generate a new document at a given node

**Load:**
- Target node: ALL fields (full context)
- Parent chain (up to L0): `id`, `title`, `doc_subtype`, `description` (for hierarchy context)
- Sibling nodes: `id`, `title`, `doc_subtype` (to avoid duplication)
- `edges[]` where `from` or `to` is the target node ARCH-NNN: load full target nodes of those edges (cross-reference context)
- L0 root node: full `description` (strategic context)

**Do NOT load:**
- Unrelated subtrees
- Other L1 domain nodes (unless edge points to them)
- AI metadata from sibling nodes

**Required for generation prompt (see Q16 prompt invariants):** `doc_subtype` (DIATAXIS enforcement), `tsd_heading_depth_max` (depth constraint), parent title chain (breadcrumb for context-setting header).

#### d) Validate existing document against BOM node

**Load:**
- The specific node: `id`, `doc_subtype`, `status`, `file_path`, `tsd_heading_depth_max`
- The actual file content (first 500 words is sufficient for type validation)

**Do NOT load:**
- Parent chain (not needed for type validation)
- AI metadata (not needed for type validation)
- Other nodes (isolated validation)

**Validation checks:** Does the document's content pattern match its declared `doc_subtype`? (Tutorial: step-by-step imperative prose. How-to: outcome-focused numbered steps. Reference: terse descriptive sections. Explanation: "because" / "the reason is" language. Architecture: decisions + rationale + alternatives. Research: evidence-cited findings with recommendations.)

---

### Q15: AI Write Protocol — Node Registration

When an AI agent writes a new document and registers it in the BOM:

```
PRE-FLIGHT CHECKS (agent-side, before any write):

  1. ARCH-NNN uniqueness: new_node.id NOT IN {n.id for n in existing_nodes} — ERROR if collision
  2. Parent existence: if new_node.parent_id !== null: parent_id MUST exist in nodes[] — ERROR if not
  3. Circular reference: traverse parent chain from new_node.parent_id to root — ERROR if new_node.id appears
  4. Depth cap: count ancestor nodes in chain — ERROR if depth > 3
  5. doc_subtype required: new_node.doc_subtype MUST be set — ERROR if absent
  6. file_path check (leaf nodes): if no children planned, file_path MUST be provided — WARNING if absent
  7. Order uniqueness: no sibling (same parent_id) has the same order value — WARNING if collision (auto-increment)
  8. Schema validation: run against docs-map.schema.json via ajv — ERROR on any failure

ATOMIC WRITE SEQUENCE:
  1. Read current DocsMapDocument (readDocsMap)
  2. Append new_node to nodes[]
  3. Set new_node.status = 'ai-generated'
  4. Set new_node.created_at = new_node.updated_at = now()
  5. Set new_node.ai = { last_reviewed_at: now(), confidence_score: [self-assessed], coverage_completeness: [self-assessed], staleness_signal: 'fresh', model_version: [model_id] }
  6. If parent_id !== null: update parent.updated_at = now()
  7. writeDocsMap (atomic .tmp → rename)
  8. Shadow index rebuilt automatically by writeDocsMap

ROLLBACK:
  - The .tmp → rename pattern makes partial writes impossible.
  - If writeFileSync(.tmp) fails: primary docs-map.json is UNTOUCHED.
  - If renameSync fails: .tmp file remains. Agent should detect stale .tmp (threshold: 60 seconds — consistent with other write protocols in the codebase) and clean up.
  - The pre-flight checks are the only non-atomic step. If they pass and the write fails, the pre-flight is safe to re-run (idempotent).

POST-WRITE:
  1. Parent node's ai.staleness_signal set to 'aging' (new child changes coverage completeness)
  2. Agent records write in MandateResult with: arch_id_created, file_path, doc_subtype, confidence_score
```

---

### Q16: Prompt Invariants — Every AI Agent Call

These constraints MUST appear in every AI agent call for documentation generation, regardless of task type:

```
1. DIATAXIS TYPE ENFORCEMENT:
   "Document type: {doc_subtype}. Enforce type characteristics:
   - tutorial: step-by-step, learning-by-doing, outcome is capability
   - how-to: goal-oriented, assume competence, outcome is a specific result
   - reference: complete, consistent, neutral descriptive tone
   - explanation: conceptual, 'why' and 'because', no step-by-step procedures
   - architecture: decision + alternatives + rationale + consequences
   - research: evidence-cited, source-annotated, recommendation with confidence level"

2. LEVEL DEPTH CONSTRAINT:
   "This is an L{depth} document. Depth {depth} characteristics:
   - L0: one-page system overview, strategic intent only
   - L1: subsystem overview, key components named, no implementation detail
   - L2: component description, interface summary, dependency list
   - L3: document-level detail, implementation-aware, code references permitted"

3. CROSS-REFERENCE INTEGRITY:
   "Cross-references: only cite these pre-validated ARCH-NNN IDs: {xref_ids_from_edges}
   Do NOT invent ARCH-NNN references not present in the edges list."

4. STATUS UPDATE REQUIRED:
   "After writing, update this node's status in docs-map.json:
   - New document: status = 'ai-generated'
   - Updated document: status = 'ai-generated' (demote from human-reviewed if content changed significantly)
   - Set ai.last_reviewed_at to current timestamp
   - Set ai.confidence_score to your self-assessed confidence (0.0–1.0)"

5. COVERAGE COMPLETENESS SELF-ASSESSMENT:
   "At end of generation, assign a coverage_completeness score (0.0–1.0):
   1.0 = all aspects of this node's scope fully addressed
   0.7 = major aspects covered, minor gaps remain
   0.5 = structural skeleton, half the content is placeholder
   <0.5 = incomplete draft — set status='draft' instead of 'ai-generated'"
```

---

### Q17: Human vs. AI Conflict on Node Placement

**Human wins. Unconditionally.**

Rationale: The BOM represents architectural decisions. Architectural decisions belong to humans, not to the AI agent that generated a first pass. An AI may correctly identify that a document *fits* a location, but the human architect decides where it *belongs*.

**Conflict representation in the BOM schema:**

```json
{
  "id": "ARCH-042",
  "parent_id": "ARCH-010",
  "doc_subtype": "architecture",
  "status": "human-reviewed",
  "note": "AI originally placed at ARCH-020 (component-level). Moved to ARCH-010 (domain-level) by human reviewer — this is a cross-cutting decision, not component-scoped.",
  "ai": {
    "last_reviewed_at": "2026-04-03T14:22:00Z",
    "confidence_score": 0.72,
    "coverage_completeness": 0.80,
    "staleness_signal": "fresh",
    "override_note": "Placement overridden by human: original parent_id was ARCH-020"
  }
}
```

The `note` field captures the human decision. The `ai.override_note` preserves the AI's original suggestion for auditability. The git history provides the full diff of the placement change. The `status` is set to `human-reviewed` (overriding `ai-generated`), signaling that human judgment supersedes the AI's classification.

---

## 9. PHASE 5 — Failure Modes and Production Hardening

### Q18: Top 5 Failure Modes (ranked by P × I)

**Rank 1 — Cross-Reference Rot (P: HIGH × I: HIGH = CRITICAL)**

*Scenario:* Node `ARCH-042` is deprecated and removed from the BOM. However, 12 other nodes reference `ARCH-042` in their `edges[].to` or `devsteps_items[]`. These references are now dangling — the BOM references a ghost node. AI agents loading these edges receive ARCH-NNN IDs that don't resolve, silently generating incorrect cross-reference content.

*When it happens:* First time any node is deleted without running the BOM validator.

*Prevention:* Rule `xref-integrity-check` runs on every commit in CI. Deletion of an ARCH-NNN MUST be preceded by a refactoring step that removes all `edges[]` entries pointing to it. `deprecated` status is a safer intermediate state (node visible to validator but invisible to TreeView).

---

**Rank 2 — `doc_subtype` Remains Optional → Classification Becomes Meaningless (P: VERY HIGH × I: MEDIUM = HIGH)**

*Scenario:* The SPIKE-040 proposal made `doc_subtype` optional. Within 3 months, 80% of nodes have no `doc_subtype`. The AI agent loading a node for generation cannot enforce type-appropriate writing because there is no declared type. Documentation quality degrades to inconsistent ad-hoc writing.

*When it happens:* Gradually, from day 1, as authors and AI agents skip the optional field.

*Prevention:* **Make `doc_subtype` REQUIRED at the schema level.** `additionalProperties: false` + `required: ["id", "parent_id", "order", "title", "devsteps_items", "status", "doc_subtype"]`. No new node can be written to the BOM without a type declaration. CI schema validation (`ajv`) enforces this on every commit. Breaking this requirement requires an explicit `NONE` value (or similar) as a declared escape hatch — not silent omission.

---

**Rank 3 — `file_path` Missing → Navigation Requires Two-Hop Lookup Forever (P: CERTAIN × I: HIGH = HIGH)**

*Scenario:* The current schema has no `file_path` field. Every operation that needs to open, read, or validate a document must: (1) find the node's `doc_id`, (2) look up the DOC item in `.devsteps/items/`, (3) extract the file path from the DOC item. This two-hop lookup is baked into every tool, test, and agent that touches documentation. When the project has 300+ nodes, refactoring this to a one-hop lookup requires updating every tool in the system.

*When it happens:* From the beginning, but pain is O(n) as nodes grow.

*Prevention:* **Add `file_path?: string` to DocsMapNode immediately.** Make it optional for container nodes, required for leaf nodes (enforced in the application layer, not JSON Schema — JSON Schema cannot determine "is this a leaf node" without full array context). Add it NOW before 200+ nodes are written without it.

---

**Rank 4 — AI Metadata Aging Silently (P: HIGH × I: MEDIUM = HIGH)**

*Scenario:* An AI agent writes a node with `confidence_score: 0.95` and `last_reviewed_at: 2026-04-04`. The underlying codebase evolves for 6 months. The node's `status` remains `approved` because no code change triggered the staleness rule (the feature changed behavior without touching any explicitly tracked file). In 2026-10-04, an AI agent loads this node, sees `confidence_score: 0.95`, and treats it as authoritative. It generates a new related document based on stale content.

*When it happens:* Insidiously and silently — no error, no warning.

*Prevention:* Add `staleness_decay_days: 90` as a system constant. Any node where `(now() - last_reviewed_at).days > 90` has its `staleness_signal` automatically set to `'stale'` at read time (NOT at write time — computed on demand). The BOM validator rule `ai-metadata-freshness` enforces this on every commit. The AI context payload MUST check `staleness_signal` before treating AI metadata as authoritative.

---

**Rank 5 — Concurrent Write Collision (P: MEDIUM × I: HIGH = MEDIUM-HIGH)**

*Scenario:* Two AI agents simultaneously write new nodes to docs-map.json. Agent A reads the file (500 nodes), Agent B reads the file (500 nodes). Agent A writes 501-node file. Agent B writes 501-node file — OVERWRITING Agent A's addition. The file has 501 nodes instead of 502. Agent A's node is silently lost.

*When it happens:* When multiple `exec-doc` agents run in parallel on a large sprint, or when an `exec-impl` and an `exec-doc` run concurrently and both touch the BOM.

*Prevention:* Read-modify-write with last-modified timestamp check. Before `renameSync`, verify that the file's mtime matches the mtime from the original `readDocsMap` call. If mtime changed: re-read, re-apply the write operation, retry (max 3 retries). This is an optimistic concurrency control pattern. Reference: SPIKE-044 implemented the same pattern for import session files.

---

### Q19: The ONE Implementation Detail That Will Cause Maximum Pain at Scale

**The missing `file_path` field on `DocsMapNode`.**

Today, to answer "which file does ARCH-042 correspond to?", the system must:
1. Find `ARCH-042.doc_id` → `"DOC-017"` (if it's set — remember `doc_id` is optional)
2. Load `.devsteps/items/docs/DOC-017.md` (assuming that path exists)
3. Parse the DOC item to find the `affected_paths` or file reference
4. Extract the file path from that metadata

This is a two *(or three)* hop lookup for the most basic operation in any documentation system: "show me this document." It will be baked into every navigation handler, every AI context loader, every validation rule, every MCP tool that opens a doc. By the time 200+ nodes exist and this pattern is pervasive, refactoring it costs weeks.

The fix takes 5 minutes now: add `file_path?: string` to `DocsMapNode`. It costs nothing. The schema migration is backward-compatible (optional field). Every new node written after today gets a `file_path`. Old nodes get it lazily as they are updated. The two-hop lookup is eliminated for new nodes immediately.

**Add this field in the next schema update. Do not delay.**

---

### Q20: Minimal Validation Suite for BOM Integrity

Run these rules on every commit that touches `docs-map.json`. CI pipeline, AI agent pre-flight, and manual `devsteps docs validate` command.

| # | Rule name | What it checks | How it fails | Severity |
|---|-----------|----------------|--------------|----------|
| 1 | `unique-arch-ids` | All `nodes[].id` values are unique | Duplicate ARCH-NNN in same file | ERROR |
| 2 | `valid-arch-id-pattern` | All `id` values match `^ARCH-[A-Z0-9]+(-[A-Z0-9]+)*$` | Non-conformant ID | ERROR |
| 3 | `parent-exists` | All `parent_id` values (non-null) have a matching `id` in `nodes[]` | Orphan node | ERROR |
| 4 | `no-circular-refs` | No node appears in its own parent chain | Circular parent chain | ERROR |
| 5 | `root-nodes-exist` | At least one `parent_id: null` node exists | No root → tree invalid | ERROR |
| 6 | `order-uniqueness` | No two siblings (same `parent_id`) share identical `order` value | Duplicate order within siblings | WARNING |
| 7 | `doc-id-pattern` | All `doc_id` values match `^DOC-[0-9]+$` | Malformed DOC reference | ERROR |
| 8 | `devsteps-item-pattern` | All `devsteps_items[]` entries match the item ID pattern | Malformed work-item reference | ERROR |
| 9 | `xref-integrity` | All `edges[].from` and `edges[].to` reference existing `id`s in `nodes[]` | Cross-ref rot | ERROR |
| 10 | `doc-subtype-required` | All leaf nodes (no children) have `doc_subtype` set | Missing classification on leaf | WARNING → v2.0: ERROR |
| 11 | `max-depth-cap` | No node exceeds depth 3 from any root (0-indexed depth ≤ 3) | Over-deep hierarchy | ERROR |
| 12 | `approved-parent-chain` | No `approved` node has a direct parent with `status: draft` | Logical status inversion | WARNING |
| 13 | `ai-metadata-freshness` | Nodes with `status: approved` and `ai.last_reviewed_at` older than 90 days → flag as stale | Silent confidence rot | WARNING (auto-flags staleness_signal) |
| 14 | `file-ref-exists` | All `file_path` values reference files that exist on disk (relative to workspace root) | Dead file reference | ERROR |
| 15 | `schema-version` | `DocsMapDocument.version` matches the current tool's expected schema version | Forward-compatibility guard | ERROR on major mismatch, WARNING on minor |
| 16 | `no-approved-under-stale-parent` | No `approved` node has a direct parent with `status: stale` | Logical inversion — approved child under stale parent is incoherent | WARNING |

---

## 10. Full Field Summary — Recommended Production DocsMapNode

| Field | Presence | Type | Notes |
|-------|----------|------|-------|
| `id` | REQUIRED | `string (ARCH-NNN)` | Unique, never reused |
| `parent_id` | REQUIRED | `string \| null` | null for L0 roots |
| `order` | REQUIRED | `number` | Gap numbering: 10/20/30 |
| `title` | REQUIRED | `string` | Section heading |
| `doc_subtype` | **REQUIRED** (change from optional) | `DocSubtype` | DIATAXIS enforcement |
| `status` | **REQUIRED** (new field) | `BomNodeStatus` | Lifecycle gate |
| `devsteps_items` | REQUIRED | `string[]` | May be empty `[]` |
| `created_at` | **REQUIRED** (new field) | `string (ISO 8601)` | Set once, never mutated |
| `updated_at` | **REQUIRED** (new field) | `string (ISO 8601)` | Updated on any change |
| `file_path` | **RECOMMENDED** (optional, new field) | `string` | Required for leaf nodes; optional for containers |
| `doc_id` | optional | `string (DOC-NNN)` | Optional for cluster/container nodes |
| `description` | optional | `string` | For AI and human consumers |
| `note` | optional (new field) | `string` | Editorial TODOs, filtered from AI context |
| `ai` | optional (new field) | `AiBomMetadata` | Present for AI-generated nodes |
| `tsd_heading_depth_max` | optional | `number (1-6)` | Presentation hint |
| `default_depth` | optional | `1\|2\|3\|4` | Presentation hint |

**Document-level additions:**

| Field | Presence | Type | Notes |
|-------|----------|------|-------|
| `version` | REQUIRED (exists) | `string` | Semver |
| `nodes` | REQUIRED (exists) | `DocsMapNode[]` | Flat adjacency list |
| `edges` | optional (new field) | `BomEdge[]` | Cross-reference graph |
| `updated_at` | optional (new field) | `string (ISO 8601)` | Document-level last write |

---

## 11. Prioritized Recommendations

1. **[P0 — Immediately] Add `file_path` field to `DocsMapNode`.** Optional for containers, required (application-enforced) for leaf nodes. This eliminates the two-hop navigation lookup before it becomes load-bearing.

2. **[P0 — Immediately] Add `status: BomNodeStatus` as required field.** Without status, lifecycle management is impossible. Retroactive migration: all existing nodes default to `'draft'`.

3. **[P0 — Immediately] Change `doc_subtype` from optional to required.** Add to JSON Schema `required[]` array. DIATAXIS enforcement is meaningless if the classification is optional.

4. **[P1 — Next sprint] Add `created_at` / `updated_at` timestamps to `DocsMapNode`.** Required for staleness detection and audit history.

5. **[P1 — Next sprint] Add `edges[]` array to `DocsMapDocument`.** Enables cross-cutting documentation relationships. Start empty — add edges as editorial needs arise.

6. **[P1 — Next sprint] Add `ai?: AiBomMetadata` to `DocsMapNode`.** Required for AI-assisted staleness detection, confidence tracking, and context payload filtering.

7. **[P2 — Month 2] Implement BOM validation suite (15 rules above)** as `devsteps docs validate` CLI command and CI step. Rules 1–9 (structural integrity) must be GREEN before any BOM write is accepted.

8. **[P2 — Month 2] Add `note` field** as editorial-only annotation, explicitly filtered from AI context payloads. This substitutes for JSON's lack of comment syntax.

9. **[P3 — Month 3] Implement staleness propagation rules (Q10–Q11)** in `docs-map.ts` as a `propagateStatusChange(nodeId, newStatus)` function. Required for the AI staleness detection pipeline.

10. **[P3 — Month 3] Add hard depth cap enforcement** (MAX_DEPTH = 3) in `appendDocsMapNode()` and `writeDocsMap()`. Currently `appendDocsMapNode` has no depth check.

---

## 12. Migration Path for Existing DocsMapNode

The current schema (`version: "1.0"`) must migrate to the production schema (`version: "1.1"` — backward-compatible; all new fields are optional or have defaults).

```typescript
// Migration function — run once when docs-map.json is first written with new schema
function migrateV1_0_to_V1_1(doc: DocsMapDocument): DocsMapDocument {
  const now = new Date().toISOString();
  return {
    ...doc,
    version: '1.1',
    updated_at: now,
    edges: doc.edges ?? [],
    nodes: doc.nodes.map(node => ({
      ...node,
      status: node.status ?? 'draft',          // default: assume unreviewed
      doc_subtype: node.doc_subtype ?? undefined, // must be set by human/AI review
      created_at: node.created_at ?? now,       // retroactive — approximation only
      updated_at: node.updated_at ?? now,       // retroactive — approximation only
    }))
  };
}
```

The `doc_subtype` field defaults to `undefined` in migration — a subsequent classification scan (see §13 TASK item) will identify all nodes with unset `doc_subtype` and queue them for human/AI reclassification. Do NOT leave migrated nodes with silent undefined values — run the classification scan immediately after migration.

`version: "2.0"` (breaking) would be required only if: `doc_subtype` is made required in JSON Schema, AND existing nodes without it must be rejected by the schema validator. Defer until classification coverage is ≥ 90%.

---

## 13. Next Actions (DevSteps Items)

| Type | Title | Priority | Evidence |
|------|-------|----------|---------|
| TASK | Add `file_path` field to `DocsMapNode` schema + types | urgent-important | Q19 — highest-impact missing field |
| TASK | Add `status: BomNodeStatus` as required field to `DocsMapNode` | urgent-important | Q12 — lifecycle management prerequisite |
| TASK | Change `doc_subtype` from optional to required in JSON Schema | urgent-important | Q18 Rank 2 — classification rot prevention |
| TASK | Add `created_at`/`updated_at` timestamps to `DocsMapNode` | not-urgent-important | Q14 — staleness detection prerequisite |
| TASK | Add `edges?: BomEdge[]` to `DocsMapDocument` | not-urgent-important | Q2 — graph-over-tree representation |
| TASK | Add `ai?: AiBomMetadata` to `DocsMapNode` | not-urgent-important | Q14 — AI context optimization prerequisite |
| TASK | Add `note?: string` editorial field to `DocsMapNode` | not-urgent-important | Q9 — JSON comment substitute |
| STORY | Implement BOM validation suite (15 rules) as `devsteps docs validate` command | not-urgent-important | Q20 — production hardening |
| STORY | Implement `propagateStatusChange()` in docs-map.ts | not-urgent-important | Q10/Q11 — lifecycle propagation |
| TASK | Add MAX_DEPTH=3 enforcement in `appendDocsMapNode()` and `writeDocsMap()` | not-urgent-important | Q3 — depth cap enforcement |
| TASK | Implement BOM v1.0 → v1.1 migration function in docs-map.ts | not-urgent-important | Q13 — schema migration |
| TASK | Add concurrent write protection (optimistic lock) in `writeDocsMap()` | not-urgent-important | Q18 Rank 5 — write collision prevention |
| TASK | Post-migration BOM classification scan — identify all `doc_subtype`-unset nodes after v1.1 migration | not-urgent-important | Gate recommendation — prevent silent unclassified nodes |

---

*Brief complete. Gate-reviewer pending.*
