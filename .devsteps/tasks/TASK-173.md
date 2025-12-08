## Task

Update CLI, MCP Server, and Extension to pass user postfix config to `generateItemId()`.

## Implementation

### 1. CLI: `packages/cli/src/commands/index.ts`

**In `addCommand()`:**
```typescript
const config = loadConfig(devstepsDir);
const newId = generateItemId(type, index.counters[type] + 1, {
  prefixes: config.settings.item_prefixes,
  userPostfixEnabled: config.settings.user_postfix_enabled,
  userPostfixSeparator: config.settings.user_postfix_separator,
  userInitials: config.settings.default_user_initials
});
```

### 2. MCP Server: `packages/mcp-server/src/handlers/add.ts`

**Similar changes:**
```typescript
const config = loadConfig(devstepsDir);
const newId = generateItemId(type, counter + 1, {
  prefixes: config.settings.item_prefixes,
  userPostfixEnabled: config.settings.user_postfix_enabled,
  userPostfixSeparator: config.settings.user_postfix_separator,
  userInitials: config.settings.default_user_initials
});
```

### 3. Extension: `packages/extension/src/mcp-server/handlers/add.ts`

**Same pattern:**
```typescript
const config = loadConfig(devstepsDir);
const newId = generateItemId(type, counter + 1, {
  prefixes: config.settings.item_prefixes,
  userPostfixEnabled: config.settings.user_postfix_enabled,
  userPostfixSeparator: config.settings.user_postfix_separator,
  userInitials: config.settings.default_user_initials
});
```

## Dependencies

- Depends on: TASK-172 (generateItemId updated)

## Testing

```bash
# Test CLI
npm run build
devsteps add task "Test postfix" --type task

# Check generated ID format in .devsteps/index.json
```

## Acceptance Criteria

- CLI generates IDs with postfix (if enabled)
- MCP Server generates IDs with postfix (if enabled)
- Extension generates IDs with postfix (if enabled)
- All packages build successfully
- No breaking changes for disabled postfix