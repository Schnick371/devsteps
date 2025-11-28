# Update Extension Activation Logic - Handle Conditional Loading

## Implementation Steps
1. **Remove universal context setting logic:**
   - Current: Always sets context keys in activate()
   - New: Only set context keys when extension actually activates

2. **Update Welcome View logic:**
   - Welcome View should show when extension is NOT active
   - Use `when` clause that defaults to true when extension inactive
   - Extension sets `devsteps.active: true` when it activates

3. **Handle edge cases:**
   - Commands still registered when extension inactive (Init Project button)
   - Proper error handling when commands called on inactive extension
   - Clean initialization without performance impact

## Technical Implementation
**Context Strategy:**
```typescript
// Only runs when extension actually activates
export async function activate(context: vscode.ExtensionContext) {
  // Set that extension is now active
  await vscode.commands.executeCommand('setContext', 'devsteps.active', true);
  
  // Rest of normal activation...
}
```

**Welcome View Logic:**
```json
"when": "!devsteps.active"  // Show when extension inactive
```