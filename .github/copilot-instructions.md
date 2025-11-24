# DevCrumbs Project - Structured Development System

Monorepo for systematic software development with task tracking and traceability.

## Architecture

**Framework-First Approach:**
- NestJS, Next.js, Prisma - follow their conventions
- Turborepo for coordinated build management
- Shared packages for central types/schemas
- Strict TypeScript + Biome for consistency

**Package Structure:**
- `shared` - Source of Truth for Types/Schemas/Utils
- `mcp-server` - MCP Protocol Handler
- `cli` - Command-line Interface
- `vscode-extension` - Editor Integration

## Quality Principles

- Atomic changes - one concern per task
- Tests with implementation - never retroactively
- Build before done - no broken commits
- Patterns maintainability - consistent across packages

---

**Note:** General development workflows see `agents/devcrumbs.agent.md` and `instructions/devcrumbs.instructions.md`
