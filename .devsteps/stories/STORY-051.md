## User Story
As a **DevSteps developer**, I want **MCP server integration tests using Node.js** so that **I can automatically validate MCP protocol behavior and tool execution across all scenarios**.

## Acceptance Criteria
- ✅ Node.js test framework configured (Jest or vanilla Node.js)
- ✅ Test script for complete Scrum hierarchy via MCP HTTP API
- ✅ Test script for complete Waterfall hierarchy via MCP HTTP API
- ✅ Test script for all relationship types via MCP tools
- ✅ JSON-RPC 2.0 protocol validation
- ✅ Tests verify MCP responses and file system state
- ✅ Error response validation for invalid operations
- ✅ Tests can run against local MCP server

## Technical Details

### Test Structure:
```javascript
tests/integration/mcp/
├── scrum-hierarchy.test.js       # Full Scrum via MCP
├── waterfall-hierarchy.test.js   # Full Waterfall via MCP
├── all-relationships.test.js     # All relations via MCP
└── protocol-validation.test.js   # JSON-RPC compliance
```

### Test Pattern:
```javascript
describe('MCP Scrum Hierarchy', () => {
  test('Create complete Scrum hierarchy via MCP', async () => {
    // Init project
    const initResponse = await fetch('http://localhost:3098/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'mcp_devsteps_init', arguments: {...} }
      })
    });
    
    // Create Epic
    const epicResponse = await mcpCall('mcp_devsteps_add', {...});
    expect(epicResponse.result.item.id).toBe('EPIC-001');
    
    // Verify via status
    const statusResponse = await mcpCall('mcp_devsteps_status', {});
    expect(statusResponse.result).toContain('EPIC-001');
  });
});
```

## Dependencies
- MCP server must be running (port 3098)
- Node.js fetch/axios available
- Test project directory for isolation

## Why Node.js?
Research shows Node.js is optimal for MCP testing (2025):
- Matches MCP server technology stack
- Native HTTP/JSON-RPC support
- Easy async/await testing
- Can validate both protocol and functionality