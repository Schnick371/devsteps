# SPIKE-043 — Diataxis Import & Copilot Context Delivery
## Exec Planner Research Brief (Ring 3)

**Planner:** devsteps-R3-exec-planner  
**Sprint ID:** SPIKE-043-session1  
**Triage tier:** FULL  
**Sources consumed:**
- `tmp/analyst-research-SPIKE-043-session1.md` (confidence 0.92)
- `tmp/analyst-internal-SPIKE-043-session1.md` (codebase evidence)
- `.devsteps/analysis/SPIKE-043/constraints-report.json` (confidence 0.93) → verdict: PROCEED-WITH-CAUTION
- `.devsteps/analysis/SPIKE-043/impact-report.json` (confidence 0.91) → verdict: PROCEED-WITH-CAUTION

---

## 1 — Diataxis Framework Overview

### Compass Table (4 Standard Types + 2 DevSteps Extensions)

Diataxis defines documentation on two axes: **what-the-user-is-doing** (action vs cognition) and **where-they-are-in-their-learning** (acquisition vs application of skill).

| | Action (practical) | Cognition (theoretical) |
|---|---|---|
| **Acquisition of skill (study)** | **Tutorial** — hands-on learning, instructor-led, numbered steps | **Explanation** — background, context, "why", conditional tense |
| **Application of skill (work)** | **How-to guide** — goal-oriented, imperative title, problem → solution | **Reference** — facts, API specs, tables, machine-authoritative |

The operative classification question: *"Is this content oriented toward action or cognition, and is the user acquiring or applying skill?"*

### Per-Type Authoring Rules

| Type | SHOULD | SHOULD NOT | Classification Signal |
|---|---|---|---|
| **tutorial** | Start with numbered steps; include Prerequisites section; end with "What you learned" | Explain background theory mid-steps; reference API specs | Heading: "Getting started", "Build your first", numbered intro sequence; "You will learn" |
| **how-to** | Imperative verb title ("Configure X", "Set up Y"); assume user has context; goal-first | Teach concepts before steps; add explanatory detours | Heading starts with "How to"; pure imperative tone; no "you will learn" |
| **reference** | Scannable tables, parameter lists; consistent structure per entry; machine-authoritative | Include numbered procedural steps; editorialize | High code-block ratio; options/parameters/flags tables; no narrative |
| **explanation** | Answer "why" and "what does it mean"; use conditional tense; contextual background | Give step-by-step instructions; list parameters | Heading: "Understanding", "Overview", "Why", "Concepts"; conditional phrasing |

### DevSteps Extended Types (beyond Diataxis 2×2)

These two types do not fit the standard 2×2 axes and are DevSteps-specific extensions (established in SPIKE-040).

| Type | SHOULD | SHOULD NOT | Classification Signal |
|---|---|---|---|
| **architecture** | Document decisions with rationale; include ADR context (date, status, alternatives, consequences) | Mix procedural how-to steps into decision records | ADR-NNN filename; `docs/architecture/` path; "Decision", "Consequences", "Status" sections |
| **research** | Summarize findings with source citations; state confidence level; distinguish AI-generated from human-synthesized | Present as authoritative spec; omit limitations or confidence | `analyst-*`, `aspect-*`, `analysis-*`, `*-session*.md` filenames; `generated: true`; "Agent:", "Confidence:", "Mandate:" in first 5 lines |

**Key cross-type invariant (from Procida):** "Crossing or blurring the boundaries described in the map is at the heart of a vast number of problems in documentation." Mixed-type files must be flagged by the import scanner, not silently misclassified.
> Source: https://diataxis.fr (Daniele Procida, Canonical Engineering Director)

---

## Prerequisites State

| Item | Status | Required For |
|---|---|---|
| **STORY-219** — DOC type in schema default | **done** ✅ | Steps 4, 7, 12 |
| **TASK-391** — items/docs/ migration + ensureFullMigration phase 4 | **done** ✅ | Steps 3, 12 — integration tests can now proceed |
| **STORY-234** — DOC creation tooling w/ Zod validation | **draft** ⚠️ | Step 12 DOC item creation path |
| **TASK-395** — DOC item governance in usage instructions | **draft** | Informs Step 12 metadata conventions |

> TASK-391 was completed and committed on 2026-04-03 (commit `feat(doc-type): TASK-391/392/393/394`). `items/docs/` directory creation, `docs.json` counter, and migration idempotency are all in place. Integration tests for `devsteps docs import` can now proceed without blockers.

---

