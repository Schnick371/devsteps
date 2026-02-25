# Story: Trim T2 & T3 Agent Files — Line Budget Enforcement

## Prerequisite

**Blocked by STORY-128** (boilerplate extraction). Trim only after shared content has been moved to `TIER2-PROTOCOL.md` — otherwise trim produces non-DRY results.

## Overarching Principle

> **The LLM Attention Budget Law** (Anthropic, Sept 2025): Content in the middle of agent files is deprioritized. After boilerplate extraction (STORY-128) reduces each file by ~35–40%, remaining content must be compressed to ≤100 lines (T2) / ≤90 lines (T3) so the unique mission-critical content is always in the primacy zone.

## T2 Trim Targets (all exceed 100-line budget)

Audit finding: **All 9 T2 files exceed 100 lines. 8 of 9 are over budget.**

| File | Current | Target | Priority | What to cut |
|---|---|---|---|---|
| `t2-quality` | 115 | ≤100 | **1** | Review-fix loop duplicates `t2-reviewer`; SYNTHESIZE schema verbose (5 items → 2) |
| `t2-impl` | 114 | ≤100 | **2** | "Web search scope" paragraph → one-liner; RESOLVE table → 2 rows |
| `t2-planner` | 113 | ≤100 | **3** | SYNTHESIZE findings list 5 items → 3; Pre-MAP section trim |
| `t2-risk` | 110 | ≤100 | **4** | RESOLVE → 1 rule absorbed into REDUCE; COMPETITIVE checks → protocol ref |
| `t2-archaeology` | 110 | ≤100 | **5** | Adversarial + Absence Audit near-duplicate after extraction |
| `t2-test` | 110 | ≤100 | **6** | Rationalise search tools (bright-data only); test pyramid → instruction ref |
| `t2-reviewer` | 109 | ≤100 | **7** | Phase 0 → TIER2-PROTOCOL.md; explain or remove `remarc-insight-mcp/*` |
| `t2-research` | 108 | ≤100 | **8** | `perspective independence` → implied by protocol; trim after extraction |
| `t2-doc` | 100 | ≤100 | **9 (at limit)** | No trim needed post-extraction; verify compliance after STORY-128 |

## T3 Trim Targets (post-STORY-128 extraction)

Analyst for these: T3 Analyst files are 75–140 lines ("leaf" nodes), exec files are 151–201 lines (unacceptable).

| File | Current | Target | What to cut |
|---|---|---|---|
| `t3-doc` | **201** | ≤110 | Output template is a verbose filled *example* — replace with schema spec (~40 lines saved) |
| `t3-impl` | 151 | ≤100 | Context reception section is 20 lines → 5; framework boilerplate replaced (fixed in STORY-128) |
| `t3-test` | 166 | ≤110 | Output template over-specified; AAA format → 5-line spec, not example |
| `t3-analyst-context` | 140 | ≤90 | Post-extraction: communication + integration sections are low-value (removes ~25 lines) |

## Acceptance Criteria

- [ ] All T2 files ≤ 100 lines — verified `wc -l`
- [ ] `t3-doc` ≤ 110 lines, `t3-impl` ≤ 100 lines, `t3-test` ≤ 110 lines
- [ ] `t3-analyst-context` ≤ 90 lines
- [ ] No mission-critical content removed (MAP dispatch tables, domain-specific checks, output schemas)
- [ ] All cuts are prose/explanation that duplicates what the model already knows or references protocol doc
- [ ] `t2-quality` and `t2-reviewer` review-fix loop logic deduplicated (one is canonical)
- [ ] STORY-128 must be `done` before this story starts

## Key Constraint

Content to **never cut**: MAP dispatch table rows (these are the instructions), REDUCE contradiction checks (domain-specific), SYNTHESIZE `findings` schema (this is the T1 API contract). Only cut: narrative prose, verbose examples, redundant explanations.
