# SPIKE-044 — Server-Directed Dialog via MCP Tool Chaining
## Docs Import Workflow Design — Research Brief

**Date:** 2026-04-03  
**Sprint:** SPIKE-044-session1  
**Triage Tier:** FULL  
**Prepared by:** exec-planner (R3)  
**Status:** READY FOR GATE-REVIEWER  

---

## Table of Contents

1. [Architecture Overview](#section-1-architecture-overview)
2. [Session Contract](#section-2-session-contract)
3. [5 Tool API Contracts](#section-3-5-tool-api-contracts)
4. [BOM Gap Analysis](#section-4-bom-gap-analysis)
5. [heuristicClassify Pure-Function Spec](#section-5-heuristicclassify-pure-function-spec)
6. [`devsteps_docs_new` — Creation-Time Enforcement](#section-6-devsteps_docs_new--creation-time-enforcement)
7. [Implementation Work Items](#section-7-implementation-work-items)
8. [Citations](#section-8-citations)

---

## Section 1: Architecture Overview

### 1.1 Conceptual Model

The workflow is a **server-directed dialog**: instead of a single heuristic pass, the MCP server
orchestrates a multi-turn conversation between Copilot (the LLM agent) and the user. The server
holds state in `.devsteps/import-sessions/` files; the LLM is guided through each step by
`next_steps` arrays embedded in every tool response.

Mechanical enforcement is achieved via the **token-chain pattern** (AWS CCAPI, Aug 2025;
fastly/mcp v0.1.11, Apr 2026): an HMAC-SHA256 session token is issued at step 1 and required
by all subsequent tools. A missing or invalid token causes the tool to fail with an informative
error — the LLM cannot skip the init step even if it reasons that another path is more efficient.

### 1.2 Full Sequence Diagram (5-Step Dialog)

```
 User / Copilot                MCP Server               .devsteps/import-sessions/
 ────────────────────────────────────────────────────────────────────────────────
 call devsteps_docs_import
     { path: "docs/" }
                              ── scan directory ──▶
                              ── write session.json ──▶  <session_id>.json  (status: open)
                              ◀── return ──────────────
                              { session_id, token,
                                files[N], summary,
                                next_steps: [
                                  "Found N files. Call
                                   devsteps_docs_classify
                                   for EACH..." ] }

 for each file in files[]:
   call devsteps_docs_classify
     { path, excerpt, session_id, token }
                              ── validate token ──────▶  read session, check HMAC
                              ── score excerpt ────────  heuristicClassify(excerpt)
                              ── update session ──────▶  session.classified[] += entry
                              ◀── return ──────────────
                              { scores, winner, mixed,
                                signals, next_steps }

   [if mixed == true]:
     Present user with decision:
       "accept as [winner] | split | skip | rewrite"
     
   call devsteps_docs_classify_confirm
     { path, decision, ..., session_id, token }
                              ── validate token ──────▶
                              ── record decision ─────▶  session.classified[] update
                              ◀── return ──────────────
                              { pending_count, classified_count,
                                next_steps }

 call devsteps_docs_bom_status
     { session_id, token }
                              ── validate token ──────▶
                              ── read session ─────────  session.json
                              ◀── return ──────────────
                              { summary_table, pending,
                                classified, skipped }

 call devsteps_docs_bom_commit
     { session_id, token }
                              ── validate token ──────▶
                              ── create DOC items ─────  .devsteps/items/docs/DOC-NNN.json
                              ── update docs-map.json ─  nodes[] += new DocsMapNodes
                              ── mark session done ───▶  session.status = "committed"
                              ◀── return ──────────────
                              { items_created,
                                bom_nodes_added,
                                doc_items: ["DOC-NNN"...] }
```

### 1.3 How `next_steps` Guides Copilot

Each tool response includes a `next_steps: string[]` array of natural-language instructions.
The strings name the exact next tool and the exact parameters to pass. Example:

```json
"next_steps": [
  "Found 4 files. Call devsteps_docs_classify for EACH item in files[] — provide path, excerpt, session_id, and token. After all files are classified, call devsteps_docs_bom_commit."
]
```

The LLM reads this as part of its context window (tool call result) and treats it as the
authoritative next-action instruction. Reliability is **moderate on its own** (LLM may reason
a shortcut). This is why token enforcement is added on top.

### 1.4 Why Token Enforcement Is Better Than LLM Cooperation Alone

| Mechanism | Relies on | Can be skipped? | Failure mode |
|-----------|-----------|-----------------|--------------|
| `next_steps` text only | LLM reasoning | Yes — LLM may skip classify and call commit directly | Silent partial import: BOM updated with unclassified nodes |
| Token enforcement | HMAC validation server-side | No — missing/invalid token = hard error | Tool call fails with descriptive error; LLM must correct path |
| Both combined | LLM reasoning + HMAC | No | Belt-and-suspenders |

The AWS CCAPI pattern (Aug 2025) demonstrates why token enforcement is necessary:
*"The current token-based approach with descriptive parameter names provides reliable tool
ordering that LLMs consistently follow without confusion."* The token serves as a cryptographic
proof that step 1 completed — the server cannot lie about this.

**Security note:** HMAC tokens provide ordering enforcement, not authentication. The session files
live in `.devsteps/` (local filesystem, same trust boundary as all other DevSteps state).
`process.env.DEVSTEPS_IMPORT_SECRET` should be set in production; default fallback
`devsteps-import` is acceptable for local dev.

---

## Section 2: Session Contract

### 2.1 Session File Location

```
.devsteps/import-sessions/<session_id>.json
```

One file per import session. Created by `devsteps_docs_import`; updated by `devsteps_docs_classify`
and `devsteps_docs_classify_confirm`; finalised by `devsteps_docs_bom_commit`.

### 2.2 Session Schema (TypeScript)

```typescript
export type ImportSessionStatus = 'open' | 'classifying' | 'review' | 'committed' | 'aborted';

export interface ImportSessionFile {
  /** Relative path from project root */
  path: string;
  /** First 40 lines of the file (excerpt passed to classify) */
  excerpt: string;
  /** File size in bytes */
  size_bytes: number;
  /** ISO 8601 last modified timestamp */
  last_modified: string;
}

export interface ClassifiedEntry {
  path: string;
  decision: 'accept' | 'split' | 'skip' | 'rewrite';
  diataxis_type?: DiataxisType;
  scores: ScoreVector;
  mixed: boolean;
  splits?: SplitEntry[];
}

export interface ImportSession {
  /** UUID v4 — generated by devsteps_docs_import */
  session_id: string;
  /**
   * HMAC-SHA256(session_id + ':' + created_at, secret).
   * Stored as hex string.
   */
  token_hash: string;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** Session expiry in seconds (default: 3600) */
  ttl_seconds: number;
  /** Root path that was scanned */
  scanned_path: string;
  /** All candidate files discovered */
  files: ImportSessionFile[];
  /** Files with a recorded decision */
  classified: ClassifiedEntry[];
  /** Paths still awaiting classification */
  pending: string[];
  /** Current lifecycle status */
  status: ImportSessionStatus;
}
```

### 2.3 Token Format

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

const IMPORT_SECRET = process.env.DEVSTEPS_IMPORT_SECRET ?? 'devsteps-import';

export function generateSessionToken(session_id: string, created_at: string): string {
  return createHmac('sha256', IMPORT_SECRET)
    .update(`${session_id}:${created_at}`)
    .digest('hex');
}

export function validateSessionToken(
  session: ImportSession,
  token: string
): boolean {
  const expected = generateSessionToken(session.session_id, session.created_at);
  // timingSafeEqual prevents timing attacks
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
}
```

**Token is NOT stored in plaintext** — only `token_hash` is stored. The handler re-derives the
expected HMAC from `session_id` + `created_at` and compares. The `token` parameter in API
contracts is the hex-encoded HMAC that the client received from `devsteps_docs_import`.

### 2.4 Idempotency Rule

If `devsteps_docs_import` is called with a `path` that already has an open (non-expired,
non-committed) session:
- Return the existing session: same `session_id`, same `token`, existing `files[]`
- Do NOT create a duplicate session
- Expiry check: `Date.now() - Date.parse(created_at) < ttl_seconds * 1000`

Detection: scan `.devsteps/import-sessions/*.json` for sessions where `scanned_path === path`
and `status === 'open' | 'classifying'` and not expired.

### 2.5 Session Expiry Handling

If a subsequent tool call presents a valid token but the session has expired
(`ttl_seconds` elapsed since `created_at`):
- Return error: `{ success: false, error: "Session expired. Call devsteps_docs_import again to start a new session." }`
- Do NOT delete the session file (allows forensic inspection)

---

## Section 3: 5 Tool API Contracts

### Common Types

```typescript
export type DiataxisType =
  | 'tutorial'
  | 'how-to'
  | 'reference'
  | 'explanation'
  | 'architecture'
  | 'research';

export interface ScoreVector {
  tutorial: number;     // [0, 1]
  howTo: number;        // [0, 1]
  reference: number;    // [0, 1]
  explanation: number;  // [0, 1]
  architecture: number; // [0, 1]
  research: number;     // [0, 1]
}

export interface FileEntry {
  /** File path relative to project root */
  path: string;
  /** First 40 lines of file content */
  excerpt: string;
  /** File size in bytes */
  size_bytes: number;
  /** ISO 8601 last-modified timestamp */
  last_modified: string;
}

export interface SplitEntry {
  /** Target path for the new split file */
  new_path: string;
  /** Section headings (H2/H3 titles) to include in this split */
  sections: string[];
  /** Diataxis classification for the split */
  diataxis_type: DiataxisType;
}

export interface SplitSuggestion extends SplitEntry {
  /** Human-readable rationale for this split */
  rationale: string;
}
```

---

### Tool A: `devsteps_docs_import`

**Purpose:** Scan a directory for importable documentation files. Creates (or resumes) an import
session and returns file excerpts for the classify loop.

**Input Schema (Zod):**
```typescript
const DocsImportInput = z.object({
  /** Directory or glob to scan for .md files */
  path: z.string().min(1).describe('Directory or glob to scan, e.g. "docs/" or "docs/**/*.md"'),
  /** If true: scan and return files but do not write session file */
  dry_run: z.boolean().optional().default(false),
});
```

**Output Schema:**
```typescript
interface DocsImportOutput {
  session_id: string;
  /** HMAC-SHA256 token — passed to all subsequent tools as `token` */
  token: string;
  /** Candidate files discovered */
  files: FileEntry[];
  summary: {
    total_files: number;
    total_size_bytes: number;
    scanned_path: string;
  };
  /**
   * Copilot instruction: what to do next.
   * Natural language, names exact tool + params to pass.
   */
  next_steps: string[];
}
```

**next_steps text:**
```
"Found {N} files. Call devsteps_docs_classify for EACH item in files[] — provide path, excerpt, session_id, and token. After all files are classified, call devsteps_docs_bom_status to review, then devsteps_docs_bom_commit to finalise."
```

**Error Cases:**
| Condition | Error response |
|-----------|----------------|
| `path` does not exist | `{ success: false, error: "Path not found: {path}" }` |
| No `.md` files found | `{ success: true, files: [], next_steps: ["No markdown files found at {path}. Nothing to import."] }` |
| Session already exists (not expired) | Returns existing session (idempotency — not an error) |

**Handler file:** `packages/mcp-server/src/handlers/devsteps_docs_import.ts`

---

### Tool B: `devsteps_docs_classify`

**Purpose:** Classify a single file using `heuristicClassify`. Returns score vector, winner, mixed
flag, and signals. Mixed files trigger a user-decision loop via `next_steps`.

**Input Schema (Zod):**
```typescript
const DocsClassifyInput = z.object({
  /** File path (from files[] returned by devsteps_docs_import) */
  path: z.string().min(1),
  /** First 40 lines of file content */
  excerpt: z.string(),
  /** Session identifier */
  session_id: z.string().uuid(),
  /** HMAC token from devsteps_docs_import */
  token: z.string().length(64).describe('64-char hex HMAC token from devsteps_docs_import'),
});
```

**Output Schema:**
```typescript
interface DocsClassifyOutput {
  path: string;
  /** Normalized scores per Diataxis dimension */
  scores: ScoreVector;
  /** Dimension with highest score */
  winner: DiataxisType;
  /**
   * True if second-highest score >= 0.4 × winner score.
   * Threshold signals a genuinely mixed-type document.
   */
  mixed: boolean;
  /** Human-readable reasons explaining the score */
  signals: string[];
  /**
   * Present when mixed === true.
   * Server-suggested split decompositions.
   */
  suggested_splits?: SplitSuggestion[];
  /**
   * True when the caller must present a decision to the user before proceeding.
   * True iff mixed === true.
   */
  requires_decision: boolean;
  next_steps: string[];
}
```

**MIXED Threshold Rule:**
```
mixed = true  iff  second_highest_score >= 0.4 × winner_score
```
Where `second_highest_score` is the score of the runner-up dimension.

**next_steps text — MIXED:**
```
"This file is mixed-type (winner: {winner}, runner-up: {runner_up} at {runner_up_score:.0%}). Present the user with this choice: (A) Accept as {winner} — ignore mixed signal. (B) Split into {split_count} files per suggested_splits. (C) Skip this file. (D) Mark for full rewrite. Then call devsteps_docs_classify_confirm with your decision."
```

**next_steps text — clear winner:**
```
"Classification clear: {winner} ({score:.0%}). Call devsteps_docs_classify_confirm with decision='accept' and diataxis_type='{winner}'."
```

**Error Cases:**
| Condition | Error response |
|-----------|----------------|
| Invalid token | `{ success: false, error: "Invalid or expired session token." }` |
| Session not found | `{ success: false, error: "Session not found: {session_id}" }` |
| Session expired | `{ success: false, error: "Session expired. Start a new session with devsteps_docs_import." }` |
| Path not in session's files[] | `{ success: false, error: "Path {path} was not part of this import session." }` |

**Handler file:** `packages/mcp-server/src/handlers/devsteps_docs_classify.ts`

---

### Tool C: `devsteps_docs_classify_confirm`

**Purpose:** Record the user's (or LLM's) classification decision for one file. Updates the
session state and returns the remaining work count with next-step instructions.

**Input Schema (Zod):**
```typescript
const DocsClassifyConfirmInput = z.object({
  path: z.string().min(1),
  /** User/LLM decision */
  decision: z.enum(['accept', 'split', 'skip', 'rewrite']),
  /**
   * Required when decision === 'accept'.
   * The LLM selects from the winner returned by devsteps_docs_classify.
   */
  diataxis_type: z.enum(['tutorial', 'how-to', 'reference', 'explanation', 'architecture', 'research']).optional(),
  /**
   * Required when decision === 'split'.
   * Each entry defines one output file.
   */
  splits: z.array(z.object({
    new_path: z.string().min(1),
    sections: z.array(z.string()).min(1),
    diataxis_type: z.enum(['tutorial', 'how-to', 'reference', 'explanation', 'architecture', 'research']),
  })).optional(),
  session_id: z.string().uuid(),
  token: z.string().length(64),
}).refine(
  (d) => d.decision !== 'accept' || d.diataxis_type !== undefined,
  { message: "diataxis_type is required when decision is 'accept'" }
).refine(
  (d) => d.decision !== 'split' || (d.splits !== undefined && d.splits.length > 0),
  { message: "splits[] is required when decision is 'split'" }
);
```

**Output Schema:**
```typescript
interface DocsClassifyConfirmOutput {
  path: string;
  decision: 'accept' | 'split' | 'skip' | 'rewrite';
  /** How many files still need classification */
  pending_count: number;
  /** How many files have a recorded decision (including this one) */
  classified_count: number;
  next_steps: string[];
}
```

**next_steps text — pending_count > 0:**
```
"{pending_count} file(s) remaining. Continue with devsteps_docs_classify for the next file: {next_pending_path} — use the same session_id and token."
```

**next_steps text — pending_count === 0:**
```
"All files classified. Review the session with devsteps_docs_bom_status (session_id, token), then finalise with devsteps_docs_bom_commit."
```

**Error Cases:** Same token/session validation as Tool B, plus:
| Condition | Error response |
|-----------|----------------|
| `decision === 'accept'` but no `diataxis_type` | Zod validation error |
| `decision === 'split'` but no `splits[]` | Zod validation error |
| File already confirmed in this session | Return current state (idempotent — not an error) |

**Handler file:** `packages/mcp-server/src/handlers/devsteps_docs_classify_confirm.ts`

---

### Tool D: `devsteps_docs_bom_status`

**Purpose:** Read-only progress check on an import session. Returns a human-readable summary
table. Intended to be called after all files are classified and before `bom_commit`.

**Input Schema (Zod):**
```typescript
const DocsBomStatusInput = z.object({
  session_id: z.string().uuid(),
  token: z.string().length(64),
});
```

**Output Schema:**
```typescript
interface DocsBomStatusOutput {
  session_id: string;
  status: ImportSessionStatus;
  files_total: number;
  classified: number;
  skipped: number;
  pending: number;
  /** Files flagged as mixed-type during classify */
  mixed_flagged: number;
  /**
   * Markdown table for display.
   * Columns: Path | Type | Decision | Mixed
   */
  summary_table: string;
  next_steps: string[];
}
```

**next_steps text — pending > 0:**
```
"{pending} file(s) still pending classification. Call devsteps_docs_classify for: {pending_paths.join(', ')}"
```

**next_steps text — pending === 0:**
```
"All {classified + skipped} files resolved. Call devsteps_docs_bom_commit to create DOC items and update the BOM. Pass dry_run: true to preview without writing."
```

**Handler file:** `packages/mcp-server/src/handlers/devsteps_docs_bom_status.ts`

---

### Tool E: `devsteps_docs_bom_commit`

**Purpose:** Materialise the import session: create DOC items in `.devsteps/items/docs/`, add
corresponding `DocsMapNode` entries to `docs-map.json`. Returns result summary and DOC IDs.

**Input Schema (Zod):**
```typescript
const DocsBomCommitInput = z.object({
  session_id: z.string().uuid(),
  token: z.string().length(64),
  /** If true: compute and return what would be created without writing anything */
  dry_run: z.boolean().optional().default(false),
});
```

**Output Schema:**
```typescript
interface DocsBomCommitOutput {
  items_created: number;
  bom_nodes_added: number;
  skipped: number;
  errors: Array<{ path: string; reason: string }>;
  /** DOC-NNN IDs of created items, in order */
  doc_items: string[];
  dry_run: boolean;
  next_steps: string[];
}
```

**Side Effects (when `dry_run === false`):**
1. For each `classified` entry with `decision !== 'skip'`:
   - Generate next `DOC-NNN` ID via `generateItemId('doc')`
   - Write `ItemMetadata` JSON to `.devsteps/items/docs/DOC-NNN.json`
   - Update `.devsteps/index/by-type.json` and `by-status.json`
2. For each `decision === 'split'` entry: create N DOC items (one per `SplitEntry`)
3. Append new `DocsMapNode` entries to `.devsteps/docs-map.json`
   - Use `atomicWriteJson` (read-modify-write with `.tmp` → rename pattern)
4. Update `docs-map-positions.json` shadow index
5. Set `session.status = 'committed'`
6. Write `session.status` update to session file

**Error Cases:**
| Condition | Error response |
|-----------|----------------|
| Session has pending classifications | `{ success: false, error: "Session has {N} pending files. Complete classification first." }` |
| Session already committed | `{ success: false, error: "Session already committed. Created: {doc_items.join(', ')}" }` (idempotent info) |
| docs-map.json write conflict | `errors[]` += entry; continue with remaining files |

**next_steps text — success:**
```
"Created {items_created} DOC items: {doc_items.join(', ')}. Updated docs-map.json with {bom_nodes_added} nodes. Import session complete."
```

**Handler file:** `packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts`

---

## Section 4: BOM Gap Analysis

### 4.1 Current `DocsMapNode` — What It Has

```typescript
interface DocsMapNode {
  id: string;              // ARCH-NNN
  doc_id?: string;         // DOC-NNN
  parent_id: string | null;
  order: number;
  title: string;
  description?: string;
  devsteps_items: string[];
  tsd_heading_depth_max?: number;
  default_depth?: 1 | 2 | 3 | 4;
}
```

### 4.2 Gaps Identified

The current `DocsMapNode` lacks three fields that the import workflow needs:

| Field | Type | Purpose | Gap severity |
|-------|------|---------|--------------|
| `diataxis_type` | `DiataxisType` | Drive `nav.tabs` generation; filter by type in TreeView | HIGH — without this, tab-based navigation cannot distinguish tutorial from reference |
| `source_path` | `string` | Original `.md` file path; enables re-import, diff, and staleness detection | MEDIUM — can be recovered from `doc_id` → item metadata, but redundant path on node is faster |
| `import_session_id` | `string` | Traceability: which import created this node; forensic debugging | LOW — useful but not blocking |

### 4.3 Recommendation: DOC Item Metadata, NOT BOM Node

**Recommended placement: DOC item metadata**, not `DocsMapNode`.

**Rationale:**

| Concern | BOM Node | DOC Item Metadata |
|---------|----------|-------------------|
| Schema stability | BOM nodes are architecture-level — changes require migration | Item metadata (`ItemMetadata.metadata`) is an open `Record<string, unknown>` — zero schema change |
| Navigation tabs | BOM is the query target; `diataxis_type` needed at query time | Shadow index `docs-map-positions.json` can include derived `diataxis_type` from DOC item |
| Source path | Belongs to item provenance, not doc architecture | Item has `affected_paths[]` — use this |
| Import session | Forensic data, not structural | Item description can record `Import session: {session_id}` |

**The only exception:** `diataxis_type` on `DocsMapNode` can be added as an **optional hint**
(not required, not validated) for runtime use by the VS Code extension's nav-tabs generator.
The canonical source remains the DOC item. Shadow index `docs-map-positions.json` should
include `diataxis_type?: DiataxisType` derived at index-build time.

**Proposed minimal `DocsMapNode` extension (additive, backward-compatible):**
```typescript
// Add to DocsMapNode — OPTIONAL fields only
diataxis_type?: DiataxisType;  // Navigation hint — canonical source is DOC item metadata
```

No other fields should be added to `DocsMapNode`. `source_path` and `import_session_id`
remain in DOC item metadata only.

### 4.4 `DocsMapPositionEntry` Extension

```typescript
// Add to DocsMapPositionEntry (shadow index — derived at build time)
diataxis_type?: DiataxisType;
```

This enables O(1) type queries from the VS Code extension without full BOM parse.

---

## Section 5: `heuristicClassify` Pure-Function Spec

### 5.1 Signature

```typescript
export function heuristicClassify(excerpt: string): ScoreVector
```

- **Input:** first 40 lines of file content as a single string (lines joined with `\n`)
- **Output:** `ScoreVector` with all dimensions normalized to `[0, 1]`, sum = 1.0
- **Pure function:** no file I/O, no side effects, deterministic
- **Location:** `packages/shared/src/utils/heuristic-classify.ts`

### 5.2 Scoring Rules

Scores are accumulated additively. Each matching rule adds its weight to the corresponding
dimension. After all rules are applied, all raw scores are divided by their sum to normalize.

```typescript
// Raw (un-normalized) score accumulator
const raw: Record<keyof ScoreVector, number> = {
  tutorial: 0, howTo: 0, reference: 0,
  explanation: 0, architecture: 0, research: 0,
};
```

**Rule table:**

| Rule | Pattern | Target | Weight | Notes |
|------|---------|--------|--------|-------|
| R01 | Filename contains `analyst-` or `aspect-` | `research` | +0.5 | Applied to filename passed separately via `filepath?: string` param |
| R02 | `"You will learn"` anywhere in excerpt | `tutorial` | +0.4 | Case-insensitive |
| R03 | Any heading starts with `"How to"` or `"Configure"` | `howTo` | +0.4 | Regex: `/^#{1,4}\s+(How to|Configure)/im` |
| R04 | `"ADR-\d{3}"` or `"Architecture Decision"` in excerpt | `architecture` | +0.5 | Case-insensitive |
| R05 | `"## Status:"` AND `"## Consequences:"` both present | `architecture` | +0.3 | ADR template markers |
| R06 | H1 is a question: starts with `"What is"`, `"Why does"`, `"Why is"` | `explanation` | +0.4 | Regex: `/^#\s+(What is|Why does|Why is)/im` |
| R07 | `"## Parameters"` or `"## Options"` with table below (line after heading contains `|`) | `reference` | +0.4 | Heuristic: check next non-blank line |
| R08 | Code block density > 40% | `reference` | +0.2 | `(code_block_line_count / total_lines) > 0.4` |
| R09 | Numbered list in first 20 lines | `tutorial` | +0.2 | Regex: `/^\d+\.\s/m` within lines 1–20 |

### 5.3 Normalization

```typescript
const total = Object.values(raw).reduce((sum, v) => sum + v, 0);

if (total === 0) {
  // No signals found — default to explanation (50%) + reference (50%)
  return { tutorial: 0, howTo: 0, reference: 0.5, explanation: 0.5, architecture: 0, research: 0 };
}

const normalized: ScoreVector = {
  tutorial:     raw.tutorial     / total,
  howTo:        raw.howTo        / total,
  reference:    raw.reference    / total,
  explanation:  raw.explanation  / total,
  architecture: raw.architecture / total,
  research:     raw.research     / total,
};
```

### 5.4 MIXED Detection (applied by caller `devsteps_docs_classify` handler)

```typescript
const entries = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
const winner = entries[0][0] as DiataxisType;
const winnerScore = entries[0][1];
const runnerUpScore = entries[1][1];

const mixed = runnerUpScore >= 0.4 * winnerScore;
```

### 5.5 Signals Generation

```typescript
const signals: string[] = [];
if (raw.tutorial > 0) signals.push(`tutorial: +${raw.tutorial.toFixed(2)} (patterns: ${matched_tutorial_rules.join(', ')})`);
// ... same for each dimension with raw > 0
```

**Signals are human-readable diagnostics**, not machine-processable. Format:
`"{dimension}: +{raw_score} (rules: R02, R09)"`

### 5.6 `filepath` Optional Parameter

To enable R01 (filename-based signals), the function accepts an optional filepath:

```typescript
export function heuristicClassify(excerpt: string, filepath?: string): ScoreVector
```

R01 is applied against `path.basename(filepath ?? '')`.

---

## Section 6: `devsteps_docs_new` — Creation-Time Enforcement

### 6.1 Purpose

Ensure every new documentation item is created with a Diataxis classification. Instead of
making `diataxis_type` a hard required parameter (which breaks prompt ergonomics), the tool
returns a guided decision when the type is absent — teaching the user/LLM the taxonomy in context.

### 6.2 Input Schema (Zod)

```typescript
const DocsNewInput = z.object({
  /** Document title */
  title: z.string().min(1).max(200),
  /**
   * Optional at call time — if absent, triggers guided type selection via next_steps.
   * Required for actual creation.
   */
  diataxis_type: z.enum(['tutorial', 'how-to', 'reference', 'explanation', 'architecture', 'research']).optional(),
  /** Optional: parent ARCH-NNN node to attach the new doc under */
  parent_bom_id: z.string().regex(/^ARCH-\d{3,}$/).optional(),
});
```

### 6.3 Logic Flow

```
IF diataxis_type is missing:
  → return { needs_type: true, next_steps: [guided question] }  (no item created)
  
ELSE:
  → create DOC item
  → create stub .md file with correct Diataxis template
  → optionally add to docs-map.json under parent_bom_id
  → return { success: true, item_id: "DOC-NNN", path: "docs/{slug}.md" }
```

### 6.4 Output Schema — Missing Type

```typescript
interface DocsNewMissingTypeOutput {
  needs_type: true;
  title: string;
  next_steps: string[];
}
```

**next_steps text when `diataxis_type` is missing:**
```
"diataxis_type is required. Answer: Is the user LEARNING a new skill? → tutorial. APPLYING skill toward a specific goal? → how-to. LOOKING UP facts/API? → reference. UNDERSTANDING context or concepts? → explanation. Documenting an architecture decision (ADR)? → architecture. Recording AI-generated research? → research. Then call devsteps_docs_new again with the same title and your answer as diataxis_type."
```

### 6.5 Output Schema — Type Provided

```typescript
interface DocsNewSuccessOutput {
  success: true;
  item_id: string;           // DOC-NNN
  path: string;              // relative path to created .md stub
  diataxis_type: DiataxisType;
  bom_node_id?: string;      // ARCH-NNN if added to BOM
  next_steps: string[];
}
```

**next_steps text on success:**
```
"Created DOC item {item_id} at {path} (type: {diataxis_type}). Open the file and fill in the content following the {diataxis_type} template structure."
```

### 6.6 Stub Template Frontmatter

Each Diataxis type gets its own frontmatter template:

```markdown
---
# For tutorial:
diataxis: tutorial
title: "{title}"
---
# {title}

## Overview
<!-- One sentence: what skill will the reader have after completing this? -->

## Prerequisites
<!-- What must the reader already know or have set up? -->

## Steps
<!-- Numbered steps. Each step = one action. -->
```

Similar templates for `how-to`, `reference`, `explanation`, `architecture` (ADR format), and
`research` (SPIKE format with Sources section).

### 6.7 Handler File

`packages/mcp-server/src/handlers/devsteps_docs_new.ts`

---

## Section 7: Implementation Work Items

The following items are planned for implementation. They are described here for planning purposes
and are NOT yet created in the DevSteps backlog.

---

### STORY-238: Server-Directed Docs Import Workflow

**Type:** story  
**Description:** Implement the full 5-tool server-directed docs import dialog as designed in
SPIKE-044. Includes session management, token enforcement, heuristic classification, and BOM
commit. Implements the architecture specified in SPIKE-044-MCPDialog-Research-Brief.md.

**Acceptance criteria:**
- All 5 tools (`devsteps_docs_import`, `devsteps_docs_classify`, `devsteps_docs_classify_confirm`,
  `devsteps_docs_bom_status`, `devsteps_docs_bom_commit`) registered and functional
- `heuristicClassify` pure function with unit tests covering all 9 rules
- Token enforcement: calling classify without a valid token returns a hard error
- Session idempotency: re-calling import with same path returns existing session
- `devsteps_docs_new` creation-time enforcement with guided type selection

---

### TASK-404: Implement `heuristicClassify` pure function

**Parent:** STORY-238  
**Package:** `packages/shared/src/utils/heuristic-classify.ts`  
**Description:** Implement pure function per Section 5 spec. 9 scoring rules, normalization,
MIXED threshold logic. Unit tests for each rule in isolation and two integration scenarios
(mixed ADR+tutorial, clear reference).

---

### TASK-405: Implement import session file management

**Parent:** STORY-238  
**Package:** `packages/shared/src/utils/import-session.ts`  
**Description:** Session create/read/update utilities. HMAC token generation and validation
(`generateSessionToken`, `validateSessionToken`). Idempotency check. Expiry check. Uses
`atomicWriteJson` pattern from existing codebase.

---

### TASK-406: Implement `devsteps_docs_import` handler

**Parent:** STORY-238  
**Package:** `packages/mcp-server/src/handlers/devsteps_docs_import.ts`  
**Description:** Directory scan (node:fs `glob` or `readdir` recursive), session creation,
`FileEntry[]` assembly including excerpt extraction (first 40 lines). Register tool in
`tools/docs.ts` and `server.ts`. Input/output per Section 3 Tool A.

---

### TASK-407: Implement `devsteps_docs_classify` handler

**Parent:** STORY-238  
**Package:** `packages/mcp-server/src/handlers/devsteps_docs_classify.ts`  
**Description:** Token validation, invoke `heuristicClassify`, MIXED detection, `suggested_splits`
generation (simple heuristic: suggest split at H2 boundaries where type changes). Session update.
`next_steps` text per Section 3 Tool B.

---

### TASK-408: Implement `devsteps_docs_classify_confirm` handler

**Parent:** STORY-238  
**Package:** `packages/mcp-server/src/handlers/devsteps_docs_classify_confirm.ts`  
**Description:** Token validation, record `ClassifiedEntry` in session, update `pending[]`. Zod
refinements for accept/split validation. Idempotent re-confirm. `next_steps` with next pending
file path.

---

### TASK-409: Implement `devsteps_docs_bom_status` and `devsteps_docs_bom_commit` handlers

**Parent:** STORY-238  
**Package:** `packages/mcp-server/src/handlers/devsteps_docs_bom_status.ts` and
`devsteps_docs_bom_commit.ts`  
**Description:** Status: read session, build markdown summary table. Commit: generate DOC-NNN IDs,
write `ItemMetadata` JSON files using `generateItemId('doc')`, use `atomicWriteJson` to update
`docs-map.json` + shadow index, set session status `committed`. Pending-guard: reject commit
if `pending.length > 0`.

---

### TASK-410: Implement `devsteps_docs_new` handler

**Parent:** STORY-238  
**Package:** `packages/mcp-server/src/handlers/devsteps_docs_new.ts`  
**Description:** Guided type selection flow (missing type → return `next_steps` without creating).
When type present: create DOC item + write stub `.md` with Diataxis template frontmatter.
Optionally attach `DocsMapNode` under `parent_bom_id`. Register in `tools/docs.ts`.

---

## Section 8: Citations

| Reference | Source | Date | Confidence |
|-----------|--------|------|------------|
| `next_steps` array pattern in production MCP | [github.com/fastly/mcp](https://github.com/fastly/mcp) v0.1.11 | Apr 2, 2026 | 0.87 |
| Token-based tool ordering enforcement | [AWS DevOps Blog: Building MCP servers with controlled tool orchestration](https://aws.amazon.com/blogs/devops/flexibility-to-framework-building-mcp-servers-with-controlled-tool-orchestration/) | Aug 13, 2025 | 0.91 |
| MCP tool response format (`{ content: [{ type: 'text', text: ... }] }`) | [modelcontextprotocol.io/specification/2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) | 2025 | 1.0 |
| `DocsMapDocument` / `DocsMapNode` structure (BOM) | `packages/shared/src/types/docs-map.ts` (SPIKE-036, ADR-007) | Internal | 0.92 |
| `devsteps-sprint-review` prompt proving text-instruction sequencing | `packages/mcp-server/src/handlers/prompts.ts` | Internal | 0.92 |
| `next_steps` reliability (moderate, not guaranteed) | analyst-web finding, SPIKE-044-session1 | 2026-04-03 | 0.87 |
| File-backed session pattern (idiomatic for DevSteps) | analyst-internal finding, SPIKE-044-session1 | 2026-04-03 | 0.92 |
| Planner Tool pattern reliability benchmarks (85–92%) | [zeo.org/resources/blog/mcp-server-architecture-state-management-security-tool-orchestration](https://zeo.org/resources/blog/mcp-server-architecture-state-management-security-tool-orchestration) | Aug 29, 2025 | 0.80 |
| Stateful MCP via Durable Objects | [blog.cloudflare.com/remote-model-context-protocol-servers-mcp/](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/) | Mar 25, 2025 | 0.85 |

---

## Appendix A: Tool Registration Pattern

New tools are registered following the existing pattern in `packages/mcp-server/src/`:

**1. Define tool in `tools/docs.ts` (new file):**
```typescript
export const DOC_TOOLS: Tool[] = [
  {
    name: 'devsteps_docs_import',
    description: 'Scan a directory for importable markdown documentation files. Creates an import session and returns file excerpts for classification. Call devsteps_docs_classify for each returned file.',
    inputSchema: zodToJsonSchema(DocsImportInput),
  },
  // ... remaining 4 tools
];
```

**2. Register in `server.ts` `setupTools()`:**
```typescript
import { DOC_TOOLS } from './tools/docs.js';
// ...
this.tools = new Map([
  ...existingTools,
  ...DOC_TOOLS.map(t => [t.name, t]),
]);
```

**3. Handler files are auto-dispatched** via the existing dynamic import pattern in `server.ts`:
```typescript
const handler = await import(`./handlers/${toolName}.js`);
```
No changes needed to the dispatch mechanism — just add handler files.

---

## Appendix B: Security Considerations

1. **Token scope**: HMAC tokens are scoped to one session (session_id + created_at). A token from
   session A cannot be used with session B.
2. **No cross-user risk**: DevSteps MCP server runs locally (stdio or local HTTP). No multi-user
   session isolation needed.
3. **Secret rotation**: `DEVSTEPS_IMPORT_SECRET` change invalidates all existing sessions — this
   is acceptable (sessions are short-lived, 1h TTL).
4. **Path traversal**: `devsteps_docs_import` must validate that `path` resolves within the
   workspace root (compare resolved path to `getWorkspacePath()`). Reject paths that escape.
5. **Excerpt content**: `excerpt` is first 40 lines of user's own files — no sanitization needed
   for local use. Do not eval or execute excerpt content.

---

*Brief complete. Ready for gate-reviewer.*