## Constraint Decisions (Locked Before Implementation)

These design questions are answered here. Workers MUST NOT re-open them.

### C1 — LLM fallback contract
- Heuristic scan is the **unconditional default** (no flags needed, no API key required)
- `--llm-classify` is an **additive opt-in** layer; if API key absent → clear error message, never hang
- v1 ships **without** `--llm-classify` LLM SDK; flag placeholder exists but is deferred to avoid bundle size regression
- Rationale: Impact report confirms LLM SDK would add 200–400KB to CLI bundle

### C2 — CI / non-interactive guard
- `devsteps docs import` defaults to **non-interactive** dry-run display followed by `--yes` auto-confirm
- `--interactive` (or `--no-yes`) opt-in activates per-item confirmation
- `devsteps init --import-docs ./docs` passes `--yes` implicitly (no TTY prompt)
- Rationale: Constraints report confirms blocking `Proceed? (y/n)` in pipes/CI is unacceptable

### C3 — Path traversal security
- Scanner MUST call `node:path.resolve(inputPath)` then assert result starts with `process.cwd()`
- Use `lstatSync` + skip symlinks (not `readdirSync` default)
- Gate applied BEFORE any file read

### C4 — `prompts.ts` count assertion risk
- Grep ran: **zero** test files assert `DEVSTEPS_PROMPTS.length === 3` — safe to add entries

---

## Output 1 — `.github/instructions/devsteps-diataxis.instructions.md`

### File target
`.github/instructions/devsteps-diataxis.instructions.md`

### Atomic steps

**Step 1 — Draft instructions file content **
_Risk tier: QUICK_

File does not yet exist. Content contract (from constraints analysis, ≤150 lines target 80-100):
> Source for ≤150 line constraint: https://code.visualstudio.com/blogs/2025/03/26/custom-instructions (VS Code custom instructions guide, Mar 2025)

```yaml
---
applyTo: "docs/**/*.md,.devsteps/docs/**"
description: "Diataxis documentation type classification rules — compass, per-type authoring constraints, and split detection signals"
---
```

Content sections (line budget allocations):
- Frontmatter: 4 lines
- `## Diataxis Compass` — 4-quadrant markdown table: 10 lines
- `## Authoring Rules by Type` — 4 types × 3 bullets each (SHOULD / SHOULD NOT / SIGNAL): ~28 lines
- `## DevSteps Extended Types` — `architecture` + `research` rules, 3 bullets each: ~14 lines
- `## Split Detection Signals` — 2-3 bullets flagging mixed-type content: 6 lines
- `## `diataxis_type` Metadata` — usage field in DOC item `metadata.diataxis_type`: 8 lines
- `## Forbidden Patterns` — 4 bullets (most common cross-type violations): 8 lines
- Section headers + spacing: ~10 lines
- **Total estimate: ~88 lines** (safely under 150-line hard limit)

**CRITICAL rules per Copilot Files Standards:**
- NO examples (code or prose) within the instructions file
- Bullet-rule format only (no paragraph prose)
- `devsteps-documentation.instructions.md` is orthogonal — no semantic conflict; do NOT duplicate structural/formatting rules from it

**Per-type authoring rules content spec:**

| Type | SHOULD | SHOULD NOT | SIGNAL |
|---|---|---|---|
| **tutorial** | Start with numbered steps; include Prerequisites section; end with "What you learned" | Explain background theory mid-steps; reference API specs | Heading contains "Getting started", "Build your first", numbered intro sequence |
| **how-to** | Imperative verb title ("Configure X", "Set up Y"); assume user has context; goal-first | Teach concepts before steps; add explanatory detours | Heading starts with "How to"; pure imperative tone; no "you will learn" |
| **reference** | Scannable tables, parameter lists; consistent structure per entry; machine-authoritative | Include numbered procedural steps; editorialize | High code-block ratio; options/parameters/flags tables; no narrative |
| **explanation** | Answer "why" and "what does it mean"; use conditional tense; contextual background | Give step-by-step instructions; list parameters | Heading contains "Understanding", "Overview", "Why", "Concepts"; conditional phrasing |

**DevSteps Extended types:**

| Type | SHOULD | SHOULD NOT | SIGNAL |
|---|---|---|---|
| **architecture** | Document decisions with rationale; include ADR context (date, status, consequences); state alternatives considered | Mix procedural how-to steps into decision records | ADR-NNN filename pattern; `docs/architecture/` path; "Decision", "Consequences" sections |
| **research** | Summarize findings with source citations; state confidence level; distinguish AI-generated from human-synthesized | Present as authoritative spec; omit limitations | `analyst-*`, `aspect-*`, `*-session*.md` filenames; `generated: true` metadata; "Agent:", "Confidence:", "Mandate:" in headers |

