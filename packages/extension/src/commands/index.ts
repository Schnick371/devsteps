/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Extension commands — barrel: delegates to domain-specific registrers
 */

import * as vscode from 'vscode';
import type { DevStepsTreeDataProvider } from '../treeView/devstepsTreeDataProvider.js';
import { registerFilterCommands } from './filters.js';
import { registerItemActionCommands } from './item-actions.js';
import { registerItemCommands } from './items.js';
import { registerProjectCommands } from './project.js';
import { registerViewCommands } from './view.js';

export function registerCommands(
  context: vscode.ExtensionContext,
  treeDataProvider: DevStepsTreeDataProvider | null
): void {
  registerProjectCommands(context, treeDataProvider);
  registerItemCommands(context, treeDataProvider);
  registerItemActionCommands(context, treeDataProvider);
  registerViewCommands(context, treeDataProvider);
  registerFilterCommands(context, treeDataProvider);
}
