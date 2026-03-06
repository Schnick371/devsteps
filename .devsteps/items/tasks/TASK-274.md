# MCP Prompts Capability

## Specification (MCP 2025-06-18)

MCP `prompts` capability lets servers expose reusable prompt templates.
In VS Code Copilot these appear as slash commands (e.g., `/devsteps/onboard`).
Claude Code and Cursor also render them in their UI.

**Official spec:** https://modelcontextprotocol.io/specification/2025-06-18/server/prompts

## Prompts to Expose

### 1. `devsteps/onboard`
Loads project context for a new AI session. Called at session start.

Returns:
- PROJECT.md content
- Quick context (item counts, recent changes)
- Key conventions (hierarchy, status flow, commit format)
- Current in-progress items

### 2. `devsteps/sprint-review`
Summarises the current sprint state. Includes all in-progress + done this week.

### 3. `devsteps/commit-message`
Arguments: `item_id` (required), `change_summary` (optional).
Returns a conventionally-formatted commit message pre-filled with item ID.

## Implementation

### 1. `packages/mcp-server/src/server.ts`

Add `prompts` to capabilities:
```typescript
capabilities: { tools: {}, resources: {}, prompts: { listChanged: true } }
```

Add import for new request schemas:
```typescript
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
```

### 2. New file: `packages/mcp-server/src/handlers/prompts.ts`

```typescript
export async function listPrompts() { /* return prompt list */ }
export async function getPrompt(name: string, args: Record<string, string>, cwd: string, devstepsDir: string) { /* return messages */ }
```

### 3. Wire handlers in `server.ts`

```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: await listPrompts() }));
server.setRequestHandler(GetPromptRequestSchema, async (req) => getPrompt(req.params.name, req.params.arguments ?? {}, cwd, devstepsDir));
```

## Acceptance Criteria

- [ ] `capabilities.prompts` present in server capabilities response
- [ ] `ListPromptsRequestSchema` handler returns 3 prompt definitions
- [ ] `GetPromptRequestSchema` handler returns correct messages for each prompt
- [ ] `devsteps/onboard` embeds live PROJECT.md content (via `getQuickContext`)
- [ ] `devsteps/commit-message` with `item_id` returns correctly formatted commit message
- [ ] Handler extracted to `handlers/prompts.ts` (not inlined in server.ts)
- [ ] Unit tests for all 3 prompts