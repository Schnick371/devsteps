# Fix Welcome View Flash - Race Condition with Context Keys

## Problem Analysis
Welcome View **always appeared on startup** even when `.devsteps` directory existed - this was NOT normal VS Code behavior but a **race condition bug**.

## Root Cause: Context Key Race Condition
**The `undefined` → `!undefined = true` trap:**

1. **VS Code starts** → All context keys are `undefined`
2. **Views evaluate `when` clauses** → `when: "devsteps.showWelcome"` 
3. **Critical Bug:** Code was setting `devsteps.hasProject` and `devsteps.initialized` but **NOT** `devsteps.showWelcome`
4. **Result:** The `viewsWelcome` condition never properly evaluated → Welcome View appeared inconsistently

**JavaScript Truth Table:**
- `undefined` is falsy
- `!undefined` evaluates to `true` ✓
- VS Code evaluates missing context keys as `undefined`
- Therefore: `when: "devsteps.showWelcome"` with undefined key → condition matches!

## Solution: Explicit Context Key Management

**Three critical changes:**

### 1. Immediate Activation
```json
"activationEvents": ["*"]  // Was: "onStartupFinished"
```
- Extension loads BEFORE views render
- Prevents race condition window

### 2. Correct Context Key
```typescript
// Set the ACTUAL key that viewsWelcome uses!
await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', !hasDevSteps);
```
- Previously: Only set `hasProject` and `initialized`
- Now: Set `showWelcome` to match `package.json` condition

### 3. Proper Initialization Order
```typescript
// Check .devsteps directory
const hasDevSteps = await checkForDevSteps();

// IMMEDIATELY set context keys BEFORE any UI operations
await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', !hasDevSteps);
await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', hasDevSteps);
await vscode.commands.executeCommand('setContext', 'devsteps.initialized', hasDevSteps);
```

## Files Modified
- `packages/extension/package.json` - Changed activationEvents to `["*"]`
- `packages/extension/src/extension.ts` - Set `devsteps.showWelcome` context key explicitly

## Key Learnings
- **Context keys default to `undefined`** - must be explicitly set
- **Race conditions with `when` clauses** - extension must activate before view renders
- **Match context keys exactly** - `viewsWelcome.when` must match actual context key names
- **`!undefined = true`** - The silent killer of conditional UI logic
- **Half a day debugging** - Sometimes the simplest bugs are the hardest to spot! 😄

## Outcome
✅ Welcome View only appears when NO `.devsteps` directory exists
✅ No flash/flicker on startup with existing project
✅ Context keys properly initialized before UI renders
✅ Clean, deterministic behavior