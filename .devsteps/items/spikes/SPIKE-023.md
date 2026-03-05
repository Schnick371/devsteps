## Research Question

Can GPU-accelerated fuzz driver generation (FD-Factory pattern, Jan 2026) be practically integrated into DevSteps for C/C++ target testing workflows?

## Background

FD-FACTORY (Jan 21, 2026): LLM-accelerated fuzzing framework that achieved >40% coverage improvement by using large language models to generate mutation-aware fuzz drivers for C/C++ deep learning APIs.

Discovered during DevSteps GPU research sprint (SPIKE-021, 2026-03-05).

## Feasibility Questions

1. What percentage of DevSteps users have C/C++ codebases (current estimate: <5%)?
2. Can the FD-Factory pattern be exposed as a DevSteps MCP tool (`devsteps_fuzz_generate`)?
3. What GPU VRAM is required alongside Spider Web panel + embedding models?
4. Is there an existing VS Code extension we could integrate with (AFL++, libFuzzer) rather than building from scratch?

## Out of Scope

- DevSteps core workflow (task tracking, sprints) — this is purely an auxiliary GPU feature
- Implementation without feasibility study
- Any feature targeting <5% of users without a clear integration path

## Decision Gate

- IMPLEMENT: If >10% of users have C/C++ + GPU targets AND integration with existing fuzzer VS Code extensions is feasible
- CLOSE as out-of-scope: If user base analysis shows <5% target + no reuse opportunity

## Acceptance Criteria

- [ ] User base analysis complete (survey or telemetry review)
- [ ] FD-Factory paper reviewed; implementation complexity estimated
- [ ] Integration options with existing fuzz tooling identified
- [ ] Decision documented: implement or close