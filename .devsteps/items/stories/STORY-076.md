# ULID Integration for Merge-Safe Work Item Identification

## User Story

**As a** developer using DevSteps with AI agents  
**I want** work items to have unique identifiers that never collide across branches  
**So that** multiple agents can work in parallel without merge conflicts

## Background

Current counter-based IDs (TASK-001, STORY-002) create conflicts when:
- Multiple Copilot sub-agents create items simultaneously
- Developers switch between feature branches
- Parallel work on different stories/tasks

**ULID solves this** by providing:
- Client-side generation (no coordination needed)
- Timestamp ordering (sortable by creation)
- Collision-proof uniqueness (128-bit)

## Acceptance Criteria

### Schema Updates
- [ ] Add `ulid` field to DevStepsItem interface
- [ ] Add `modified` timestamp for LWW conflict resolution
- [ ] Add `version` field for vector clock tracking
- [ ] Add optional `created_by`/`modified_by` for agent tracking

### Functionality
- [ ] Generate ULID on item creation (all add commands)
- [ ] Update `modified` timestamp on every update
- [ ] Preserve ULID through updates (never regenerate)
- [ ] Display both ID and ULID in get/list commands

### Validation
- [ ] Schema validation accepts ULID format
- [ ] ULID must be unique across all items
- [ ] ULID format: 26 chars Base32 (e.g., 01EQXGPFY8BKXC9HMVS7K4FQHM)

### Documentation
- [ ] Update HIERARCHY.md with ULID explanation
- [ ] Update AI-GUIDE.md with conflict resolution strategy
- [ ] Add comments explaining ULID vs ID distinction

## Technical Notes

**ULID Library:** Use `ulid-js` or `@ulid/javascript`
- Generation: `ulid()` → "01EQXGPFY8BKXC9HMVS7K4FQHM"
- Parsing: Extract timestamp for sorting/debugging

**Storage:**
- JSON: Store as string (26 chars)
- Index: Include ULID in index.json for fast lookups
- Filename: Keep ID-based filenames for human readability

## Dependencies

- Must complete before conflict resolver implementation
- Enables migration script development

## References

- [ULID Spec](https://github.com/ulid/spec)
- Shopify Payment Infrastructure (ULID adoption case study)
- Research: packages/shared/docs/ulid-research.md