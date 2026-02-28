---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Interactive planning session - work with developer to define and structure work items before implementation'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runNotebookCell', 'execute/testFailure', 'read', 'agent', 'search', 'playwright/*', 'bright-data/*', 'upstash/context7/*', 'google-search/search', 'local-web-search/search', 'devsteps/*', 'remarc-insight-mcp/*', 'todo']
---

# 🎯 Plan Work - Interactive Planning Session

> **Auto-classify before acting:**
> **(A) Trivial** — isolated change, config value, single-file fix → skip research, go to branch prep directly.
> **(B) Complex** — cross-cutting, tech/library choice, pattern unification, 3+ components → run `#bright-data` research + `#context7` docs lookup FIRST, synthesize findings before creating any item. When uncertain, classify as Complex.

Plan work through dialogue — understand intent, research evidence, structure items with traceability.

**Branch strategy:** Work items created in `main` ONLY. Feature branches come later.
**Progress:** Use `#manage_todo_list` to track planning steps.

## Planning Protocol

### 1. Branch Preparation (MANDATORY)

1. Check current branch: `git branch --show-current`
2. Switch to `main` if not already there: `git checkout main && git status`
3. Verify clean working tree

**Commit discipline:** Plan ALL related items first → create with MCP tools → commit together → wait for user approval before committing.

### 2. Understand Context

Ask "why" before "what". Surface dependencies early. Search existing items — reuse or extend before creating new ones.

**Bug clustering:** Search bugs before creating new ones. Group related symptoms sharing root cause into one bug item.

Use `#askQuestions` to confirm intent before structuring:

> What is the core problem — what should *not* change after this is done?
> Any constraints, known pitfalls, or approaches to avoid?
> Is there an existing Epic or Story this belongs to?

### 3. Research First *(Complex tasks only)*

Use `#bright-data` for 10+ external sources. Use `#context7` for official API docs. Evidence-based proposals only.

### 4. Structure Work

**Scope:** Identify ALL affected components — functional reasoning, not keyword search only. Create inventory before creating items.

**Hierarchy:**
- Epic → Story → Task (standard feature development)
- Epic → Spike → Task (research → proof-of-concept)
- Story ← Bug → Task (`Bug blocks/implements Story`; `Task implements Bug`)
- Task implements Story/Bug — **NEVER** Epic directly (breaks Epic Summary traceability)

**Priority:** Eisenhower matrix — urgent-important (Q1) first.

**Spike → Story:** When Spike completes: create Stories for validated approaches under same Epic, link with `relates-to`.

### 5. Create Items

Use `devsteps/*` MCP tools. Include: type, priority, `affected_paths`, tags, description with acceptance criteria.

### 6. Link Relationships

- `implements` — hierarchical (child → parent)
- `blocks` / `depends-on` — execution dependency
- `tested-by` / `relates-to` — context only

### 7. Validate

Every item: clear purpose, priority aligned, dependencies identified, hierarchy non-orphaned.

Present the proposed structure to the user via `#askQuestions` before creating any items:

> Proposed: [Epic X → Story Y → Tasks Z1, Z2]. Priority: [Q1/Q2]. Affected paths: [list].
> Shall I create these items, or adjust scope/priority first?

### 8. Commit to Main

```bash
git add .devsteps/
git commit -m "feat(devsteps): plan [DESCRIPTION]"
```

Items stay `draft` or `planned` — never `in-progress` during planning.

### 9. Return to Original Branch

```bash
git checkout <original-branch>
git cherry-pick <planning-commit-hash>
```

DevSteps MCP tools read from current branch — cherry-pick ensures new items are visible during implementation.

---

**See [`devsteps-t1-coordinator.agent.md`](../agents/devsteps-t1-coordinator.agent.md) for MPD orchestration. See [`devsteps-20-start-work.prompt.md`](devsteps-20-start-work.prompt.md) for implementation kickoff.**