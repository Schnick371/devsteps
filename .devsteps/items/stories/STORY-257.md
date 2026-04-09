Extend the Zod validation in packages/shared/src/schemas/analysis.ts to also accept PLAN-{session} prefix IDs. This unblocks the formal write path for all ad-hoc planning sessions, removing the root cause that forced informal tmp/ fallback writes.

Correct build sequence after schema change: (1) packages/shared rebuild, (2) packages/mcp-server rebuild, (3) npm test both.

Affected: packages/shared/src/schemas/analysis.ts (regex extension), packages/mcp-server (rebuild required)