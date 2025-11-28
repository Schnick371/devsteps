# Implement Auto-Download in Extension

## Implementation Strategy

### 1. Create PackageInstaller utility
**File:** `packages/extension/src/utils/packageInstaller.ts`

```typescript
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class PackageInstaller {
  private readonly extensionPath: string;
  private readonly packagesPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.extensionPath = context.extensionPath;
    this.packagesPath = path.join(context.globalStorageUri.fsPath, 'packages');
  }

  async ensurePackagesInstalled(): Promise<void> {
    // Check if packages already installed
    if (await this.arePackagesInstalled()) {
      return;
    }

    // Show progress
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Installing DevSteps CLI and MCP Server...',
      cancellable: false
    }, async (progress) => {
      await this.installPackages(progress);
    });
  }

  private async arePackagesInstalled(): Promise<boolean> {
    const cliPath = path.join(this.packagesPath, 'node_modules/@schnick371/devsteps-cli');
    const mcpPath = path.join(this.packagesPath, 'node_modules/@schnick371/devsteps-mcp-server');
    return fs.existsSync(cliPath) && fs.existsSync(mcpPath);
  }

  private async installPackages(progress: vscode.Progress<{message?: string}>): Promise<void> {
    // Create packages directory
    fs.mkdirSync(this.packagesPath, { recursive: true });

    // Install via npm
    progress.report({ message: 'Downloading packages from npm...' });
    
    const installCommand = 'npm install @schnick371/devsteps-cli @schnick371/devsteps-mcp-server --prefix ' + this.packagesPath;
    
    await this.execAsync(installCommand);
    
    // Configure MCP in VS Code settings
    await this.configureMCP();
  }

  private async configureMCP(): Promise<void> {
    const config = vscode.workspace.getConfiguration('mcpServers');
    const mcpPath = path.join(this.packagesPath, 'node_modules/@schnick371/devsteps-mcp-server/dist/index.js');
    
    await config.update('devsteps', {
      command: 'node',
      args: [mcpPath],
      disabled: false
    }, vscode.ConfigurationTarget.Global);
  }

  private execAsync(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      child_process.exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
```

### 2. Call on Extension Activation
**File:** `packages/extension/src/extension.ts`

```typescript
import { PackageInstaller } from './utils/packageInstaller.js';

export async function activate(context: vscode.ExtensionContext) {
  // Install packages if needed
  const installer = new PackageInstaller(context);
  try {
    await installer.ensurePackagesInstalled();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to install DevSteps packages: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Continue with rest of activation...
}
```

## Acceptance Criteria
- ✅ Extension detects first activation
- ✅ Downloads packages from npm to global storage
- ✅ Configures MCP in VS Code settings
- ✅ Shows progress notification
- ✅ Handles errors gracefully
- ✅ Skips download if already installed