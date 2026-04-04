/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * See LICENSE.md for full license text
 */

import * as vscode from 'vscode';

/**
 * Check whether any open workspace folder contains a `.devsteps` directory.
 * Used as a guard to prevent the extension from doing work in non-DevSteps workspaces
 * (especially relevant when activated via `onLanguage:markdown`).
 */
export async function hasDevStepsRoot(
  workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined
): Promise<boolean> {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false;
  }
  for (const folder of workspaceFolders) {
    const devstepsPath = vscode.Uri.joinPath(folder.uri, '.devsteps');
    try {
      await vscode.workspace.fs.stat(devstepsPath);
      return true;
    } catch {
      // .devsteps not found in this folder — continue checking others
    }
  }
  return false;
}
