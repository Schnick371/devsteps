## Objective
Create BATS test that validates ALL relationship types including edge cases and cross-methodology references.

## Relationship Types Coverage
**Hierarchy Relations:**
- `implements` / `implemented-by`

**Flexible Relations:**
- `relates-to` (bidirectional, symmetric)
- `depends-on` / `required-by`
- `blocks` / `blocked-by`
- `tested-by` / `tests`
- `affects` (bug impact)
- `supersedes` / `superseded-by`

**Cross-Methodology:**
- Story relates-to Feature
- Epic relates-to Requirement
- Shared Spikes between methodologies

## Test Scenarios
```bash
@test "relates-to: Bidirectional symmetric relation" {...}
@test "depends-on: Task sequencing" {...}
@test "blocks: Impediment tracking" {...}
@test "tested-by: Validation chain" {...}
@test "affects: Bug impact on Epic/Requirement" {...}
@test "supersedes: Item replacement" {...}
@test "Cross-methodology: Story relates-to Feature" {...}
@test "Multiple relation types to same item" {...}
@test "Circular relations: relates-to allowed" {...}
```

## Acceptance Criteria
- ✅ All 11 relationship types tested
- ✅ Bidirectional relations validated
- ✅ Cross-methodology relations work
- ✅ Multiple relations to same item work
- ✅ CLI handles all relation types correctly