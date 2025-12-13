## Task

Update CLI, MCP Server, and Extension handlers to pass `config.settings.id_generation` to `generateItemId()`.

## Implementation

### 1. Shared Core: `packages/shared/src/core/add.ts`

**Update generateItemId call:**
```typescript
const itemId = generateItemId(args.type, counter, {
  prefixes: config.settings.item_prefixes,
  id_generation: config.settings.id_generation
});
```

### 2. CLI: `packages/cli/src/commands/index.ts`

**Already uses shared `addItem()` - no changes needed!**

### 3. MCP Server: `packages/mcp-server/src/handlers/add.ts`

**Already uses shared `addItem()` - no changes needed!**

### 4. Extension: `packages/extension/src/mcp-server/handlers/add.ts`

**Already uses shared `addItem()` - no changes needed!**

## Key Insight

Since all handlers now use the shared `addItem()` function from `@schnick371/devsteps-shared`, we only need to update ONE place: the shared core logic!

## Files to Update

1. `packages/shared/src/core/add.ts` - Pass id_generation config
2. (Optional) `packages/cli/src/commands/init.ts` - Add id_generation to default config
3. (Optional) `packages/mcp-server/src/handlers/init.ts` - Add id_generation to default config
4. (Optional) `packages/extension/src/mcp-server/handlers/init.ts` - Add id_generation to default config

## Init Handler Update (Optional)

**Add to config creation:**
```typescript
const config: DevStepsConfig = {
  // ... existing fields
  settings: {
    // ... existing settings
    id_generation: {
      digit_padding: 4,
      user_postfix_enabled: false,
      user_postfix_separator: '-',
    },
  },
};
```

## Dependencies

- Depends on: TASK-172 (generateItemId updated)

## Testing

```bash
# Build all packages
npm run build

# Test CLI
devsteps add task "Test ID generation"

# Check generated ID in .devsteps/index.json
cat .devsteps/index.json | grep -A 5 "Test ID generation"

# Test with custom config
echo '{"settings":{"id_generation":{"digit_padding":5}}}' > .devsteps/config.json
devsteps add task "Test 5-digit ID"
```

## Manual Testing

1. **Default (4-digit):**
   - Create task → should be `TASK-0174`

2. **Enable postfix:**
   - Edit `.devsteps/config.json`:
     ```json
     "id_generation": {
       "digit_padding": 4,
       "user_postfix_enabled": true,
       "default_user_initials": "TH"
     }
     ```
   - Create task → should be `TASK-0175-TH`

3. **Change padding:**
   - Set `digit_padding: 5`
   - Create task → should be `TASK-00176-TH`

## Acceptance Criteria

- CLI generates IDs using config.settings.id_generation
- MCP Server generates IDs using config.settings.id_generation
- Extension generates IDs using config.settings.id_generation
- All packages build successfully
- No breaking changes for existing configs
- Init creates default id_generation settings