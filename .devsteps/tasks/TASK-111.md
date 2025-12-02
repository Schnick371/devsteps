## Objective
Create comprehensive Node.js test that validates complete Scrum hierarchy creation via MCP HTTP API.

## Test Coverage
Same hierarchy as CLI test:
```
EPIC-001: E-Commerce Platform
├── STORY-001: User Authentication
│   ├── TASK-001: JWT Implementation
│   ├── TASK-002: Session Management
│   └── BUG-001: Login timeout
│       └── TASK-003: Fix session expiry
├── SPIKE-001: OAuth2 Research
│   └── relates-to → STORY-001
├── STORY-002: Product Catalog
│   ├── TASK-004: Database schema
│   └── depends-on → SPIKE-002
└── TEST-001: E2E Auth Flow
    └── tests → STORY-001
```

## MCP Tools Used
- `mcp_devsteps_init`
- `mcp_devsteps_add`
- `mcp_devsteps_link`
- `mcp_devsteps_status`
- `mcp_devsteps_trace`
- `mcp_devsteps_get`

## Test Structure
```javascript
describe('MCP Scrum Hierarchy', () => {
  test('Initialize project', async () => {...});
  test('Create Epic via mcp_devsteps_add', async () => {...});
  test('Create Stories under Epic', async () => {...});
  test('Create Spike and link with relates-to', async () => {...});
  test('Create Tasks under Story', async () => {...});
  test('Create Bug and fix Task', async () => {...});
  test('Verify via mcp_devsteps_status', async () => {...});
  test('Verify via mcp_devsteps_trace', async () => {...});
});
```

## Acceptance Criteria
- ✅ Test creates complete Scrum hierarchy via MCP
- ✅ All MCP tools execute successfully
- ✅ JSON-RPC responses validated
- ✅ File system state verified
- ✅ Status and trace commands work
- ✅ Test cleans up after itself