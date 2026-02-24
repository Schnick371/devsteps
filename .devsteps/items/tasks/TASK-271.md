# Fix .github/copilot-instructions.md

## Why First

This is the only mechanism that is **fully zero-effort for users** — VS Code Copilot
auto-includes `.github/copilot-instructions.md` in *every* chat turn. No user action needed.

## Current Problems

The file is currently inaccurate and thin:
- Mentions **NestJS, Next.js, Prisma** — none of which are in this project
- No instruction to load project context at session start
- Generic language that doesn't help AI understand the monorepo structure

## Changes Required

1. **Replace the Architecture section** with the actual tech stack:
   - Node.js + TypeScript ESM throughout
   - Turborepo monorepo
   - `@modelcontextprotocol/sdk` v1.x for MCP protocol
   - `commander` (CLI), `zod` (validation), `biome` (lint/format), `vitest` (tests)
   - esbuild for bundling (each package has own `esbuild.{js,mjs,cjs}`)
   - Packages: `shared` (types/schemas/core), `mcp-server`, `cli`, `extension`

2. **Add Session Start section:**
   ```markdown
   ## Session Start
   At the beginning of each new chat session, call `devsteps_context` (level: 'quick')
   to load current project context before responding to any task or question.
   ```

3. **Add DevSteps Usage section** — key MCP tools, item hierarchy (Epic→Story→Task),
   status flow (draft→planned→in-progress→review→done), never edit .devsteps/ directly.

## Acceptance Criteria

- [ ] No NestJS / Next.js / Prisma references remain
- [ ] Tech stack section reflects actual dependencies from `package.json` files
- [ ] Session Start instruction is present and references `devsteps_context`
- [ ] DevSteps workflow rules summarized (hierarchy, status, git conventions)
- [ ] File stays under 200 lines so it doesn't inflate context window