# Fix Context Key Race Condition - Welcome View Flash

## Problem: The `undefined` → `!undefined = true` Trap

**Root Cause:**
VS Code evaluates `when` clauses during view initialization, but context keys don't exist yet:
- Context key `devsteps.showWelcome` is `undefined` on startup
- `viewsWelcome` condition: `when: "devsteps.showWelcome"`
- JavaScript: `undefined` is falsy, but we were checking the WRONG key!
- Code was setting `hasProject` and `initialized`, but NOT `showWelcome`

**Why This Caused the Bug:**
```typescript
// OLD CODE (WRONG):
await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', hasDevSteps);
await vscode.commands.executeCommand('setContext', 'devsteps.initialized', hasDevSteps);
// ❌ devsteps.showWelcome was NEVER set!

// package.json:
"viewsWelcome": [{
  "when": "devsteps.showWelcome"  // ← This key was undefined!
}]
```

Result: `viewsWelcome` condition matched `undefined`, Welcome View appeared randomly.

## Technical Solution

### 1. Change Activation Timing
```json
// package.json
"activationEvents": ["*"]  // Load IMMEDIATELY, not "onStartupFinished"
```

### 2. Set Correct Context Key
```typescript
// extension.ts
const hasDevSteps = await checkForDevStepsDirectory();

// CRITICAL: Set the key that package.json actually uses!
await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', !hasDevSteps);
await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', hasDevSteps);
await vscode.commands.executeCommand('setContext', 'devsteps.initialized', hasDevSteps);
```

### 3. Update Directory Watcher
```typescript
devstepsWatcher.onDidCreate(async () => {
  await vscode.commands.executeCommand('setContext', 'devsteps.showWelcome', false);
  await vscode.commands.executeCommand('setContext', 'devsteps.hasProject', true);
  await vscode.commands.executeCommand('setContext', 'devsteps.initialized', true);
  // Trigger reload...
});
```

## Files Modified
- `packages/extension/package.json` - Changed activationEvents
- `packages/extension/src/extension.ts` - Set devsteps.showWelcome context key

## Key Learnings
- **Context keys are undefined by default** - must be explicitly initialized
- **Match context key names exactly** - `viewsWelcome.when` must match actual keys
- **Race conditions with async activation** - use `activationEvents: ["*"]` for immediate load
- **Half a day debugging** - The `!undefined = true` trap is subtle but deadly! 😄

## Testing
1. Open workspace WITHOUT .devsteps directory → Welcome View should appear
2. Open workspace WITH .devsteps directory → Welcome View should NOT appear
3. Run "Initialize Project" command → Welcome View should disappear after reload

## Commit Reference
`fix(STORY-035): Fix Welcome View flash via context key race condition`