**Split detection signals (2-3 bullets):**
- Score ≥0.5 on two different types → flag as "mixed" in dry-run display; do NOT auto-split
- Words "you will learn" appear in an otherwise procedural file → tutorial/how-to blend
- API parameter tables embedded in a numbered-steps file → reference/tutorial blend

**`diataxis_type` metadata field:**
- Set `metadata.diataxis_type` to one of: `tutorial` | `how-to` | `reference` | `explanation` | `architecture` | `research`
- Set `metadata.generated: true` for AI-produced output files
- `devsteps docs import` auto-populates from heuristic scan; override via `--type` flag

**Dependencies:** None (new file, no code changes)  
**Test:** Manual line-count check ≤150; verify `applyTo` glob fires for `docs/` edits in VS Code

---

## Output 2 — MCP Prompts (`packages/mcp-server/src/handlers/prompts.ts`)

### File target
`packages/mcp-server/src/handlers/prompts.ts` — append to `DEVSTEPS_PROMPTS[]` (currently 3 entries, lines 27–63) + extend `switch` in `getPromptHandler` (currently lines 83+)

### Atomic steps

**Step 2 — Add 4 Diataxis prompt entries to `DEVSTEPS_PROMPTS[]`**
_Risk tier: STANDARD_

Insert after the `devsteps-commit-message` entry (after line 63, before closing `]`):

```ts
{
  name: 'devsteps-docs-diataxis-explain',
  title: 'DevSteps: Explain Diataxis Documentation Types',
  description:
    'Explains the Diataxis framework (tutorial/how-to/reference/explanation) with a ' +
    'decision tree to determine the correct type for a documentation task.',
  arguments: [
    {
      name: 'doc_topic',
      description: 'The topic or title of the documentation you are writing (optional)',
      required: false,
    },
  ],
},
{
  name: 'devsteps-docs-write-howto',
  title: 'DevSteps: Write a How-To Guide',
  description:
    'Returns a structured how-to guide template with title pattern, Prerequisites, ' +
    'numbered Steps, and Verification sections.',
  arguments: [
    {
      name: 'topic',
      description: 'The goal the user wants to achieve ("Configure X", "Set up Y")',
      required: true,
    },
  ],
},
{
  name: 'devsteps-docs-write-reference',
  title: 'DevSteps: Write a Reference Page',
  description:
    'Returns a structured reference page template: overview table, parameters/options ' +
    'table, return values, and error codes — scannable, not narrative.',
  arguments: [
    {
      name: 'subject',
      description: 'The command, API, or feature being documented',
      required: true,
    },
  ],
},
{
  name: 'devsteps-docs-classify',
  title: 'DevSteps: Classify a Documentation Excerpt',
  description:
    'Classifies a pasted doc excerpt as tutorial/how-to/reference/explanation/architecture/research ' +
    'and explains the strongest classification signal.',
  arguments: [
    {
      name: 'excerpt',
      description: 'Paste the first 10–20 lines of the document to classify',
      required: true,
    },
  ],
},
```

**Step 3 — Add 4 `case` branches in `getPromptHandler` switch**
_Risk tier: STANDARD_ | _Depends on Step 2_

Each case returns static string content (no live context call needed — unlike `devsteps-onboard`). The prompt body should express the Diataxis rules as a structured message asking Copilot to produce/classify content.

`case 'devsteps-docs-diataxis-explain'` — return decision tree:
```
You are using the Diataxis framework. Given [doc_topic], determine the documentation type:
  → Is the user DOING something or STUDYING?
    → DOING + learning a new skill = Tutorial (numbered steps, "you will learn")
    → DOING + applying existing skill = How-to (imperative title, goal-focused)
    → STUDYING + applying skill = Reference (scannable tables, no steps)
    → STUDYING + acquiring context = Explanation ("why" and "what does it mean")
  → Does it involve architectural decisions? → Architecture
  → Is it AI-generated investigation synthesis? → Research
Set metadata.diataxis_type accordingly when creating a DOC item.
```

`case 'devsteps-docs-write-howto'` — return minimal template structure:
```
# [topic]

## Prerequisites
- [requirement 1]

## Steps
1. [first action]
2. [next action]

## Verify
[how to confirm success]
```

