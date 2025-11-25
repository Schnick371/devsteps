# MCP Server Architecture Research - COMPLETE

## Executive Summary

**Recommended Approach**: Bundle MCP server as separate Node.js process spawned by VS Code extension using `McpStdioServerDefinition`.

**Key Finding**: VS Code provides native MCP integration via `vscode.lm.registerMcpServerDefinitionProvider` API (introduced 2025). No need for manual `mcp.json` configuration - extensions can register servers programmatically.

## Research Findings (2025 Best Practices)

### Option 1: Extension-Bundled MCP Server (RECOMMENDED) ✅

**Architecture:**
- MCP server runs as separate Node.js process
- Extension spawns server via `McpStdioServerDefinition`
- Communication via stdin/stdout (stdio transport)
- Server bundled with extension, auto-starts on activation

**Implementation:**
```typescript
// In extension.ts
vscode.lm.registerMcpServerDefinitionProvider('devsteps', {
  provideMcpServerDefinitions: async () => {
    const serverPath = path.join(extensionPath, 'dist', 'mcpServer', 'index.js');
    
    return [new vscode.McpStdioServerDefinition(
      'devsteps-mcp',
      'node',
      [serverPath],
      { WORKSPACE_ROOT: workspacePath },
      '1.0.0'
    )];
  }
});
```

**Pros:**
- ✅ Native VS Code integration (official API)
- ✅ Automatic lifecycle management (start/stop/restart)
- ✅ No manual configuration required
- ✅ Works in all VS Code contexts (local, remote, web)
- ✅ Built-in health monitoring and error recovery
- ✅ Sampling API access (LLM requests)
- ✅ OAuth authentication support
- ✅ Development mode with debugging support

**Cons:**
- ⚠️ Separate build configuration needed (esbuild/webpack)
- ⚠️ Cannot use `vscode` API in server process
- ⚠️ Slightly larger extension bundle size

### Option 2: Standalone HTTP Server

**Architecture:**
- MCP server runs as HTTP service (Streamable HTTP transport)
- Extension connects via `McpHttpServerDefinition`
- Can be deployed separately or bundled

**Pros:**
- ✅ Can be deployed remotely
- ✅ Multiple clients can connect
- ✅ Better for resource-intensive operations

**Cons:**
- ❌ More complex setup and deployment
- ❌ Network configuration required
- ❌ Additional security considerations
- ❌ Overkill for local-only tools

### Option 3: Manual mcp.json Configuration

**Architecture:**
- User manually configures server in `.vscode/mcp.json`
- VS Code autodiscovers and launches

**Pros:**
- ✅ Simple for development/testing
- ✅ No extension code needed

**Cons:**
- ❌ Requires manual user configuration
- ❌ Poor user experience
- ❌ No programmatic control
- ❌ Not suitable for distributed extensions

## Architecture Decision

**Selected: Option 1 (Extension-Bundled MCP Server)**

**Rationale:**
1. **Native Integration**: VS Code provides official API specifically for this use case
2. **Zero Configuration**: Users get MCP server automatically when installing extension
3. **Best UX**: Seamless experience, no manual setup required
4. **Full Feature Set**: Access to sampling, workspace roots, OAuth
5. **Industry Standard**: Microsoft's recommended approach (used in official examples)

## Technical Implementation Details

### Build Configuration (esbuild)

**TWO separate build targets required:**

1. **Extension Bundle** (`dist/extension.cjs`):
   - Main extension code
   - Uses `vscode` API
   - Platform: `node`

2. **MCP Server Bundle** (`dist/mcpServer/index.js`):
   - Separate entry point
   - **CANNOT** use `vscode` API (external: ['vscode'])
   - Uses `@modelcontextprotocol/sdk`
   - Platform: `node`, format: `cjs`

**Example esbuild config:**
```javascript
// Build MCP server separately
await esbuild.build({
  entryPoints: ['src/mcpServer/index.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'dist/mcpServer/index.js',
  external: ['vscode'], // CRITICAL!
});
```

### Server Lifecycle

**Activation:**
- Extension activates (`onStartupFinished` or `workspaceContains:.devsteps`)
- Register MCP server definition provider
- VS Code spawns server process automatically

**Health Monitoring:**
- VS Code monitors server process
- Auto-restart on crashes
- Error logs in MCP output channel

**Shutdown:**
- Server process terminates when extension deactivates
- Graceful shutdown via SIGINT/SIGTERM

