# Task: Create deep-analyst-research Agent (Tier-2)

## Role
**Domain:** External technical research + pattern discovery  
**Mandate Type:** `research`  
**Dispatches:** `#mcp_tavily_tavily_research`, `#mcp_upstash_conte_query-docs`, `#mcp_local-web-sea_search`  
**Returns:** MandateResult  
**Unique:** Used for COMPETITIVE triage tier — replaces archaeology for problems where external patterns are more valuable than internal archaeology

## When Used
- Item has `research` or `pattern-discovery` tag
- Triage tier = COMPETITIVE
- Archaeology + risk alone cannot determine best approach for the technology involved
- Problem involves selecting from 2+ viable external libraries/patterns

## Agent Behavior

### Phase 1: Decompose Research Questions
From mandate context, extract:
1. Core technical questions (What are we solving?)
2. Technology candidates (What libraries/patterns are options?)
3. Constraints (Must work with current stack: TS, NestJS, Zod, etc.)

### Phase 2: Multi-Source Research (parallel where possible)
```
Source 1: Stack Overflow (via mcp_local-web-sea_search)
Source 2: GitHub (stars, maintenance status, README)
Source 3: Official docs (via mcp_upstash_conte_query-docs)
Source 4: Tavily deep research (comprehensive synthesis)
```

### Phase 3: Compare + Score
| Criterion | Weight | Option A | Option B |
|---|---|---|---|
| Type safety | 30% | ... | ... |
| Bundle size | 20% | ... | ... |
| Maintenance | 25% | ... | ... |
| Adoption | 25% | ... | ... |

### Phase 4: MandateResult
findings: comparison table + recommended approach + rationale (< 800 tokens)
recommendations: ["Use X for Y because Z", "Avoid A due to B"]

## Acceptance Criteria
- [ ] NOT a subagent spawner — uses MCP tools directly (Tavily, Stack Overflow, GitHub)
- [ ] Multi-source synthesis, not single-source
- [ ] Always includes trade-off table in findings
- [ ] Always includes source URLs in findings for traceability
- [ ] Clarification loop: if research contradicts itself, writes iteration_signal("clarification")