# Story: Research GitLens/GitKraken MCP Bundling Implementation

## User Story
As a **DevSteps developer**, I need to **deeply understand GitLens/GitKraken's MCP bundling architecture** so that I can **replicate their proven zero-configuration approach**.

## Acceptance Criteria
- [ ] Analyze GitLens extension source code for MCP bundling patterns
- [ ] Document GitKraken CLI installation flow and storage strategy
- [ ] Identify VS Code MCP APIs used (`vscode.lm.*`)
- [ ] Map stdio transport communication patterns
- [ ] Understand platform-specific binary resolution
- [ ] Document dual deployment strategy (bundled vs manual)
- [ ] Analyze esbuild configuration for dual-target bundling
- [ ] Measure GitLens extension bundle size and composition
- [ ] Document deeplink installation mechanism
- [ ] Identify error handling and fallback strategies

## Research Questions
1. How does GitLens download and store the GitKraken CLI?
2. What triggers MCP server installation during extension activation?
3. How is platform detection handled (Windows, macOS, Linux)?
4. What happens if MCP server fails to start?
5. How does the bundled vs manual mode decision work?
6. What esbuild configuration produces the MCP server bundle?
7. How large is the final extension package?
8. What dependencies are bundled vs external?

## Deliverables
1. **Architecture Document**: Complete technical specification
2. **Code Samples**: Key implementation patterns from GitLens
3. **Comparison Matrix**: GitLens vs current DevSteps architecture
4. **Implementation Checklist**: Step-by-step transformation plan
5. **Risk Analysis**: Platform-specific issues and mitigations

## Technical Notes
- GitLens v17.5+ introduced bundled MCP server
- Uses `ExtensionContext.globalStorageUri` for downloads
- GitKraken CLI (`gk`) provides MCP server functionality
- GitHub Issue #4357 documents installation implementation
- VS Code MCP API introduced in v1.101.0

## References
- GitLens GitHub: https://github.com/gitkraken/vscode-gitlens
- GitKraken MCP Docs: https://help.gitkraken.com/mcp
- VS Code MCP API: https://code.visualstudio.com/api/extension-guides/ai/mcp
- GitLens Issue #4357: MCP server installation flow

## Success Metrics
- Complete understanding of GitLens architecture
- Documented implementation checklist ready for execution
- All research questions answered
- Team alignment on transformation approach