`case 'devsteps-docs-write-reference'` — return table-first template:
```
# [subject] Reference

[One-line purpose statement]

## Options / Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| ... | ... | ... | ... |

## Return Value
...

## Error Codes
...
```

`case 'devsteps-docs-classify'` — instruct Copilot to classify:
```
Classify the following documentation excerpt using the Diataxis framework.
Respond with: type, strongest signal, confidence (0-1), and whether it mixes types.
Excerpt: [excerpt]
```

**Dependencies:** Step 2 must be committed first  
**Test:** `npm test` in `packages/mcp-server` — no prompt count assertions exist (verified by grep); smoke test: MCP client lists 7 prompts after change

---

## Output 3 — `devsteps docs import` CLI Command

### Files affected
| File | Change |
|---|---|
| `packages/cli/src/index.ts` | Add `program.command('docs')` subcommand registration (~5 lines, after line 260) |
| `packages/cli/src/commands/docs.ts` | **New file** — full import command handler |
| `packages/cli/src/commands/init.ts` | Add `--import-docs <path>` option (triggers docs import after init) |

### Atomic steps

**Step 4 — Register `docs` subcommand in `packages/cli/src/index.ts`**
_Risk tier: QUICK_ | _Lines: ~265–275 (after last `program.command()` block)_

```ts
// Docs management commands
const docsCmd = program.command('docs').description('Manage documentation items');
docsCmd.command('import')
  .description('Scan and import markdown files as DOC items')
  .argument('<path>', 'Path to a markdown file or directory to scan')
  .option('--dry-run', 'Show classification results without creating items')
  .option('--yes', 'Skip confirmation prompt (non-interactive / CI mode)')
  .option('--heuristic-only', 'Use filename/path heuristics only (default; no LLM)')
  .action(async (scanPath, options) => {
    const { docsImportCommand } = await import('./commands/docs.js');
    await docsImportCommand(scanPath, options);
  });
```

**Step 5 — Create `packages/cli/src/commands/docs.ts` — path guard + Phase 1 heuristic scan**
_Risk tier: FULL_ | _New file_

Structure (follow `context.ts` / `migrate.ts` pattern):

```
packages/cli/src/commands/docs.ts
├── docsImportCommand(scanPath, options)   → orchestrator
├── resolveScanPath(rawPath): string       → security: path.resolve + prefix assert
├── scanMarkdownFiles(absDir): FileEntry[] → Node 22 fs.readdir({ recursive: true })
├── heuristicClassify(entry): Classification  → pattern matching
└── displayDryRunTable(entries, chalk, ora) → tabular output
```

**`resolveScanPath` — security guard (CRITICAL, implement first):**
```ts
import { resolve } from 'node:path';

function resolveScanPath(raw: string): string {
  const abs = resolve(raw);
  if (!abs.startsWith(process.cwd())) {
    throw new Error(`Path '${raw}' is outside the workspace root. Import aborted.`);
  }
  return abs;
}
```

**`scanMarkdownFiles` — using Node 22 with symlink skip:**
```ts
import { readdirSync, lstatSync } from 'node:fs';

function scanMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter((p): p is string => typeof p === 'string')
    .filter(p => p.endsWith('.md'))
    .map(p => resolve(dir, p))
    .filter(abs => {
      const s = lstatSync(abs);
      return s.isFile(); // skips symlinks (lstat does not follow)
    });
}
```

**`heuristicClassify` — decision table (from research + internal reports):**
> Source for heuristic patterns: https://mintlify.com/guides/content-types (Mintlify Diataxis-based content guide) + https://diataxis.fr

| Pattern | `diataxis_type` | Source |
|---|---|---|
| Filename: `analyst-*`, `aspect-*`, `analysis-*`, `*-session*.md` | `research` | Research Q6 |
| Path contains `docs/research/` or `tmp/` | `research` | Research Q6 |
| Heading: "How to", "Setting up", "Configuring" | `how-to` | Research Q3 |
| Heading: "Understanding", "Overview", "Why", "Concepts" | `explanation` | Research Q3 |
| Heading: "Reference", "API", "Options", "Parameters" | `reference` | Research Q3 |
| Path contains `docs/architecture/` OR filename: `adr-*` | `architecture` | Internal §6 |
| Contains "You will learn" / "By the end of this" | `tutorial` | Research Q3 |
| High code-block ratio + numbered steps | `tutorial` OR `how-to` | Research Q3 |
| Fallback | `explanation` (lowest false-positive risk) | Planner decision |

