## Problem
`copilot-instructions.md` and related instruction files have fallen behind VS Code 1.109/1.110 changes. Specific gaps identified by research:

### Missing: VS Code 1.109 Changes
- **Background agents (stable)**: Background agent execution stabilized in 1.109 — instructions should document the workflow implication for long-running exec-impl/exec-test tasks
- **Edit mode deprecation**: Edit mode is being deprecated in 1.110 — remove any references or workarounds for Edit mode from agent documentation

### Missing: VS Code 1.110 Changes
- **New slash commands**: `/create-skill`, `/create-agent`, `/create-instruction` — add to entry point routing table in copilot-instructions.md
- **Agent Plugin system**: @agentPlugins invocation pattern and `chat.plugins.paths` — reference STORY-199 for full implementation

### Phantom Framework References (devsteps-typescript-implementation.instructions.md)
- References to NestJS — not used in this project (Node.js 22 + TypeScript ESM only)
- References to Next.js — not used (no web frontend framework; webview is plain HTML/CSS)
- These phantom references may confuse models into suggesting incorrect frameworks

## Fix
1. Update `copilot-instructions.md`:
   - Add `/create-skill`, `/create-agent`, `/create-instruction` to entry point routing
   - Remove edit mode references
   - Add background agent stability note
2. Update `devsteps-typescript-implementation.instructions.md`:
   - Remove NestJS references
   - Remove Next.js references
   - Reinforce: Node.js 22+ ESM, no framework

## Acceptance Criteria
- No NestJS or Next.js references in TypeScript implementation instructions
- Background agent note present in copilot-instructions.md
- New 1.110 slash commands documented
- Edit mode references removed## Impl (2026-03-06)
- `copilot-instructions.md`: Background Agents note (VS Code 1.109+) added; /create-agent, /create-instruction, /create-skill slash commands documented in Entry Point Routing
- `devsteps-typescript-implementation.instructions.md`: Replaced phantom NestJS/Next.js Framework Conventions section with Node.js 22+ ESM monorepo context
- No edit mode references found to remove
- Gate PASS: 0 instructional framework refs, 1 background-agent note, 3 slash commands documented