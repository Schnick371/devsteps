# User Story

As a DevSteps agent developer, I want agent instructions to reference AITK evaluation tools, so that agents can systematically validate their outputs and improve quality.

## Acceptance Criteria

- [ ] Each agent file mentions relevant AITK tools in appropriate sections
- [ ] Coordinator agent references `aitk-get_agent_code_gen_best_practices`
- [ ] Tester agent references `aitk-get_evaluation_code_gen_best_practices` and `aitk-evaluation_planner`
- [ ] All agents reference `aitk-get_ai_model_guidance` for model selection
- [ ] Documentation explains when/how to use each AITK tool
- [ ] Examples show AITK tool integration patterns

## Implementation Notes

**AITK Tools Mapping:**
- `aitk-get_agent_code_gen_best_practices` → All agents (general guidance)
- `aitk-get_tracing_code_gen_best_practices` → MCP-related agents
- `aitk-get_ai_model_guidance` → All agents (model selection)
- `aitk-evaluation_planner` → Tester agent (before creating evaluations)
- `aitk-get_evaluation_code_gen_best_practices` → Tester agent
- `aitk-evaluation_agent_runner_best_practices` → Coordinator/Tester

**Sections to Update:**
- Tool usage sections
- Best practices sections
- Quality gates/validation sections
- "When to use" guidance

## Dependencies

None - documentation update only

## Effort Estimate

Small - update 5 agent files with tool references