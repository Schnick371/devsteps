Add a script and CI validation to prevent future numbering drift and mirror mismatches across:
- `.github/prompts`
- `packages/cli/.github/prompts`
- `packages/mcp-server/.github/prompts`

Checks:
1) `devsteps-01-project-context.prompt.md` exists in all 3 trees
2) no `devsteps-90-project-context.prompt.md` exists anywhere
3) doc-system prompts 57/58/59 exist in all 3 trees
4) file content hash parity for mirrored prompt/agent files
5) optional warning for numbering gaps vs registry convention

Output format:
- human-readable table + non-zero exit code on hard failures

Acceptance criteria:
- script in `scripts/verify-copilot-files.sh`
- integrated in existing verification or test task
- documented in `TESTING.md` or contributor docs

Parent story: STORY-277