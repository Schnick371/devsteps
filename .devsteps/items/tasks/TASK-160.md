# Rename CLI Flag: --eisenhower → --priority

## Context

STORY-064 removed legacy `priority` field and made Eisenhower the sole priority system. However, `--eisenhower` is verbose and less intuitive than `--priority` for end users.

## Goal

Rename CLI flag to `--priority` while keeping Eisenhower Matrix as the underlying system. Maintain backward compatibility with deprecated `--eisenhower` alias.

## Implementation

### CLI Changes (packages/cli/src/index.ts)

**Add command:**
```typescript
.option('-p, --priority <quadrant>', 'Priority: urgent-important|not-urgent-important|urgent-not-important|not-urgent-not-important')
.option('--eisenhower <quadrant>', '[DEPRECATED] Use --priority instead')
```

**Update command:**
```typescript
.option('-p, --priority <quadrant>', 'New priority')
.option('--eisenhower <quadrant>', '[DEPRECATED] Use --priority instead')
```

**List command:**
```typescript
.option('-p, --priority <quadrant>', 'Filter by priority')
.option('--eisenhower <quadrant>', '[DEPRECATED] Use --priority instead')
```

### Handler Logic (packages/cli/src/commands/index.ts)

```typescript
// Normalize: accept both --priority and --eisenhower (deprecated)
const eisenhowerValue = options.priority || options.eisenhower;

if (options.eisenhower) {
  console.warn(chalk.yellow('⚠️  --eisenhower is deprecated. Use --priority instead.'));
}

// Use eisenhowerValue throughout
```

### Documentation Updates

- README.md: Already uses "Priority" terminology ✅
- Init templates: Update examples to use `--priority`
- Help text: Mark `--eisenhower` as deprecated

## Testing

```bash
# New flag (primary)
devsteps add task "Test" --priority urgent-important

# Old flag (deprecated, shows warning)
devsteps add task "Test" --eisenhower urgent-important
⚠️  --eisenhower is deprecated. Use --priority instead.

# List with new flag
devsteps list --priority urgent-important
```

## Backward Compatibility

- `--eisenhower` kept as alias until v0.8.0 (March 2026)
- Deprecation warning shown when used
- Internal field remains `eisenhower` in JSON/schemas
- No breaking changes to existing scripts using `--eisenhower`

## Success Criteria

- CLI accepts both `--priority` and `--eisenhower` (with warning)
- Help text shows `--priority` as primary option
- Examples use `--priority` exclusively
- Internal `eisenhower` field unchanged
- Deprecation warning clear and actionable
