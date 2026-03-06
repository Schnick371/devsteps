/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 */

import type { ItemStatus, ItemType } from '@schnick371/devsteps-shared';

/** Legacy priority levels (computed from Eisenhower quadrant via itemLoader) */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

import * as vscode from 'vscode';

/**
 * Codicon names for work item types
 * All icons are monocolor - theme provides the color
 */
export const ITEM_TYPE_ICONS: Record<ItemType, string> = {
  // Scrum hierarchy
  epic: 'rocket', // 🚀 Large initiatives
  story: 'book', // 📖 User stories
  task: 'checklist', // ☑️ Tasks
  spike: 'beaker', // 🧪 Research spikes
  bug: 'bug', // 🐛 Bug fixes
  test: 'beaker', // 🧪 Test cases

  // Waterfall hierarchy
  requirement: 'note', // 📝 Requirements
  feature: 'lightbulb', // 💡 Features
};

/**
 * Codicon names for status indicators (optional)
 */
export const STATUS_ICONS: Record<ItemStatus, string> = {
  draft: 'circle-outline', // ○ Not started
  planned: 'clock', // 🕐 Scheduled
  'in-progress': 'sync', // 🔄 Active work
  review: 'eye', // 👁️ Under review
  done: 'check', // ✓ Completed
  blocked: 'circle-slash', // 🚫 Blocked
  cancelled: 'x', // ✗ Cancelled
  obsolete: 'archive', // 📦 Archived
};

/**
 * Theme-aware semantic color tokens for priorities
 * These automatically adapt to light/dark/high-contrast themes
 */
export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'errorForeground', // Red
  high: 'editorWarning.foreground', // Orange/Yellow
  medium: 'editorInfo.foreground', // Blue
  low: 'descriptionForeground', // Gray
};

/**
 * Theme-aware semantic color tokens for statuses
 */
export const STATUS_COLORS: Record<ItemStatus, string> = {
  'in-progress': 'charts.blue', // Blue
  done: 'charts.green', // Green
  blocked: 'charts.red', // Red
  draft: 'charts.gray', // Gray
  review: 'charts.purple', // Purple
  planned: 'charts.yellow', // Yellow
  cancelled: 'charts.orange', // Orange
  obsolete: 'disabledForeground', // Disabled gray
};

/**
 * Get monocolor icon for work item type
 * Icon automatically adapts to current theme
 */
export function getItemTypeIcon(type: ItemType): vscode.ThemeIcon {
  return new vscode.ThemeIcon(ITEM_TYPE_ICONS[type]);
}

/**
 * Get priority-colored icon for work item
 * Icon uses semantic color that adapts to theme
 */
export function getItemIconWithPriority(type: ItemType, priority: Priority): vscode.ThemeIcon {
  return new vscode.ThemeIcon(
    ITEM_TYPE_ICONS[type],
    new vscode.ThemeColor(PRIORITY_COLORS[priority])
  );
}

/**
 * Get status-colored icon for work item
 * Icon uses semantic color that adapts to theme
 */
export function getItemIconWithStatus(type: ItemType, status: ItemStatus): vscode.ThemeIcon {
  return new vscode.ThemeIcon(ITEM_TYPE_ICONS[type], new vscode.ThemeColor(STATUS_COLORS[status]));
}

/**
 * Get status icon (standalone)
 */
export function getStatusIcon(status: ItemStatus): vscode.ThemeIcon {
  return new vscode.ThemeIcon(STATUS_ICONS[status], new vscode.ThemeColor(STATUS_COLORS[status]));
}
