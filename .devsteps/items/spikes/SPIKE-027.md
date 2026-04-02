## Context
VS Code Copilot supports `SKILL.md` files as an alternative invocation mechanism to `.prompt.md`. Skills can be bundled within an agent plugin (`plugin.json`) and invoked via `/skill-name` slash command. Unlike prompts, skills carry domain-specific knowledge and are reusable across agent transitions.

## Trial Objective
Create the first `SKILL.md` for the Spider Web entry point (`devsteps-start-work`), establishing the pattern for the remaining 19 prompts if the approach validates.

## Proposed Skill: `devsteps-start-work`
Maps to existing `.github/prompts/devsteps-20-start-work.prompt.md`.

**Target file:** `.github/skills/devsteps-start-work.skill.md`

Contents should cover:
1. Session start checklist (load context, check MCP, triage task)
2. Triage → Dispatch mapping table (QUICK/STANDARD/FULL/COMPETITIVE)
3. DevSteps lifecycle steps (create item → dispatch → gate → done)
4. Reference to appropriate coord agent

## Open Research Questions (to resolve during spike)
1. What is the exact `SKILL.md` format expected by VS Code 1.110?
2. Does `plugin.json` reference skills by path or by ID?
3. Can a skill be invoked both as slash command AND as `applyTo: **` instruction?
4. Does skill invocation require Copilot or work with any chat participant?

## Acceptance Criteria
- One `SKILL.md` created and validated against VS Code skill schema
- Skill invocable via `/devsteps-start-work` in VS Code chat
- Skill bundleable in `plugin.json` manifest (STORY-199 dependency)
- Decision documented: proceed with full prompt → skill migration or keep `.prompt.md`

## Dependencies
- Requires STORY-199 (plugin.json) for bundling context
- Research findings from SPIKE-027 (chatPromptFiles) may affect decision
## Correction — 2026-03-24: Skills are Tool-Reference Libraries, not Entry-Point Stubs

**Previous understanding (incorrect):** SKILL.md files were categorized as "partial workaround" for missing `prompts:` key in `plugin.json` — limited to slash-command discovery hooks (e.g. `/devsteps-plan`) without full workflow capability. Verdict: TRIAL at best.

**Updated understanding (correct):** SKILL.md files are **reusable procedural knowledge libraries** with progressive loading (name+description → body → references/ → scripts/). Real-world examples from GitLens, Python Envs, and Copilot Chat itself confirm this pattern:
- GitLens `/investigate`: 6-step bug investigation procedure with templates
- GitLens `/audit-commits`: commit analysis workflow with impact classification
- Python Envs `debug-failing-test`: 5-phase iterative debugging loop
- Python Envs `run-pre-commit-checks`: detailed lint/type/test commands
- Copilot Chat `agent-customization`: complete decision matrix + reference library with 6 sub-docs

**What this means for DevSteps:** A `devsteps-mcp` skill could consolidate the duplicated DevSteps MCP tool knowledge currently spread across 48 files (3 instruction files, 9 prompt files, 36 agent files) into one canonical reference with sub-docs for: tool-reference, item-lifecycle, mandate-protocol, delegation-boundary. All agents would load it on-demand via progressive loading instead of repeating tool rules inline.

**Status:** This spike's original scope (entry-point stub) is too narrow. Superseded by new story for tool-reference-library approach.
