# Task: Implement append-only .gitignore handling in Init

## Objective

Refactor Init command (CLI + MCP Server) to **append** `.devsteps/` entry to existing `.gitignore` instead of overwriting.

## Implementation Approach

### Research-Based Solution (2025 Best Practice)

Pattern from [StackOverflow](https://stackoverflow.com/questions/65655875):
```typescript
async function ensureGitignoreEntry(projectPath: string, entry: string) {
  const gitignorePath = join(projectPath, '.gitignore');
  
  // Read existing or start empty
  let content = '';
  if (existsSync(gitignorePath)) {
    content = readFileSync(gitignorePath, 'utf-8');
  }
  
  // Check if entry already exists (line-based comparison)
  const lines = content.split(/\r?\n/);
  const normalizedEntry = entry.trim();
  
  if (!lines.includes(normalizedEntry)) {
    // Append with proper newline handling
    const needsLeadingNewline = content && !content.endsWith('\n');
    const newContent = needsLeadingNewline 
      ? `${content}\n${normalizedEntry}\n` 
      : `${content}${normalizedEntry}\n`;
    writeFileSync(gitignorePath, newContent);
  }
}
```

### Key Principles

1. **Idempotent**: Multiple Init calls safe (check before append)
2. **Respects existing**: Never overwrites user's rules
3. **Minimal**: Only adds `.devsteps/` entry
4. **Cross-platform**: Handles `\r?\n` line endings

### Files to Modify

**1. CLI Init** - `packages/cli/src/commands/init.ts`
```typescript
// Replace lines 78-86:
// Old: const gitignore = `...\n`; writeFileSync(...);
// New: await ensureGitignoreEntry(projectPath, '.devsteps/');
```

**2. MCP Server Init** - `packages/mcp-server/src/handlers/init.ts`
```typescript
// Replace lines 85-93:
// Old: const gitignore = `...\n`; writeFileSync(...);
// New: await ensureGitignoreEntry(projectPath, '.devsteps/');
```

**3. Optional: Shared Utility**
Consider extracting to `packages/shared/src/utils/gitignore.ts`:
```typescript
export async function ensureGitignoreEntry(
  projectPath: string,
  entry: string
): Promise<void> { ... }
```

## Testing Strategy

### Manual Testing
```bash
# Test 1: Empty project
mkdir test-empty && cd test-empty
devsteps init test-empty
cat .gitignore  # Should contain: .devsteps/

# Test 2: Existing .gitignore
mkdir test-existing && cd test-existing
echo "coverage/" > .gitignore
echo "*.tmp" >> .gitignore
devsteps init test-existing
cat .gitignore  # Should contain: coverage/, *.tmp, .devsteps/

# Test 3: Idempotent
devsteps init test-existing
grep -c ".devsteps/" .gitignore  # Should be: 1 (not duplicated)
```

### Edge Cases
- Empty `.gitignore` file
- `.gitignore` without trailing newline
- Windows line endings (`\r\n`)
- Entry already exists (various formats: `.devsteps`, `.devsteps/`, etc.)

## Success Criteria

✅ Existing `.gitignore` rules preserved  
✅ Only `.devsteps/` entry added  
✅ Idempotent (multiple Init calls safe)  
✅ Cross-platform (handles `\n` and `\r\n`)  
✅ Both CLI and MCP Server updated  
✅ No user-reported data loss

## Trade-offs

**Chosen Approach (Append-only):**
- ✅ Respects user data
- ✅ Simple implementation
- ✅ Idempotent
- ⚠️ Doesn't add Node.js defaults (user responsibility)

**Alternative (Full template):**
- ⚠️ Could provide helpful defaults (`node_modules/`, `dist/`, etc.)
- ❌ Still risks overwriting
- ❌ Opinionated (not all projects need same rules)

**Recommendation**: Keep append-only. Users can add Node.js defaults themselves or use template generators.

## Documentation Updates

Update `INSTALL.md` and `README.md`:
```markdown
## .gitignore Handling

DevSteps Init adds `.devsteps/` to your `.gitignore` file (or creates it if missing).
Your existing ignore rules are preserved.

For Node.js defaults, consider adding:
- `node_modules/`
- `dist/`
- `*.log`
- `.env`
```

## Related

- **Implements**: BUG-028 (Init überschreibt .gitignore)
- **Affects**: EPIC-005 (Workflow Governance & Git Integration)
- **Priority**: High (data loss prevention)
- **Eisenhower**: Q1 (Urgent & Important)