Confidence scoring:
- Pattern match on filename + heading: 0.85–0.97 (auto-accept)
- Pattern match on heading only: 0.75–0.84 (flag for review)
- Fallback match: 0.50 (flag as low-confidence)

**Step 6 — Phase 3 dry-run display in `docs.ts`**
_Risk tier: STANDARD_ | _Depends on Step 5_

Output format (using `chalk` + `ora` — already in CLI deps, no new packages):
```
Scanned 52 files in docs/
  ✓ arch  (0.97)  docs/architecture/adr-007-docs-map-format.md
  ✓ ref   (0.91)  docs/cli-reference.md
  ✓ how   (0.89)  docs/how-to-add-mcp-tool.md
  ⚠ ???   (0.71)  README.md   [mixed: explanation + tutorial signals]
  ⚠ tut   (0.78)  INSTALL.md  [low confidence]
  ○ skip  (0.00)  node_modules/...  [excluded]

52 files found. 48 will be created as DOC items. 4 flagged for review.
Proceed? [Y/n]  ← skipped with --yes flag
```

Cap display at 50 items (matching constraints report recommendation); show "… and N more" for overflow.

**Step 7 — Phase 4 DOC item creation in `docs.ts`**
_Risk tier: STANDARD_ | _Depends on Step 5, Step 6; REQUIRES TASK-391 done for integration tests_

```ts
import { addItem } from '@schnick371/devsteps-shared';

for (const entry of confirmedEntries) {
  await addItem(devstepsDir, {
    type: 'doc',
    title: entry.h1Heading ?? entry.filename,
    status: 'draft',
    metadata: {
      doc_path: path.relative(process.cwd(), entry.absPath),
      diataxis_type: entry.classification.type,
      keywords: entry.extractedKeywords,
      generated: entry.classification.generated ?? false,
    },
  });
}
```

Use `ora` spinner during creation phase. Show final summary: "Created N DOC items (DOC-001 → DOC-052)."

**Step 8 — `devsteps init --import-docs` flag in `init.ts`**
_Risk tier: STANDARD_ | _Depends on Step 7_ | _File: `packages/cli/src/commands/init.ts`_

After successful `devsteps init` completes, if `--import-docs <path>` was passed:
```ts
if (options.importDocs) {
  await docsImportCommand(options.importDocs, { yes: true, heuristicOnly: true });
}
```
Pass `yes: true` to suppress all confirmation prompts in the init flow.

Register option in `index.ts` on the `init` command (not `docs`):
```ts
.option('--import-docs <path>', 'After init, scan and import docs from this path as DOC items')
```

**Dependencies per step:**
- Step 4 requires: clean build baseline in `packages/cli`
- Step 5 requires: Step 4
- Step 6 requires: Step 5
- Step 7 requires: Step 6 + TASK-391 done (for `addItem` to find `items/docs/` dir)
- Step 8 requires: Step 7

**Test requirements:**
- Step 5: unit test `resolveScanPath` with `../../etc` traversal attempt → assert throws
- Step 5: unit test `scanMarkdownFiles` against a tmp fixture dir
- Step 6: unit test `heuristicClassify` with representative filenames (9 pattern cases)
- Step 7: integration test — `devsteps docs import ./tests/fixtures/docs --yes` → assert DOC items created, check `items/docs/DOC-001.json` exists and `metadata.diataxis_type` is set

---

## Output 4 — `items/docs/` Migration in `ensureFullMigration`

### File target
`packages/shared/src/core/auto-migrate.ts`

### Atomic step

**Step 3 — Add `items/docs/` dir creation as phase 4 of `ensureFullMigration`**
_Risk tier: QUICK_ | _Can be done independently of Steps 1–2_

Location: `ensureFullMigration` function body, after the 3 existing phases.

```ts
// Phase 4: ensure items/docs/ directory exists (idempotent)
const docsItemsDir = path.join(devstepsDir, 'items', 'docs');
mkdirSync(docsItemsDir, { recursive: true });
if (!options?.silent) {
  log('  ✓ items/docs/ directory ensured');
}
```

This is idempotent (`{ recursive: true }` is a no-op if exists). Fires on every project startup after upgrade. Safe for pre-SPIKE-043 projects with zero DOC items.

**ALSO:** check if `index/by-type/docs.json` exists; if not, create empty `[]` file — this prevents "file not found" at first `addItem('doc', ...)` call before any DOC item exists.

```ts
const docsIndexFile = path.join(devstepsDir, 'index', 'by-type', 'docs.json');
if (!existsSync(docsIndexFile)) {
  writeFileSync(docsIndexFile, '[]', 'utf-8');
}
```

