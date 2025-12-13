# Documentation: ULID Architecture and Conflict Resolution

## Objective

Document ULID integration, conflict resolution strategy, and multi-agent collaboration patterns.

## Implementation

### 1. Update HIERARCHY.md

Add section explaining ULID vs ID distinction:

```markdown
## Identification Strategy

DevSteps uses a **hybrid identification system**:

### Human-Readable IDs
- Format: `TYPE-NNN` (e.g., TASK-001, STORY-042)
- Purpose: Git commits, CLI display, documentation
- Uniqueness: Counter-based, **can collide** in parallel branches

### ULIDs (Universal Unique Identifiers)
- Format: 26-char Base32 (e.g., 01EQXGPFY8BKXC9HMVS7K4FQHM)
- Purpose: Conflict resolution, merge safety, audit trail
- Uniqueness: **Always unique**, sortable by creation time
- Generation: Client-side (no server coordination needed)

### Why Both?

- **ID** for humans: Easy to reference in commits and conversations
- **ULID** for machines: Guarantees uniqueness in distributed workflows
- **Best of both**: Readable + Merge-safe

### Conflict Resolution

When merging parallel branches:
1. **Same ULID** → Last-Write-Wins (newer `modified` timestamp)
2. **Same ID, different ULIDs** → Older ULID keeps ID, newer auto-remapped
3. **Audit trail** → All changes tracked in metadata
```

### 2. Update AI-GUIDE.md

Add multi-agent collaboration guidance:

```markdown
## Multi-Agent Collaboration

DevSteps supports parallel work by multiple agents/developers:

### Safe Patterns

✅ **Multiple agents can:**
- Create items in separate branches simultaneously
- Work on different stories/tasks in parallel
- Merge without manual conflict resolution

### How It Works

1. **ULID Generation**: Each item gets unique ULID on creation
2. **LWW Merge**: Timestamps resolve concurrent edits to same item
3. **Auto-Remap**: ID collisions automatically resolved

### Best Practices

1. **Branch per Story**: Create feature branch before implementation
2. **Commit Often**: Keep work items synced to avoid staleness
3. **Pull Before Push**: Reduce merge complexity
4. **Trust Automation**: Conflict resolver handles ID collisions

### When Manual Intervention Needed

Automatic resolution works 99% of time. Manual check needed if:
- Complex linked items require relationship updates
- Business logic conflicts (not technical)
- Audit trail shows suspicious patterns
```

### 3. Create ULID Architecture Doc

```markdown
# ULID Architecture

## packages/shared/docs/ulid-architecture.md

Detailed technical documentation:
- ULID format specification
- Timestamp encoding (48 bits)
- Random component (80 bits)
- Collision probability calculations
- Performance benchmarks
- Migration strategy
```

## Validation

- [ ] Documentation clear for developers
- [ ] Examples illustrate common scenarios
- [ ] Multi-agent workflow explained
- [ ] Conflict resolution strategy documented
- [ ] Migration guide included

## Files Updated

- `.devsteps/HIERARCHY.md`
- `.devsteps/AI-GUIDE.md`
- `packages/shared/docs/ulid-architecture.md` (new)
- `README.md` (add ULID section)

## Dependencies

- Should complete after implementation tasks for accuracy