/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Shared helpers for extension command registration.
 */

import * as vscode from 'vscode';
import { logger } from '../outputChannel.js';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';

/**
 * Check if DevSteps is initialized in workspace.
 * Returns true + narrows type to non-null when treeDataProvider is available.
 */
export function checkDevStepsInitialized(
  treeDataProvider: DevStepsTreeDataProvider | null
): treeDataProvider is DevStepsTreeDataProvider {
  if (!treeDataProvider) {
    logger.warn('Command invoked but DevSteps not initialized (treeDataProvider is null)');
    vscode.window.showWarningMessage(
      'DevSteps not initialized. Please run "DevSteps: Initialize Project" first.'
    );
    return false;
  }
  return true;
}

/**
 * Extract a DevSteps item ID from various node structures used in tree commands.
 */
export function extractItemId(
  node?: string | { item?: { id: string }; label?: string }
): string | undefined {
  if (typeof node === 'string') return node;
  if (node?.item?.id) return node.item.id;
  if (node?.label) return node.label.split(':')[0]?.trim();
  return undefined;
}
