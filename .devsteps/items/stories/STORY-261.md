After the canonical protocol is defined, update all 15 Ring-1 to Ring-5 agent .md files to include a formal 'Output Files' section specifying: which paths they write to, naming convention, lifecycle stage, and when to use tmp/ vs .devsteps/analysis/.

Files to update (15 total):
- Ring-1 ×7: context, internal, risk, quality, archaeology, research, web
- Ring-2 ×5: constraints, impact, integration, quality, staleness
- Ring-3/4/5 ×3: exec-planner, exec-impl, gate-reviewer

Affected: .github/agents/*.agent.md (15 files)