### Development Mode

**2025 Feature: Built-in debugging support!**

```json
// .vscode/mcp.json (dev mode)
{
  "servers": {
    "devsteps": {
      "dev": {
        "watch": "src/**/*.ts",
        "debug": { "type": "node" }
      }
    }
  }
}
```

- File watcher auto-restarts server
- Node.js debugger attaches automatically
- View logs: MCP: List Servers → Show Output

### MCP Features to Implement

**Phase 1 (MVP):**
1. **Tools**: Expose DevSteps operations (add, list, update, link)
2. **Resources**: Provide work item files as context
3. **Prompts**: Slash commands for common workflows

**Phase 2:**
4. **Sampling**: LLM requests for analysis/summarization
5. **Roots**: Workspace folder information
6. **Icons**: Custom icons for work item types

**Phase 3:**
7. **OAuth**: GitHub integration for sync
8. **Resource Templates**: Dynamic resource queries

## Risk Assessment & Mitigations

### Risk 1: Build Complexity
- **Impact**: Medium
- **Mitigation**: Document build process clearly, provide npm scripts
- **Status**: Manageable (similar to current esbuild setup)

### Risk 2: Process Communication Overhead
- **Impact**: Low
- **Mitigation**: stdio is efficient, minimal latency
- **Status**: Acceptable (proven in production by Microsoft)

### Risk 3: Extension Size Increase
- **Impact**: Low (~50-100KB for MCP SDK)
- **Mitigation**: Bundle optimization, tree-shaking
- **Status**: Acceptable (current: 321KB → estimated: 370KB)

### Risk 4: No `vscode` API Access in Server
- **Impact**: Medium
- **Mitigation**: Pass necessary data via environment variables, use shared package
- **Status**: Design limitation, workaround available

## Performance Benchmarks (Estimated)

**Startup Time:**
- Extension activation: ~50ms (current)
- MCP server spawn: ~100ms
- Total cold start: ~150ms ✅ (acceptable)

**Memory Usage:**
- Extension process: ~20MB
- MCP server process: ~15MB
- Total: ~35MB ✅ (reasonable)

**Operation Latency:**
- stdio communication: <5ms
- Tool execution: 10-100ms (depends on operation)
- Total roundtrip: 15-105ms ✅ (acceptable for AI agent)

## Follow-up Tasks Created

Based on research findings, created implementation tasks:

- **TASK-025**: Implement MCP Server Provider (register via VS Code API)
- **TASK-026**: Build MCP Server Bundle (separate esbuild config)
- **TASK-027**: Implement MCP Tools (add, list, update, search, link)
- **TASK-028**: Implement MCP Resources (work item files as context)
- **TASK-029**: Implement MCP Prompts (slash commands)
- **TASK-030**: Development Mode Setup (debugging, watch mode)

## Proof-of-Concept

**Created**: Minimal working prototype in `/poc/mcp-server-poc/`

**Demonstrates:**
- McpStdioServerDefinition registration
- Basic tool implementation (list items)
- stdio transport communication
- Error handling and logging

**Validation:** ✅ Server spawns successfully, tools invocable from Copilot

## References & Sources

**Official Documentation:**
- VS Code MCP Developer Guide: https://code.visualstudio.com/api/extension-guides/ai/mcp
- MCP Specification: https://modelcontextprotocol.io/specification/2025-06-18
- VS Code Extension Sample: https://github.com/microsoft/vscode-extension-samples/blob/main/mcp-extension-sample

**Best Practices (2025):**
- Medium Guide: "Creating a VS Code MCP Server" (CodeLeft)
- YouTube: "VS Code + MCP Servers Getting Started" (James Montemagno)
- Marketplace: vscode-mcp-server extension (reference implementation)

**Key API References:**
- `vscode.lm.registerMcpServerDefinitionProvider`
- `vscode.McpStdioServerDefinition`
- `vscode.McpHttpServerDefinition`
- `@modelcontextprotocol/sdk`

## Conclusion

**Go/No-Go Decision:** ✅ GO

**Confidence Level:** HIGH (9/10)

**Recommended Next Steps:**
1. Start with TASK-025 (MCP Server Provider)
2. Implement basic tools (TASK-027)
3. Test integration with GitHub Copilot
4. Iterate based on user feedback

**No Blockers Identified**: All technical challenges have clear solutions with proven patterns.