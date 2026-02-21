# User Story

As a DevSteps agent developer, I want agent instructions to reference AITK evaluation tools, so that agents can systematically validate their outputs and improve quality.

> ⚠️ **Affected paths corrected 2026-02-21.** Original paths referenced `devsteps-analyzer.agent.md`, `devsteps-implementer.agent.md`, `devsteps-tester.agent.md` — none of these exist. Corrected to current agent names with `-subagent` suffix.

## Acceptance Criteria

- [ ] Each agent file mentions relevant AITK tools in appropriate sections
- [ ] Coordinator agent references `aitk-get_agent_code_gen_best_practices`
- [ ] `devsteps-test-subagent.agent.md` references `aitk-get_evaluation_code_gen_best_practices` and `aitk-evaluation_planner`
- [ ] All agents reference `aitk-get_ai_model_guidance` for model selection
- [ ] Documentation explains when/how to use each AITK tool

## Implementation Notes

**AITK Tools Mapping:**
- `aitk-get_agent_code_gen_best_practices` → All agents (general guidance)
- `aitk-get_tracing_code_gen_best_practices` → MCP-related agents
- `aitk-get_ai_model_guidance` → All agents (model selection)
- `aitk-evaluation_planner` → `devsteps-test-subagent` (before creating evaluations)
- `aitk-get_evaluation_code_gen_best_practices` → `devsteps-test-subagent`
- `aitk-evaluation_agent_runner_best_practices` → Coordinator / `devsteps-test-subagent`

**Current agent names (use `-subagent` suffix where applicable):**
- `devsteps-coordinator.agent.md`
- `devsteps-analyst-context-subagent.agent.md` (was: devsteps-analyzer)
- `devsteps-impl-subagent.agent.md` (was: devsteps-implementer)
- `devsteps-documenter.agent.md`
- `devsteps-test-subagent.agent.md` (was: devsteps-tester)

## Dependencies

None - documentation update only

## Effort Estimate

Small - update 5 agent files with tool references