**Note:** This partially overlaps with TASK-391. Coordinate: TASK-391 covers `counters.json` migration (DOC: 0 counter initialization). This step covers the directory and index file. Both are needed; neither replaces the other.

**Test:** unit test `ensureFullMigration` on a project without `items/docs/` → assert dir created; assert `by-type/docs.json` exists.

---

## Output 5 — Proposed Work Items

STORY-219 is `done`. TASK-391 is draft. New items needed:

### Must-create items (proposed IDs — assign sequentially after current max TASK-395)

**Priority ordering (highest risk first — per Risk matrix C3 ordering rule):**

| Proposed ID | Type | Title | Priority | Depends | Risk |
|---|---|---|---|---|---|
| **STORY-236** | story | `devsteps docs import` CLI command — heuristic scan + dry-run + DOC creation | urgent-important | TASK-391, STORY-234 | HIGH |
| **STORY-237** | story | Diataxis Copilot context delivery — instructions file + 4 MCP prompts | not-urgent-important | none | LOW |
| **TASK-396** | task | `ensureFullMigration` phase 4 — create `items/docs/` dir + empty `by-type/docs.json` on upgrade | urgent-important | TASK-391 | MEDIUM |
| **TASK-397** | task | `packages/cli/src/commands/docs.ts` — path guard + heuristic classifier + dry-run display | urgent-important | STORY-236, TASK-396 | HIGH |
| **TASK-398** | task | `packages/cli/src/index.ts` — register `docs` subcommand + `init --import-docs` flag | not-urgent-important | TASK-397 | LOW |
| **TASK-399** | task | Unit tests for docs import: path traversal guard, heuristic classify (9 patterns), integration test with fixture | urgent-important | TASK-397 | MEDIUM |
| **TASK-400** | task | Diataxis instructions file — `.github/instructions/devsteps-diataxis.instructions.md` (≤100 lines) | not-urgent-important | none | LOW |
| **TASK-401** | task | 4 Diataxis MCP prompts — add to `DEVSTEPS_PROMPTS[]` + `getPromptHandler` switch cases in `prompts.ts` | not-urgent-important | TASK-400 | LOW |

**Implementation order (respects Risk matrix — higher risk earlier, lower-risk in parallel where possible):**

```
1. TASK-396        (phase 4 migration — prerequisite for integration tests)
2. TASK-397        (path guard + heuristic core — highest risk, implement first)
3. TASK-399        (tests alongside impl — TDD cycle)
4. TASK-398        (command registration — additive, low risk)
5. TASK-400 ∥ TASK-401  (instructions file + MCP prompts — parallel, independent)
```

STORY-236 implements TASK-396 → TASK-397 → TASK-398 → TASK-399.  
STORY-237 implements TASK-400 → TASK-401.

### Link structure

```
SPIKE-043 → implemented-by → STORY-236
SPIKE-043 → implemented-by → STORY-237
STORY-236 → depends-on → TASK-391
STORY-236 → depends-on → STORY-234
STORY-236 → implemented-by → TASK-396, TASK-397, TASK-398, TASK-399
STORY-237 → implemented-by → TASK-400, TASK-401
TASK-397 → depends-on → TASK-396
TASK-398 → depends-on → TASK-397
TASK-399 → depends-on → TASK-397
TASK-401 → depends-on → TASK-400  (authoring rules should be stable before MCP text)
```

---

## Ordered Implementation Plan (Full)

All steps ordered by risk (highest-impact first), dependencies respected.

