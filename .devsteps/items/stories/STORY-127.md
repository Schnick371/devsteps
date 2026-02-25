# Story: Audit & Trim T2 Agent Files for Verbosity

## Problem

T2 agent files are individually invoked as agents — their content becomes the system prompt for each T2 deep analyst. If they're verbose, the LLM ignores the middle (MAP-REDUCE-RESOLVE-SYNTHESIZE protocol tables, HARD STOP conditions).

## Acceptance Criteria

- [ ] All T2 agent files audited for line count (target: ≤100 lines each)
- [ ] Each T2 file starts with Contract table (Tier, Mandate type, Returns) immediately after frontmatter
- [ ] MAP phase always has "CRITICAL: dispatch ALL agents simultaneously" — visible in first 30 lines
- [ ] REDUCE/RESOLVE/SYNTHESIZE sections compressed to one-liners referencing TIER2-PROTOCOL.md
- [ ] `findings` format requirements (what T1 reads) kept verbatim — this is the API contract
- [ ] No prose explanations of WHY the protocol works — only HOW (decision tables)
- [ ] `write_mandate_result` call pattern retained (it's an always-required output step)

## Audit Results (Baseline)

Run `wc -l .github/agents/devsteps-t2-*.agent.md` to establish baseline before trimming.

Priority trim order (longest first, protocol-critical files last):
1. `devsteps-t2-research.agent.md` (109 lines — known verbose)
2. `devsteps-t2-impl.agent.md` (115 lines)
3. `devsteps-t2-planner.agent.md` (114 lines)
4. Others based on audit results

## Trim Pattern

**Remove from T2 files:**
- "Protocol reference: see TIER2-PROTOCOL.md" explanations of why MAP-REDUCE works
- Sub-bullet expansions of table rows (the table IS the rule)
- Absence Audit prose (keep as a bullet, not a paragraph)

**Keep in T2 files:**
- Frontmatter (model, tools, agents, handoffs)
- Contract table — this is T1's call signature
- MAP agents table with "dispatch simultaneously" rule  
- `write_mandate_result` output call (the required API)
- `findings` schema (what T1 reads — the contract output)

## Key Distinction from T1 Trim

T2 files are read by the AI playing the T2 role. They can be slightly longer than T1 files because they're not competing with the full coordinator context. But they should still be ≤100 lines to ensure the MAP dispatch instruction is in the first 30 lines.
