## Objective
Create comprehensive BATS test that validates complete Waterfall hierarchy creation via CLI.

## Test Coverage
**Complete Waterfall Hierarchy:**
```
REQ-001: System Requirements
├── FEAT-001: Authentication Module
│   ├── TASK-006: Design phase
│   ├── TASK-007: Implementation
│   └── BUG-002: Security vulnerability
│       └── TASK-008: Patch security flaw
├── SPIKE-003: Technology Evaluation
│   └── implements → REQ-001
└── FEAT-002: Reporting Module
    ├── TASK-009: Database design
    └── depends-on → FEAT-001

TEST-002: Integration Test Suite
└── tests → FEAT-001
```

## Relationship Types Tested
- `implements` (hierarchy)
- `depends-on` (feature dependencies)
- `tested-by` (validation)
- `affects` (bug impact)

## Test Structure
```bash
@test "Initialize Waterfall test project" {...}
@test "Create Requirement" {...}
@test "Create Features under Requirement" {...}
@test "Create Spike under Requirement" {...}
@test "Create Tasks under Feature" {...}
@test "Create Bug under Requirement" {...}
@test "Link Features with depends-on" {...}
@test "Create Test item" {...}
@test "Verify hierarchy via status command" {...}
@test "Verify hierarchy via trace command" {...}
```

## Acceptance Criteria
- ✅ Test creates complete Waterfall hierarchy
- ✅ All relationship types validated
- ✅ CLI commands execute successfully
- ✅ Status output shows correct counts
- ✅ Trace shows complete hierarchy
- ✅ Test cleans up after itself