Create `packages/extension/src/providers/DocCodeLensProvider.ts` — a VS Code `CodeLensProvider` that shows `📄 §3.2 · Architecture` above function declarations that have associated documentation sections.

**Behavior:**
- Label format: `📄 §3.2 · Architecture` (max 35 chars, `·` separator, no ARCH-NNN IDs in label)
- When 3+ sections: `📄 3 doc references` (collapsed GitLens-style)
- Clicking: executes `vscode.commands.executeCommand('markdown.showPreviewToSide', uri)` where uri points to the doc section line
- Activates for: TypeScript, JavaScript, Python (activationEvents: `onLanguage:typescript`, `onLanguage:javascript`, `onLanguage:python`)
- Setting: `devsteps.codeLens.enabled` (boolean, default: true) — add to `packages/extension/package.json` contributes.configuration

**Constraints:**
- Must NOT call `markdown.showPreviewToSide` directly (use `vscode.commands.executeCommand` for testability)
- Only activate in workspaces that have `.devsteps/` directory (guard in `activate()`)
- Uses `DocIndex.ts` — WI-1 must be done firstSPIKE-041 update: Remove dependency on TASK-377. STORY-229 can proceed independently using loadItemsByType('doc').filter(affected_paths) via TASK-378.