Create `packages/extension/src/preview/embedPlugin.ts` — the markdown-it plugin (registered via `contributes.markdown.markdownItPlugins`) that renders DevSteps work item callout boxes and code-example boxes within TSD documents.

**Supported container types:**

| Syntax | Rendered as | Example |
|--------|-------------|---------|
| `::: story STORY-NNN` | Work item callout card | Story ID + title + status from embeds-cache.json |
| `::: task TASK-NNN` | Task callout card | Task ID + title + status |
| `::: spike SPIKE-NNN` | SPIKE investigation box | SPIKE ID + title |
| `::: code-example` | Code listing box | Code shown in styled container (no live data) |
| `:::` | Container close | Closes any open container |

**Technical:**
- Uses `markdown-it-container` npm package (must be added to `packages/extension/package.json` dependencies)
- Reads `embeds-cache.json` via Node.js `fs.readFileSync` (markdownItPlugin runs in Node.js host)
- `hasDevStepsRoot()` guard: if no `.devsteps/` → plugin does nothing (returns empty HTML for containers)
- CSS styles injected via `contributes.markdown.previewScripts` or inline style attributes

**Code in docs policy enforcement:**
Code MUST NOT appear in TSD prose. The `::: code-example` box is the ONLY exception. This policy is a documentation EDITORIAL RULE, not enforced by the plugin.

**Dependencies:** Requires TASK-386 (embedsCache.ts) + BUG-074 (onLanguage:markdown must be fixed)
**Extends:** STORY-226 description (STORY-226 was planned for embedPlugin.ts — update its description to match this new scope)