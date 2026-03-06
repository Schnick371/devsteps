# MCP Resource: devsteps://project-context

## Motivation

Claude Code and other advanced MCP clients support **resource auto-fetch** —
they read resources with `annotations.priority >= 0.8` automatically at session start.
Adding `devsteps://project-context` as a high-priority resource means zero-effort
context loading for Claude Code users without any `copilot-instructions.md` changes.

## Changes: `packages/mcp-server/src/server.ts`

### 1. Add resource to `listResourcesHandler`

```typescript
{
  uri: "devsteps://project-context",
  name: "DevSteps Project Context",
  description: "Current project overview: tech stack, active items, conventions. Auto-loaded by supporting clients.",
  mimeType: "text/plain",
  annotations: {
    audience: ["assistant"],
    priority: 1.0
  }
}
```

### 2. Handle read in `readResourceHandler`

```typescript
case "devsteps://project-context": {
  const ctx = await getQuickContext(cwd, devstepsDir);
  return { contents: [{ uri, mimeType: "text/plain", text: formatContextAsText(ctx) }] };
}
```

### 3. Add `formatContextAsText(ctx)` in `handlers/context.ts`

Formats QuickContext as readable markdown, suitable for embedding in an AI prompt.
Includes: project name, description, tech stack, item counts, active items, conventions.

## Resource Subscription (Optional — do if time permits)

If `annotations.priority > 0` clients may subscribe to change notifications.
When `.devsteps/index.json` changes (detected via fs.watch), send:
```typescript
server.notification({ method: "notifications/resources/updated", params: { uri: "devsteps://project-context" } });
```

Mark subscription support in capabilities: `resources: { subscribe: true, listChanged: true }`.

## Acceptance Criteria

- [ ] `devsteps://project-context` appears in resources list
- [ ] Reading the resource returns formatted project context markdown
- [ ] `annotations.priority: 1.0` and `audience: ["assistant"]` set correctly
- [ ] `formatContextAsText()` extracted to helper (not inlined in server.ts)
- [ ] Existing resources (`devsteps://docs/hierarchy`, `devsteps://docs/ai-guide`) unaffected