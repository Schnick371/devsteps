Create `packages/extension/src/providers/DocHoverProvider.ts` — a VS Code `HoverProvider` that shows a documentation excerpt popup when hovering over a function that has a `📄` CodeLens annotation.

**Behavior:**
- On hover over a function name: popup shows `**§3.2 Architecture**\n> {2-line preview of section}\n\n[📖 View Documentation](command:devsteps.openDocSection?...)`
- Clicking link: executes `devsteps.openDocSection` command → calls `markdown.showPreviewToSide`
- `MarkdownString.isTrusted = true` required for command links
- Register `devsteps.openDocSection` command in `extension.ts` alongside this provider

**Constraints:**
- `isTrusted = true` is required — document the security consideration in code comment
- Only activate in workspaces that have `.devsteps/` directory
- Uses `DocIndex.ts` — WI-1 must be done firstSPIKE-041 update: Remove dependency on TASK-377. STORY-230 can proceed independently using loadItemsByType('doc').filter(affected_paths) via TASK-378.