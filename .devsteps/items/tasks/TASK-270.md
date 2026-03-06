## Implementation

### 1. Add `normalizeMarkdown` utility

Create or extend `packages/shared/src/utils/text.ts`:

```typescript
/**
 * Normalizes escape sequences in strings coming from MCP tool invocations.
 * MCP clients (e.g. Copilot ≥ 1.0.0) may transmit literal backslash-n
 * instead of real newline characters inside description strings.
 */
export function normalizeMarkdown(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '');
}
```

Export from `packages/shared/src/utils/index.ts`.

### 2. Apply in `add.ts`

```typescript
// Before writing:
const description = normalizeMarkdown(
  args.description || `# ${args.title}\n\n<!-- Add detailed description here -->\n`
);
writeFileSync(descriptionPath, description);
```

### 3. Apply in `update.ts`

```typescript
if (args.description) {
  writeFileSync(descriptionPath, normalizeMarkdown(args.description));
} else if (args.append_description) {
  const existing = existsSync(descriptionPath) ? readFileSync(descriptionPath, 'utf-8') : '';
  writeFileSync(descriptionPath, existing + normalizeMarkdown(args.append_description));
}
```

### 4. Add unit tests

In `packages/shared/src/core/add.test.ts` or a new `text.test.ts`:
- Test that `normalizeMarkdown` converts `\\n` → real newline
- Test that `normalizeMarkdown` is idempotent (already-real newlines unchanged)
- Test roundtrip: add item with `\\n` in description → `.md` file contains real newlines

### 5. CHANGELOG

Update `packages/shared/CHANGELOG.md` and `packages/mcp-server/CHANGELOG.md`.