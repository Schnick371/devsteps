# Task: Implement dynamic version reading from package.json

## Objective

Replace hardcoded version strings with dynamic package.json import for both Commander.js version display and init command.

## Implementation Strategy

### Approach: Import Assertion (ESM Standard)

**Modern TypeScript ESM approach:**
```typescript
import packageJson from '../package.json' assert { type: 'json' };

program.version(packageJson.version);
```

**Advantages:**
- Native ESM support in Node.js 16.17+
- Type-safe with TypeScript
- No runtime overhead
- Works in both development and published packages

## Changes Required

### 1. `packages/cli/src/index.ts` (Line 19)

**Before:**
```typescript
program.name('devsteps')
  .description('AI-powered developer task tracking system')
  .version('0.1.0');
```

**After:**
```typescript
import packageJson from '../package.json' assert { type: 'json' };

program.name('devsteps')
  .description('AI-powered developer task tracking system')
  .version(packageJson.version);
```

### 2. `packages/cli/src/commands/init.ts` (Line 48)

**Before:**
```typescript
const newConfig: DevStepsConfig = {
  project_name: projectName,
  methodology,
  version: '0.1.0',
  ...
```

**After:**
```typescript
import packageJson from '../../package.json' assert { type: 'json' };

const newConfig: DevStepsConfig = {
  project_name: projectName,
  methodology,
  version: packageJson.version,
  ...
```

## TypeScript Configuration

Verify `tsconfig.json` supports JSON imports:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "moduleResolution": "node16"
  }
}
```

## Testing

```bash
# Build CLI
cd packages/cli && npm run build

# Test version command
node dist/index.cjs --version
# Expected: 0.7.0-next.2 (current package version)

# Test init command creates correct version in config
devsteps init test-project
cat test-project/.devsteps/config.json
# Expected: "version": "0.7.0-next.2"
```

## Acceptance Criteria

- ✅ `devsteps --version` returns version from package.json
- ✅ Init command writes correct version to `.devsteps/config.json`
- ✅ TypeScript compiles without errors
- ✅ Works in both development (`npm run dev`) and published (`npm install -g`)
- ✅ No hardcoded version strings remain in source code

## Alternative Approaches Considered

**❌ fs.readFileSync**: Requires runtime file system access, path resolution issues
**❌ require()**: Not ESM compatible
**✅ Import assertion**: Modern, type-safe, ESM standard