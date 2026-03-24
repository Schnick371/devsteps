Mechanical copy — no editing. Execute after Tasks A-2, A-3, and A-4 are complete.

Files to copy (mcp-server canonical → root and cli):

```
cp packages/mcp-server/.github/agents/devsteps-R0-coord.agent.md .github/agents/
cp packages/mcp-server/.github/agents/devsteps-R0-coord.agent.md packages/cli/.github/agents/
cp packages/mcp-server/.github/agents/devsteps-R0-coord-sprint.agent.md .github/agents/
cp packages/mcp-server/.github/agents/devsteps-R0-coord-sprint.agent.md packages/cli/.github/agents/
cp packages/mcp-server/.github/agents/devsteps-R3-exec-planner.agent.md .github/agents/
cp packages/mcp-server/.github/agents/devsteps-R3-exec-planner.agent.md packages/cli/.github/agents/
cp packages/mcp-server/.github/instructions/devsteps-agent-protocol.instructions.md .github/instructions/
cp packages/mcp-server/.github/instructions/devsteps-agent-protocol.instructions.md packages/cli/.github/instructions/
```

Note: AGENT-DISPATCH-PROTOCOL.md is ROOT-ONLY — no copies exist and none should be created. Do NOT sync it.

## Done When
For each of the 4 modified files: diff packages/mcp-server/.../<file> .github/.../<file> exits 0 AND diff packages/mcp-server/.../<file> packages/cli/.../<file> exits 0.