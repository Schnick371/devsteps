## Objective
Create JSON fixture files that define expected outputs for test validation.

## Fixtures to Create

### 1. `scrum-expected.json`
Complete Scrum hierarchy structure with all items and relationships:
```json
{
  "items": {
    "EPIC-001": {
      "type": "epic",
      "title": "E-Commerce Platform",
      "linked_items": {
        "implemented-by": ["STORY-001", "STORY-002", "SPIKE-001", "BUG-001"]
      }
    },
    "STORY-001": { ... },
    ...
  },
  "statistics": {
    "total": 10,
    "by_type": { "epic": 1, "story": 2, "task": 5, "spike": 1, "bug": 1 }
  }
}
```

### 2. `waterfall-expected.json`
Complete Waterfall hierarchy structure

### 3. `all-relationships-graph.json`
All relationship types with examples

## Usage in Tests
Tests compare actual output against these fixtures:
```javascript
const expected = require('../fixtures/scrum-expected.json');
const actual = await mcpCall('mcp_devsteps_status');
expect(actual.statistics.total).toBe(expected.statistics.total);
```

## Acceptance Criteria
- ✅ Scrum fixture matches test hierarchy
- ✅ Waterfall fixture matches test hierarchy
- ✅ Relationship graph covers all 11 types
- ✅ Fixtures are valid JSON
- ✅ Tests can import and use fixtures