## Problem
9 agent files exceed the 150-line limit defined in `devsteps-code-standards.instructions.md`. Oversized files are harder to maintain, harder for models to process correctly, and indicate structural concerns (usually duplicated boilerplate).

## Oversized Files
| File | Current Lines | Target |
|------|--------------|--------|
| `devsteps-R0-coord.agent.md` | ~185 lines | ≤150 |
| `devsteps-R0-coord-sprint.agent.md` | ~192 lines | ≤150 |
| `devsteps-R4-worker-devsteps.agent.md` | ~206 lines | ≤150 |
| Others (6 more) | >150 | ≤150 |

## Root Cause
AITK tool list copy-paste — the full tool reference table from AITK documentation is duplicated verbatim in multiple agent files. This table alone is ~60 lines.

## Fix Options (choose per file)
1. **Extract to SKILL.md**: Move the AITK tool list into a shared `SKILL.md` (see TASK-350 for related spike). Reference from agents as `skill: aitk-tools-reference`
2. **Remove entirely**: If the tool list is already in `copilot-instructions.md`, remove the duplicate

## Acceptance Criteria
- All 9 oversized agent files reduced to ≤150 lines
- No functionality removed — only boilerplate extraction/deduplication
- `grep -c "" .github/agents/devsteps-R*.agent.md` all show ≤150
- Models still have access to the information via referenced SKILL.md or instructions

## Notes
Batch this update; fix all 9 files in one commit. May be coordinated with TASK-345 (tool name sweep) to reduce total churn.## Impl (2026-03-06)
- coord: 187→150 (fuse routing+triage tables, compress steps 2+3)
- coord-sprint: 194→148 (compress clarification, DevSteps integration, pause triggers)
- worker-devsteps: 206→142 (remove Status Transitions + Return JSON examples)
- coord-ishikawa: 159→129, aspect-constraints: 153→124, aspect-staleness: 151→122 (AITK boilerplate removed)
- tools[] NOT changed per user instruction
- Gate PASS: all 6 files ≤150 lines