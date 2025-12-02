## Objective
Setup Node.js test framework for MCP HTTP API integration testing.

## Implementation Steps
1. Create test directory: `tests/integration/mcp/`
2. Add test dependencies (if using Jest) or use vanilla Node.js with fetch
3. Create helper functions for MCP JSON-RPC calls
4. Add npm script for running MCP tests
5. Configure test to start MCP server automatically or use existing instance
6. Create example test to verify setup

## Files to Create/Modify
- `tests/integration/mcp/helpers.js`: MCP call wrappers
- `tests/integration/mcp/setup.test.js`: Verification test
- `package.json`: Add test script

## Helper Pattern:
```javascript
async function mcpCall(toolName, params) {
  const response = await fetch('http://localhost:3098/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: toolName, arguments: params }
    })
  });
  return response.json();
}
```

## Acceptance Criteria
- ✅ Test framework configured
- ✅ Helper functions for MCP calls
- ✅ Example test passes
- ✅ `npm run test:mcp` executes MCP tests
- ✅ Tests can connect to MCP server

## References
- Node.js fetch API (built-in since Node 18)
- JSON-RPC 2.0 specification
- Existing test-mcp-client.js pattern