| # | Step | Output | File(s) | Risk | Pre-located lines |
|---|---|---|---|---|---|
| 1 | `ensureFullMigration` phase 4 | Output 4 | `packages/shared/src/core/auto-migrate.ts` | QUICK | Read `ensureFullMigration` body for insertion point |
| 2 | Unit test for phase 4 | Test | `packages/shared/src/core/auto-migrate.test.ts` | QUICK | |
| 3 | Create `packages/cli/src/commands/docs.ts` — path guard + scanner | Output 3, Step 5 | new file | FULL | Follow `context.ts` structure |
| 4 | Unit test path guard + heuristic classify | Test | `packages/cli/src/commands/docs.test.ts` (new) | STANDARD | |
| 5 | Add dry-run display to `docs.ts` | Output 3, Step 6 | same file | STANDARD | |
| 6 | Add DOC item creation to `docs.ts` | Output 3, Step 7 | same file | STANDARD | Requires TASK-391 done for integration test |
| 7 | Register `docs` subcommand in `index.ts` | Output 3, Step 4 | `packages/cli/src/index.ts` | QUICK | Lines ~260–275 |
| 8 | Add `--import-docs` in `init.ts` | Output 3, Step 8 | `packages/cli/src/commands/init.ts` | STANDARD | Find last option registration |
| 9 | Draft instructions file | Output 1, Step 1 | `.github/instructions/devsteps-diataxis.instructions.md` | QUICK | New file; verified line budget ~88 lines |
| 10 | Add 4 prompts to `DEVSTEPS_PROMPTS[]` | Output 2, Step 2 | `packages/mcp-server/src/handlers/prompts.ts` | STANDARD | Lines 27–63, append before `]` |
| 11 | Add 4 switch cases in `getPromptHandler` | Output 2, Step 3 | `packages/mcp-server/src/handlers/prompts.ts` | STANDARD | Lines 83+, append cases |
| 12 | Integration test: `devsteps docs import ./fixtures --yes` | Test | `tests/integration/` or `packages/cli/tests/` | STANDARD | Depends on TASK-391 done |

---

## Absence Audit (Adversarial gap challenge)

> "What implementation step is implied by findings but NOT in the plan above?"

| Gap | Handling |
|---|---|
| `extract H1 heading` from file for DOC item `title` | Included in Step 6 (`entry.h1Heading ?? entry.filename`) |
| `extractKeywords` function (for `metadata.keywords`) | NOT detailed above — add to Step 5 as `extractKeywords(content: string): string[]` using heading words + first 50 words heuristic; simple, no external deps |
| Exclusion patterns (`node_modules/`, `dist/`, `.devsteps/`) | NOT detailed — add to `scanMarkdownFiles` filter: exclude paths containing `/node_modules/`, `/dist/`, `/.devsteps/` |
| `devsteps docs split` command (future) | Explicitly deferred — flag-and-suggest in dry-run is v1 scope; split is post-import |
| `devsteps doctor --docs` quality gate | Deferred — separate TASK, not in SPIKE-043 scope |
| `--interactive` flag (per-item confirmation) | Step 6 uses `--yes` as default; `--interactive` is an alias for `--no-yes`; add as named option in Step 4 |
| Existing DOC items deduplication on re-import | NOT detailed — add `doc_path` uniqueness check in Step 7: query existing DOC items; skip if `metadata.doc_path` already exists |

---

## CONDITIONAL Steps

| Step | Condition | Trigger |
|---|---|---|
| Step 6 (addItem phase) integration test | CONDITIONAL on TASK-391 `done` | gate-reviewer must verify TASK-391 is done before marking Step 6 PASS |
| `--llm-classify` implementation | DEFERRED | Separate TASK after v1 ships; do NOT add LLM SDK in this story |
| `devsteps docs split` command | OUT OF SCOPE | Post-SPIKE-043 |

---

## Risk Matrix Summary

| Risk | Severity | Likelihood | Score | Mitigation |
|---|---|---|---|---|
| Path traversal in `docs import` | 3 | 2 | 6 | `resolve()` + prefix assert + symlink skip (Step 3 first action, non-negotiable) |
| TASK-391 not done before integration test | 2 | 3 | 6 | Decouple implementation from integration test; unit-test without DOC write path |
| LLM SDK bundle size regression | 3 | 1 | 3 | Defer `--llm-classify` SDK to post-v1 (locked in C1) |
| Instructions file exceeds 150 lines | 2 | 1 | 2 | Draft and count lines before committing; target 88 lines |
| Hardcoded prompt count in tests | 2 | 1 | 2 | Verified by grep: 0 occurrences — risk eliminated |

---

## Planner Verdict

```
verdict: PLAN_READY
confidence: 0.91
```

All constraints resolved. Steps are atomic, ordered, pre-located. TASK-391 is a conditional dependency for integration testing (not coding). C1/C2/C3/C4 design decisions are locked. No clarifications required from coord.

---

## Exec-Doc Addendum (Ring 4 — exec-doc pass, 2026-04-03)

### Prerequisite delta since planner dispatch

TASK-391 is now **done** (committed). The prerequisites table above has been updated. The conditional `Step 6` blocker is cleared: integration tests for `devsteps docs import` can run immediately once STORY-234 DOC creation tooling is available.

### Summary of all 10 coverage points

