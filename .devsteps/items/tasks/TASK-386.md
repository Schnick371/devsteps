Create `packages/extension/src/docs/embedsCache.ts` — module that pre-renders DevSteps item metadata to a static JSON snapshot at extension activate time, enabling `embedPlugin.ts` to synchronously embed item data in callout boxes.

**Why needed:** `markdownItPlugins` run in the Node.js extension host (can use `fs.readFileSync`) but CANNOT make async calls (no `await`, no `vscode.commands.executeCommand`). To embed live item titles/status in callout boxes, item data must be pre-rendered as a static file.

**Cache format (`.devsteps/index/embeds-cache.json`):**
```json
{
  "STORY-042": { "id": "STORY-042", "title": "Authentication Flow", "status": "done", "type": "story" },
  "TASK-378": { "id": "TASK-378", "title": "DocIndex.ts Phase 1", "status": "draft", "type": "task" }
}
```

**Lifecycle:**
1. `buildEmbedsCache(devstepsRoot)` → reads all `.devsteps/items/*.json` → writes `embeds-cache.json`
2. Called at `activate()` (before markdownItPlugin registers)
3. FSW watches `.devsteps/items/` — on file change: re-calls `buildEmbedsCache()` → overwrites cache