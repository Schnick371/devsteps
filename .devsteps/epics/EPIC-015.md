# Epic: Transform MCP Server Bundling to GitLens Architecture Model

## Business Value
Transform DevSteps extension to match GitLens/GitKraken's proven zero-configuration MCP server bundling architecture, eliminating installation friction and providing seamless user experience.

## Current State (Problematic)
- MCP server installed via `npx` from npm registry
- Separate package download required on activation
- User must wait for installation or manually configure
- Platform-specific issues with global npm installations
- Inconsistent behavior across VS Code, Cursor, Windsurf
- Extension size: ~50KB + separate MCP download

## Target State (GitLens Model)
- MCP server bundled directly within extension package
- Zero external dependencies at runtime
- Automatic registration via `vscode.lm.registerMcpServerDefinitionProvider`
- Instant activation - no download delays
- Consistent behavior across all platforms
- Extension size: ~500KB (includes bundled MCP server)

## Research Findings

### GitLens/GitKraken Architecture
1. **Bundled MCP Server**: Included in extension package (v17.5+)
2. **Native VS Code API**: Uses `vscode.lm.registerMcpServerDefinitionProvider`
3. **Zero Configuration**: Auto-starts on extension activation
4. **Dual Deployment**: Bundled (VS Code) + Manual (Cursor/Windsurf)
5. **Platform Detection**: Automatic binary path resolution
6. **Extension Storage**: Uses `ExtensionContext.globalStorageUri` for downloads

### Technical Implementation
- Two separate esbuild targets (extension + MCP server)
- stdio transport for MCP communication
- No `vscode` API access in MCP server process
- Bundle size: ~4MB (GitKraken CLI + MCP server)
- Lifecycle managed by VS Code automatically

## Success Criteria
- ✅ Extension installs and activates instantly
- ✅ MCP server starts automatically without user action
- ✅ No npm installation delays
- ✅ Works on Windows, macOS, Linux, WSL2
- ✅ Compatible with VS Code, Cursor, Windsurf
- ✅ Extension package size under 1MB
- ✅ Zero manual configuration required

## Dependencies
- VS Code API: `vscode.lm.registerMcpServerDefinitionProvider`
- MCP SDK: `@modelcontextprotocol/sdk` (bundled)
- Build tools: esbuild for dual-target bundling

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Extension size increase | Low | Bundle optimization, tree-shaking |
| Build complexity | Medium | Document build process, provide scripts |
| No `vscode` API in server | Medium | Pass data via env vars, shared package |
| Platform-specific issues | Low | Test on all platforms before release |

## References
- GitLens v17.5+ release notes
- VS Code MCP Developer Guide
- GitKraken MCP Documentation
- DevSteps SPIKE-001 (MCP Architecture Research)

## Implementation Phases
1. **Phase 1**: Research & Architecture Design (SPIKE)
2. **Phase 2**: Build System Transformation
3. **Phase 3**: Extension Integration
4. **Phase 4**: Testing & Validation
5. **Phase 5**: Documentation & Deployment