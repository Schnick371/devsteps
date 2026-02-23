# Spike: AITK Evaluation Framework for DevSteps MPD Agent Quality

## Research Question

Can Microsoft AI Toolkit (AITK) evaluation tools (`aitk-evaluation_planner`, `aitk-get_evaluation_code_gen_best_practices`, `aitk-evaluation_agent_runner_best_practices`) be used to systematically measure and improve the quality of DevSteps T2/T3 agent outputs?

## Context

**What AITK actually is** (confirmed from SKILL.md v0.30.1):
- Python/.NET SDK for building Azure AI Foundry agents (Microsoft Agent Framework)
- Evaluation pipeline: test dataset → Python agent runner → Azure AI evaluators (groundedness, relevance, coherence)
- Tools: `aitk-evaluation_planner`, `aitk-get_evaluation_code_gen_best_practices`, `aitk-evaluation_agent_runner_best_practices`
- NOT applicable to Copilot Chat `.agent.md` files directly

**Why this is a real opportunity:**
Our T2 agents produce `MandateResult` JSON (CBP protocol). These are structured JSON blobs that contain `findings[]`, `recommendations[]`, `verdict`, `confidence`. This output structure is a natural candidate for AI-based evaluation — similar to how AITK evaluates agent responses against ground truth.

**Key question:** Can AITK's evaluation runner call DevSteps MCP server tools, simulate T2 mandate scenarios, and use Azure AI evaluators to judge MandateResult quality?

## Investigation Areas

### 1. AITK Evaluation Pipeline Compatibility
- Does `aitk-evaluation_planner` support evaluating structured JSON (MandateResult) or only free-form text?
- Can `aitk-evaluation_agent_runner_best_practices` wrap MCP tool calls as "agent responses"?
- What Azure AI evaluators are applicable: groundedness, relevance, coherence, or custom?

### 2. MandateResult as Evaluation Target
- Define "quality" for each mandate type:
  - `archaeology`: completeness of file path coverage, no hallucinated paths
  - `risk`: precision of HIGH/MEDIUM/LOW ratings vs actual outcomes
  - `planning`: step granularity and T3-impl executability without discovery
  - `review`: PASS/FAIL accuracy vs eventual merge success
- Can existing completed mandates (from `.devsteps/cbp/`) serve as a test dataset?

### 3. MCP Server HTTP Wrapping
- AITK evaluation runner expects an HTTP server (Agent-as-Server pattern)
- Our MCP server runs as stdio transport by default
- Evaluate: HTTP transport feasibility for evaluation purposes (already has `http-server.ts`)

### 4. Effort vs ROI Assessment
- Compare AITK evaluation approach vs simpler Zod schema validation (already in CBP schemas)
- Compare vs Vitest tests with mock LLM responses
- What quality signal does AITK add that schema validation cannot provide?

### 5. Model Guidance Applicability
- `aitk-get_ai_model_guidance`: Could be used to recommend optimal models for T2 agents
- Investigate: Is model selection guidance extractable without full Python Agent Framework?

## Hypothesis

**H1 (optimistic):** AITK evaluation runner can call our MCP HTTP server, collect T2 MandateResult JSON outputs, and use custom Azure AI evaluators to score quality dimensions — enabling automated regression testing of agent reasoning quality.

**H2 (pessimistic):** AITK evaluation is designed for LLM response evaluation against reference datasets, not for structured JSON agent protocol validation. The overhead of Azure AI Foundry setup outweighs the benefit over simpler Zod + Vitest validation.

## Success Criteria

- [ ] Documented: exact AITK evaluation workflow steps for MandateResult evaluation
- [ ] Prototype or proof-of-concept: one T2 agent scenario evaluated with AITK tooling
- [ ] Decision: INVEST (build evaluation harness) vs SKIP (use Vitest + Zod schema validation)
- [ ] If INVEST: Story created for evaluation harness implementation
- [ ] If SKIP: Document why simpler approach suffices + close EPIC-022

## Resources

- SKILL.md: `/home/th/.vscode-server/extensions/ms-windows-ai-studio.windows-ai-studio-0.30.1-linux-x64/resources/skills/agent-workflow-builder_ai_toolkit/SKILL.md`
- CBP schemas: `packages/shared/src/schemas/` (MandateResult Zod schemas)
- MCP HTTP server: `packages/mcp-server/src/http-server.ts`
- Existing CBP results: `.devsteps/cbp/` (if any runs have been executed)
- EPIC-022: AI Toolkit Integration for DevSteps Agents

## Time Box

**Max 4 hours** — if no clear prototype path visible after reading AITK evaluation docs + calling `aitk-evaluation_planner`, conclude H2 (pessimistic) and close EPIC-022.