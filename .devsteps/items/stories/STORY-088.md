# User Story

As a DevSteps contributor using AI Toolkit, I want an instructions file specifically for AI agent workflows, so that Copilot provides AITK-aware guidance when I work on agent code.

## Acceptance Criteria

- [ ] Create `.github/instructions/aitk.instructions.md`
- [ ] YAML frontmatter with `applyTo: "**/*.agent.md"` pattern
- [ ] Instructions reference all 6 AITK tools with usage guidance
- [ ] Explain when to call each AITK tool during agent development
- [ ] Include evaluation workflow patterns
- [ ] Link to AI Toolkit documentation
- [ ] Examples showing AITK tool integration

## Implementation Notes

**File Structure:**
```markdown
---
description: AI Toolkit integration for DevSteps agent development
applyTo: "**/*.agent.md,.github/agents/**,packages/mcp-server/**/*.ts"
---

# AI Toolkit Integration

When working on AI agents or MCP server code, leverage these AITK tools:

## Available AITK Tools

- `aitk-get_agent_code_gen_best_practices` - General agent development
- `aitk-get_tracing_code_gen_best_practices` - MCP tracing
- `aitk-get_ai_model_guidance` - Model selection
- `aitk-evaluation_planner` - Evaluation planning
- `aitk-get_evaluation_code_gen_best_practices` - Evaluation implementation
- `aitk-evaluation_agent_runner_best_practices` - Agent testing

## When to Use

[Usage patterns and examples]
```

**applyTo Pattern:**
Match agent files and MCP server code where AITK tools are most relevant

## Dependencies

None - creates new file

## Effort Estimate

Small - create single instructions file with clear patterns