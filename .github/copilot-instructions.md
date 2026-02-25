# DevSteps Project — Structured Development System

AI-powered task tracking and traceability for software projects, delivered as MCP server, CLI, and VS Code extension.

## Session Start

At the beginning of each new chat session, call `devsteps_context` (level: `'quick'`) to load current project context before responding to any task or question. If PROJECT.md is stale (>24 h), suggest running `devsteps context generate` to refresh it.

## Tech Stack

**Runtime / Language:**
- Node.js 22+, TypeScript ESM throughout (no CommonJS in src)
- `esbuild` per-package for bundling (each package has its own `esbuild.{js,mjs,cjs}`)
- `npm workspaces` for monorepo (no Turborepo, no NestJS, no Next.js, no Prisma)

**Key Dependencies:**
- `@modelcontextprotocol/sdk` v1.22 — MCP protocol, tools/resources/prompts capability
- `zod` — schema validation (source of truth in `packages/shared`)
- `commander` + `chalk` + `ora` — CLI
- `pino` + `pino-pretty` — structured logging (MCP server)
- `prom-client` — Prometheus metrics (MCP server)
- `@biomejs/biome` — lint + format (replaces ESLint + Prettier)
- `vitest` + `bats` — unit tests + CLI integration tests

**Package Structure:**
- `packages/shared` — Source of Truth: Zod schemas, core business logic, types, utils
- `packages/mcp-server` — MCP Protocol Server: tools, resources, prompts capability
- `packages/cli` — Command-line Interface (`devsteps` binary)
- `packages/extension` — VS Code Extension (webview + TreeView + MCP manager)

## DevSteps Workflow Rules

**Item hierarchy (Scrum default):**
- Epic → Story | Spike
- Story → Task | Bug
- Bug → Task

**Status flow:** `draft` → `planned` → `in-progress` → `review` → `done`

**NEVER edit `.devsteps/` directly** — always use `devsteps_*` MCP tools or the CLI.

**Git conventions:** `type(scope): subject` + footer `Implements: ID`
Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
Common scopes: `cli`, `mcp-server`, `shared`, `extension`

## Quality Principles

- Atomic changes — one concern per task
- Tests with implementation — never retroactively
- Build before done — no broken commits (`npm run build && npm test`)
- Biome for all formatting/linting — run `npm run format` before commit

---

**Agents:** `.github/agents/` · **Prompts:** `.github/prompts/` · **Instructions:** `.github/instructions/`
