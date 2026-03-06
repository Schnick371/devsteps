## Context
`chatPromptFiles` is a proposed VS Code API that, when stabilized, would enable bundling all `.prompt.md` files directly inside an agent plugin rather than requiring them to exist in the workspace's `.github/prompts/` directory.

Currently (VS Code 1.110): prompts are only available if the workspace contains `.github/prompts/*.prompt.md`. This means DevSteps prompt files must be either:
1. Committed to each user's project repo (current approach — invasive)
2. Bundled in the mcp-server package `.github/` copy (current workaround — maintenance burden)
3. Bundled via `chatPromptFiles` API in plugin.json (proposed — ideal)

## Research Questions
1. What is the current status of `chatPromptFiles` in VS Code main branch? (stable/proposed/experimental)
2. What is the GitHub issue/PR tracking this feature?
3. What is the estimated stabilization timeline (if communicated by team)?
4. What is the exact plugin.json syntax for declaring bundled prompt files?
5. Is there a polyfill or workaround available before stabilization?

## Tracking
- GitHub issue: `https://github.com/microsoft/vscode/issues/` (find and record specific issue number)
- VS Code API docs: Check `vscode.proposed.chatPromptFiles.d.ts` in vscode repo

## Success Definition
A written summary (LessonsLearned or Spike doc) documenting:
- Current API status
- Expected stabilization date or conditions
- Go/no-go recommendation for STORY-199 (plugin.json) to declare bundled prompts
- Alternative path if chatPromptFiles remains experimental long-term