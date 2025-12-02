## Objective
Create Node.js test that validates ALL relationship types via MCP, including cross-methodology relations.

## Relationship Types Coverage
All 11 relationship types via `mcp_devsteps_link`:
- `implements` / `implemented-by`
- `relates-to` (bidirectional)
- `depends-on` / `required-by`
- `blocks` / `blocked-by`
- `tested-by` / `tests`
- `affects` (bug impact)
- `supersedes` / `superseded-by`

## Test Scenarios
```javascript
test('relates-to: Symmetric bidirectional', async () => {...});
test('depends-on: Task sequencing', async () => {...});
test('blocks: Impediment tracking', async () => {...});
test('tested-by: Validation chain', async () => {...});
test('affects: Bug impact on Epic', async () => {...});
test('supersedes: Item replacement', async () => {...});
test('Multiple relations to same item', async () => {...});
test('Cross-methodology: Story relates-to Feature', async () => {...});
```

## MCP Error Validation
Test invalid relationships return proper errors:
```javascript
test('Invalid: Task implements Epic directly', async () => {
  const response = await mcpCall('mcp_devsteps_link', {
    source_id: 'TASK-001',
    target_id: 'EPIC-001',
    relation_type: 'implements'
  });
  expect(response.error).toBeDefined();
  expect(response.error.suggestion).toBeDefined();
});
```

## Acceptance Criteria
- ✅ All 11 relationship types tested via MCP
- ✅ Validation errors properly returned
- ✅ AI-friendly error messages verified
- ✅ Cross-methodology relations work
- ✅ JSON-RPC protocol compliance maintained