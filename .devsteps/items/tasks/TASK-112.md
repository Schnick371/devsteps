## Objective
Create comprehensive Node.js test that validates complete Waterfall hierarchy creation via MCP HTTP API.

## Test Coverage
Same hierarchy as CLI test:
```
REQ-001: System Requirements
├── FEAT-001: Authentication Module
│   ├── TASK-006: Design
│   ├── TASK-007: Implementation
│   └── BUG-002: Security issue
│       └── TASK-008: Security patch
├── SPIKE-003: Technology Evaluation
└── FEAT-002: Reporting Module
    └── depends-on → FEAT-001
```

## MCP Tools Used
- `mcp_devsteps_init` (with methodology: waterfall)
- `mcp_devsteps_add`
- `mcp_devsteps_link`
- `mcp_devsteps_status`
- `mcp_devsteps_trace`

## Test Structure
```javascript
describe('MCP Waterfall Hierarchy', () => {
  test('Initialize Waterfall project', async () => {...});
  test('Create Requirement via mcp_devsteps_add', async () => {...});
  test('Create Features under Requirement', async () => {...});
  test('Create Spike under Requirement', async () => {...});
  test('Create Tasks under Feature', async () => {...});
  test('Link Features with depends-on', async () => {...});
  test('Verify via mcp_devsteps_status', async () => {...});
  test('Verify via mcp_devsteps_trace', async () => {...});
});
```

## Acceptance Criteria
- ✅ Test creates complete Waterfall hierarchy via MCP
- ✅ All MCP tools execute successfully
- ✅ JSON-RPC responses validated
- ✅ Waterfall methodology enforced
- ✅ Status and trace commands work
- ✅ Test cleans up after itself