## Task (Optional Enhancement)

Create VS Code Settings UI that reads/writes `.devsteps/config.json` directly.

## Strategy: Config.json as Source of Truth

**NOT using VS Code workspace settings!** Instead:
- Settings UI shows current values from `.devsteps/config.json`
- Changes write directly to `.devsteps/config.json`
- IDE-independent (config.json works everywhere)

## Implementation

### 1. Settings Webview Panel

**File:** `packages/extension/src/commands/settings.ts`

```typescript
import * as vscode from 'vscode';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function openSettingsCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const configPath = join(workspaceRoot, '.devsteps', 'config.json');
  if (!existsSync(configPath)) {
    vscode.window.showErrorMessage('DevSteps not initialized');
    return;
  }

  // Read current config
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  // Create webview panel
  const panel = vscode.window.createWebviewPanel(
    'devstepsSettings',
    'DevSteps Settings',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  // Render settings form
  panel.webview.html = getSettingsHtml(config);

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.command === 'save') {
      // Update config.json
      config.settings.id_generation = message.settings.id_generation;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      vscode.window.showInformationMessage('Settings saved to .devsteps/config.json');
    }
  });
}

function getSettingsHtml(config: any): string {
  const idGen = config.settings.id_generation || {};
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>DevSteps Settings</title>
      <style>
        body { padding: 20px; font-family: var(--vscode-font-family); }
        .setting { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 300px; padding: 5px; }
        button { margin-top: 20px; padding: 10px 20px; }
      </style>
    </head>
    <body>
      <h1>DevSteps ID Generation Settings</h1>
      <p>Changes are saved to <code>.devsteps/config.json</code></p>
      
      <div class="setting">
        <label>Digit Padding (3-5):</label>
        <input type="number" id="digitPadding" min="3" max="5" value="${idGen.digit_padding || 4}">
        <p>Examples: 3=001, 4=0001, 5=00001</p>
      </div>

      <div class="setting">
        <label>
          <input type="checkbox" id="postfixEnabled" ${idGen.user_postfix_enabled ? 'checked' : ''}>
          Enable User Postfix
        </label>
      </div>

      <div class="setting">
        <label>Separator:</label>
        <select id="separator">
          <option value="-" ${idGen.user_postfix_separator === '-' ? 'selected' : ''}>- (dash)</option>
          <option value="/" ${idGen.user_postfix_separator === '/' ? 'selected' : ''}>/ (slash)</option>
          <option value="_" ${idGen.user_postfix_separator === '_' ? 'selected' : ''}>_ (underscore)</option>
        </select>
      </div>

      <div class="setting">
        <label>Your Initials (2-4 uppercase letters):</label>
        <input type="text" id="initials" pattern="[A-Z]{2,4}" value="${idGen.default_user_initials || ''}">
        <p>Example: TH, MS, JD</p>
      </div>

      <button onclick="saveSettings()">Save to config.json</button>

      <script>
        const vscode = acquireVsCodeApi();

        function saveSettings() {
          const settings = {
            id_generation: {
              digit_padding: parseInt(document.getElementById('digitPadding').value),
              user_postfix_enabled: document.getElementById('postfixEnabled').checked,
              user_postfix_separator: document.getElementById('separator').value,
              default_user_initials: document.getElementById('initials').value.toUpperCase() || undefined
            }
          };
          vscode.postMessage({ command: 'save', settings });
        }
      </script>
    </body>
    </html>
  `;
}
```

### 2. Register Command

**File:** `packages/extension/src/extension.ts`

```typescript
import { openSettingsCommand } from './commands/settings';

context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.openSettings', openSettingsCommand)
);
```

### 3. Add to package.json

```json
{
  "contributes": {
    "commands": [
      {
        "command": "devsteps.openSettings",
        "title": "DevSteps: Open Settings",
        "icon": "$(settings-gear)"
      }
    ]
  }
}
```

## User Experience

1. User clicks "DevSteps: Open Settings" command
2. Webview opens with current values from `.devsteps/config.json`
3. User changes settings in form
4. Click "Save" → writes to `.devsteps/config.json`
5. Changes immediately effective (MCP reads config.json)

## Benefits

✅ IDE-independent (config.json works everywhere)
✅ Versionable (config.json can be committed)
✅ Team-shared (same config for all team members)
✅ User-friendly (nice UI instead of manual JSON editing)

## Acceptance Criteria

- Settings panel reads from config.json
- Changes write to config.json (NOT VS Code settings)
- Validation works (digit_padding 3-5, initials 2-4 chars)
- Error handling for invalid values
- Works without breaking CLI/MCP usage