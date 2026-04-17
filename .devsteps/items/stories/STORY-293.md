## Context — Work-First Semantic Anchor, Step 1 (classification enrichment)
`heuristicClassify(excerpt, filepath?)` currently classifies doc fragments purely by text content.
When a fragment has a `related_items` link to STORY-X, the Epic and Story titles/tags provide
strong signals: "Hardware-Schnittstellen" Epic → Reference; "Als Endnutzer möchte ich..." Story → How-to.

## Signature change (non-breaking)
Add optional 3rd argument:
```ts
heuristicClassify(
  excerpt: string,
  filepath?: string,
  context?: {
    epic_title?: string;
    story_title?: string;
    epic_tags?: string[];
  }
): ClassificationResult
```
When `context` is absent: behavior is identical to today (no regression).

## Domain keyword table (bilingual — EN + DE)
| Pattern | Signal |
|---------|--------|
| `hardware|interface|api|spec|datenblatt|kenndaten|grenzwert` | `reference += 0.20` |
| `als endnutzer|als benutzer|as a user|möchte ich|i want to` | `how-to += 0.20` |
| `setup|deployment|installation|konfiguration|einrichtung` | `how-to += 0.15` |
| `overview|architektur|konzept|hintergrund|warum|why` | `explanation += 0.15` |
| `fehler|error|troubleshoot|debug|diagnose` | `reference += 0.10` |

Pattern matched against `epic_title` + `story_title` (lowercased, word-boundary).

## 3-file cascade
1. `packages/shared/src/core/heuristic-classify.ts` — add context param + keyword table block
2. `packages/mcp-server/src/handlers/devsteps_docs_classify.ts:38` — pass context (MCP call site)
3. `packages/cli/src/commands/docs.ts:146` — pass context (CLI call site; missed by initial analysis)

## Context population (how callers get epic_title)
The handler calling `heuristicClassify()` must:
1. Read `doc.metadata.links` for `implements` entries
2. For each linked STORY/TASK: `getItem(id)` → traverse to Epic via `implements` chain
3. Built lazily: if no linked items, skip — no API call overhead

## Test coverage additions (German Scrum story vectors mandatory)
- "Als Endnutzer möchte ich das Gerät einschalten" → how-to boost
- "Hardware-Schnittstellen API Referenz" (Epic title) → reference boost
- No context present → score identical to current baseline

## Acceptance Criteria
- [ ] `heuristicClassify` accepts optional `context` param
- [ ] Domain keyword table: ≥5 patterns EN + DE per primary Diataxis type
- [ ] CLI call site at `docs.ts:146` updated in same PR (impact-analyst finding)
- [ ] 3 prompt mirror copies of `devsteps-58-doc-import.prompt.md` updated post-ship (see DOC item)
- [ ] German Scrum story test vectors passing
- [ ] Zero regression test: fragment without context → same scores as before

## Blocked until
SA-NEW-1 ships first (auto-link frontmatter) — otherwise no `related_items` links exist to traverse for context population.