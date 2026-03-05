## Problem
The VS Code 1.110 `/compact` command can be triggered mid-conversation (auto-compact at context window limit, or manually). Between Spider Web rings, this can cause coord to lose: active DevSteps item ID, outstanding mandate IDs, current git branch, and ring phase marker.

## Fix
Add a `## Compaction Checkpoint` template section to all `coord-*.agent.md` files (`.github/agents/`):
- Instructs coord to emit a checkpoint YAML block before each ring transition
- Checkpoint format: `active_item`, `ring_phase`, `pending_mandates[]`, `git_branch`
- On session restore (post-compaction), coord detects missing state and reads the last checkpoint
- Document the checkpoint protocol in `devsteps-agent-protocol.instructions.md`

## Acceptance Criteria
- All coord agent files have compaction checkpoint section
- Protocol documented in instructions
- Manual test: simulate compaction mid-spider-web and verify coord recovers