## Problem

There is no explicit, enforceable rule in the planning workflow that mandates all DevSteps work items must be written in English. The only existing reference is the vague phrase "All outputs in English" in the T1 Coordinator and Sprint Executor agent files — which agents can interpret as applying only to commit messages or terminal output, not to work item titles, descriptions, acceptance criteria, and section headings.

**Evidence:** STORY-116/117/118 and TASK-261/263/264/265/266 were created during a planning session conducted in German and contained German prose throughout their descriptions. This was caught manually — no automated or documented gate prevented it.

## Goal

Add an explicit, unambiguous English-only mandate to every file where work items are created or described:
- Planning prompt (`devsteps-10-plan-work.prompt.md`)
- DevSteps usage instructions (`devsteps-devsteps-usage.instructions.md`)
- T1 Coordinator and Sprint Executor agent files (expand "All outputs in English")

## Why English?

1. **AI consistency** — Copilot, T2/T3 agents, and all LLM tooling produce better results when context, work items, and code comments share a single language
2. **International teams** — Work items must be readable without translation for any contributor
3. **Tool matching** — Semantic search, grep, and similarity matching degrade when items mix languages

## Acceptance Criteria

- [ ] `devsteps-10-plan-work.prompt.md` contains an explicit callout: "All work item content — title, description, acceptance criteria, section headings — MUST be written in English, regardless of the language used in chat."
- [ ] `devsteps-devsteps-usage.instructions.md` adds a Language Rule section: "Work item content (title, description, AC, headings) must always be in English."
- [ ] `devsteps-t1-coordinator.agent.md` expands "All outputs in English" to explicitly cover work items
- [ ] `devsteps-t1-sprint-executor.agent.md` same expansion
- [ ] Rule is discoverable: placed where it will be seen before item creation, not buried at the end