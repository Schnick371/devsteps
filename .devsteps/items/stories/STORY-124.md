# Story: VS Code MCP Gallery Listing — Track 3

## Goal

Make the DevSteps VS Code extension discoverable in the VS Code `@mcp` gallery (Extensions view → `@mcp`) so users can install it with one click, and MCP tools appear automatically in GitHub Copilot without any manual `mcp.json` configuration.

## Context

The VS Code `@mcp` gallery (shipped in VS Code 1.105, Oct 2025) is backed by an MCP server registry. Extensions with the `mcp` tag and proper `contributes.mcpServerDefinitionProviders` appear here. DevSteps currently:
- ✅ Has `contributes.mcpServerDefinitionProviders` declared
- ❌ May be missing the `mcp` category/tag in `package.json`
- ❌ `activationEvents` may not include `onStartupFinished`
- ⚠️ Programmatic provider API has known UI limitation (not shown in "MCP SERVERS - INSTALLED", tracked in VS Code #279704)

## Acceptance Criteria

- [ ] Extension `package.json` includes `"mcp"` in `categories` array
- [ ] `activationEvents` includes `"onStartupFinished"` 
- [ ] Extension is published to VS Code Marketplace with MCP-related keywords
- [ ] After VSIX installation, Copilot shows DevSteps tools without any user-side configuration
- [ ] MCP server is discoverable via **MCP: List Servers** command
- [ ] `.vscode/mcp.json` in project root configured for developer UX (workspace-level)
- [ ] Investigate and document MCP registry submission process

## Implementation Plan

### Step 1 — Audit extension package.json
Add `"mcp"` to `categories`. Add MCP-related `keywords`. Verify `activationEvents` has `"onStartupFinished"`.

### Step 2 — Workspace MCP config
`.vscode/mcp.json` → add devsteps server entry for workspace-local developer experience (uses `node dist/mcp-server.js` or HTTP URL from Track 1).

### Step 3 — Research MCP registry
Investigate how to submit to the GitHub/VS Code MCP server registry (exact process not documented as of 2026-02-25). Check: `github.com/github/github-copilot-mcp-servers` or equivalent registry endpoint.

### Step 4 — Publish
Ensure `vsce publish` includes all required metadata. Verify post-publish that extension appears in `@mcp` gallery search.

## Known Limitation
Per vogella.com (2025-10) and VS Code GitHub issue #279704: programmatic `registerMcpServerDefinitionProvider` servers do NOT appear in the "MCP SERVERS - INSTALLED" Extensions view section. This is a VS Code limitation being tracked upstream. The workaround is MCP: List Servers command — document this for users.

## References
- https://code.visualstudio.com/docs/copilot/customization/mcp-servers (2026-02-04)
- https://code.visualstudio.com/updates/v1_99 (VS Code 1.99, March 2025)
- https://github.com/microsoft/vscode/issues/279704
