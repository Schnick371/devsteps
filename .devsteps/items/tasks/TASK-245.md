# Task: Agent Registry — Tier-Routing Tabelle für Tier-1

## What

Erstelle `.github/agents/REGISTRY.md` — das "Schnelltelefon" für Tier-1 Agents.  
Tier-1 liest diese Datei EINMAL zu Beginn jeder Session statt alle Agent-Files zu scannen.

## Inhalt

```markdown
# DevSteps Agent Registry

## Tier-1 → Tier-2 Routing

| Mandate Type       | Tier-2 Agent                     | Model     | Use When |
|--------------------|----------------------------------|-----------|----------|
| archaeology        | devsteps-t2-archaeology          | Sonnet    | STANDARD/FULL |
| archaeology-delta  | devsteps-t2-archaeology          | Sonnet    | Adaptive replanning |
| risk               | devsteps-t2-risk                 | Sonnet    | STANDARD/FULL, single item |
| risk-batch         | devsteps-t2-risk                 | Sonnet    | Sprint pre-flight |
| research           | devsteps-t2-research             | Sonnet    | COMPETITIVE triage |
| quality-review     | devsteps-t2-quality              | Sonnet    | Post-implementation gate |
| planning           | devsteps-t2-planner              | Sonnet    | FULL triage, sprint sequencing |

## Tier-2 → Tier-3 Routing

| Tier-2 Agent         | Dispatches (parallel)                                   |
|----------------------|---------------------------------------------------------|
| t2-archaeology       | t3-analyst-context + t3-aspect-impact                   |
| t2-risk              | t3-aspect-constraints (per item, parallel batch)        |
| t2-research          | (direct MCP tools: Tavily, StackOverflow, GitHub)       |
| t2-quality           | t3-aspect-quality → t3-reviewer (only if auto passes)  |
| t2-planner           | (no T3 dispatch — pure synthesis from MandateResults)   |

## Tier-1 → Tier-3 Direct (QUICK triage only)

| Step | Agent | When |
|---|---|---|
| Implementation | devsteps-t3-impl | QUICK tier (no analysis needed) |
| Quality gate | devsteps-t2-quality | Always (even QUICK) |

## Triage Tier → Mandate Dispatch

| Triage | Mandates Dispatched | Parallel? |
|--------|---------------------|-----------|
| QUICK | None | — |
| STANDARD | archaeology + risk | ✓ |
| FULL | archaeology + risk + planning | ✓ (then planner after others) |
| COMPETITIVE | research | Single |

## File Naming Convention

- Tier-1: `devsteps-t1-[role].agent.md` (coordinator, sprint-executor)
- Tier-2: `devsteps-t2-[domain].agent.md` (new files)
- Tier-3: `devsteps-t3-[function].agent.md` (new/migrated files)
- Support: `devsteps-[role].agent.md` (maintainer, documenter — no tier)
```

## Acceptance Criteria
- [ ] REGISTRY.md created in `.github/agents/`
- [ ] All Tier-1, Tier-2, Tier-3 agents listed with mandate types
- [ ] Naming convention documented
- [ ] Triage → Mandate dispatch table present