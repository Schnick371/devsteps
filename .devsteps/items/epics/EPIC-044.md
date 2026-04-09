Formalized creation, naming, lifecycle, registration, and cleanup of analysis documents written by Spider Web subagents. Addresses the disconnect between informal tmp/ writes (131 Markdown files, 4 competing naming patterns) and the formal .devsteps/analysis/ write_analysis_report system.

Root cause: Zod schema rejects planning-session IDs → agents fall back to informal tmp/. No lifecycle states, no DevSteps-item linkage, no cleanup mechanism.

Scope:
- Canonical output protocol (naming, lifecycle, session dirs, TTL tiers)
- Schema relaxation for planning sessions (PLAN-* IDs)
- CLI `devsteps artifacts` subcommand (status/clean/archive)
- Migration of 2 git-tracked Research Briefs to docs/research/
- Test coverage for handleWriteAnalysisReport
- Agent instruction file updates (15+ files)
- Optional: MCP resources handler for artifact URIs

Web standard (2025-2026): session-scoped dirs, MCP resources capability, tiered TTL (30d default → sprint-close archive → permanent at done).