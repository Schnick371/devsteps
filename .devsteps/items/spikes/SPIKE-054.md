## Background
Since VS Code v1.104, MCP server `instructions` are read from the MCP protocol and included in the base prompt. An MCP server can provide usage guidance that the LLM sees automatically.

## Research Questions
1. How does `instructions` capability work in @modelcontextprotocol/sdk?
2. Could we use it for Spider Web workflow hints?
3. Would server-level instructions conflict with .github/instructions files?
4. Max length / best practice for MCP instructions?
5. Can instructions be dynamic (workspace-specific)?

## Key Sources
- VS Code v1.104 release notes
- @modelcontextprotocol/sdk ServerOptions.instructions

## Acceptance Criteria
- [ ] Findings documented
- [ ] If beneficial: implementation story created