| # | Topic | Brief Section | Status |
|---|---|---|---|
| 1 | Diataxis compass table + 6 types | §1 — Diataxis Framework Overview | ✅ inline |
| 2 | `devsteps docs import` design decision (hybrid, heuristic-only, no LLM) | §Constraint Decisions C1/C2, Output 3 | ✅ inline |
| 3 | 8 heuristic split detection signals | §Output 3 Step 5 (heuristicClassify table) | ✅ inline |
| 4 | Copilot context delivery: instructions file + MCP prompts (BOTH) | §Output 1 + §Output 2 | ✅ inline |
| 5 | Instructions file draft structure (frontmatter + content outline) | §Output 1 Step 1 | ✅ inline |
| 6 | 4 MCP prompts for `prompts.ts` | §Output 2 Step 2–3 | ✅ inline |
| 7 | Auto-detect patterns: `analyst-*`, `aspect-*` → `doc_subtype: research, generated: true` | §Output 3 Step 5 (heuristicClassify table row 1) | ✅ inline |
| 8 | ensureFullMigration phase 4 | §Output 4 + §Prerequisites (TASK-391 done) | ✅ done |
| 9 | Work items: STORY-236, STORY-237, TASK-396–401 | §Output 5 | ✅ inline |
| 10 | Implementation constraints: path traversal, CI flag, heuristic-only default | §Constraint Decisions C1/C3, Step 5 `resolveScanPath` | ✅ inline |

### Split detection signals (consolidated 8-signal reference)

From Research Q3 + Internal §6. Used by `heuristicClassify` in `docs.ts:

| # | Signal | Suggested Type |
|---|---|---|
| 1 | Heading starts with imperative verb + "to" ("How to X", "Setting up Y") | `how-to` |
| 2 | Heading contains "Understanding", "Overview", "Why", "Concepts" | `explanation` |
| 3 | Heading contains "Reference", "API", "Options", "Parameters" or is a command name (`COMMAND_NAME`) | `reference` |
| 4 | "You will learn" or "By the end of this" present in content | `tutorial` (numbered steps context) |
| 5 | High code block ratio (>40% content) WITHOUT numbered steps | `reference` |
| 6 | High code block ratio WITH numbered steps + instructional prose | `tutorial` or `how-to` |
| 7 | Conditional tense throughout ("you can use…", "this may be useful when…") | `explanation` |
| 8 | Pure imperative tone throughout, no backstory, no "you will learn" | `how-to` |

**Mixed-type detection:** Score ≥0.5 on two different types → flag as `???` in dry-run. Do NOT auto-split.

### Auto-detect patterns for `doc_subtype: research`

When `devsteps docs import` scans a file matching ANY of these → assign `diataxis_type: 'research'`, `generated: true`:

| Pattern | Matches |
|---|---|
| Filename: `analyst-*` | All Ring-1 analyst output files |
| Filename: `aspect-*` | All Ring-2 aspect validator output files |
| Filename: `analysis-*` | Session analysis scratch files |
| Filename: `*-session*.md` | Any multi-session research output |
| Path contains `docs/research/` | Promoted research synthesis |
| Path contains `/tmp/` | Unsorted working files (assign `generated: true`) |
| First 5 lines contain: `"Agent:"`, `"Mandate:"`, `"MandateResult"`, `"sprint_id"`, `"Confidence:"` | AI-output headers |

Files matching these patterns get confidence 0.97 (auto-accept, no review needed).

### Implementation constraints (locked)

| Constraint | Rule | Enforcement Point |
|---|---|---|
| **Path traversal guard** | `node:path.resolve(input)` → assert starts with `process.cwd()` | First action in `resolveScanPath()`, before any file read |
| **Symlink skip** | Use `lstatSync`, skip non-`isFile()` entries | `scanMarkdownFiles()` filter |
| **Non-interactive CI default** | Default behaviour: display dry-run table + auto-proceed; `--interactive` opt-in only | `docsImportCommand` option handling |
| **`devsteps init --import-docs`** | Always passes `yes: true` to suppress prompts (no TTY in init flow) | `init.ts` after init completes |
| **Heuristic-only by default** | `--llm-classify` exists as placeholder but SDK NOT bundled in v1 | `docs.ts` — flag parsed, shows "LLM classification deferred to v2" message |
| **Exclusion patterns** | Auto-exclude: `node_modules/`, `dist/`, `.devsteps/`, `.git/` | `scanMarkdownFiles()` path filter |
| **Deduplication** | Check `metadata.doc_path` uniqueness before `addItem`; skip existing | `docsImportCommand` pre-creation check |
| **Display cap** | Show max 50 items in dry-run; "… and N more" for overflow | `displayDryRunTable()` |
