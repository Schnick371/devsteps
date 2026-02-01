/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Work Item Node - Represents individual work items in TreeView
 */

import type { ItemType } from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import { createItemUri } from '../../decorationProvider.js';
import { getItemIconWithPriority } from '../../utils/icons.js';
import { type FilterState, TreeNode, type WorkItem } from '../types.js';
import { loadItemWithLinks } from '../utils/itemLoader.js';

export class WorkItemNode extends TreeNode {
  constructor(
    private item: WorkItem,
    private hierarchical: boolean = false,
    private filterState?: FilterState,
    private isExpanded?: boolean,
    private parentId?: string,
    private relationshipType?: string,
    private ancestorIds: Set<string> = new Set() // Track parent chain for cycle detection
  ) {
    super();
  }

  /**
   * Get simple item ID for expansion state tracking
   * Returns the basic item ID (e.g., "EPIC-008") which is used to track
   * expansion state across all contexts where this item appears.
   *
   * This ensures expansion state survives context changes - if an item
   * is expanded in one location, it will be expanded everywhere.
   */
  getId(): string {
    return this.item.id;
  }

  /**
   * Get unique TreeView ID for VS Code TreeView registration
   * Returns a context-aware unique ID (e.g., "hierarchy-root-EPIC-008" or
   * "EPIC-008-implemented-by-STORY-001") used for TreeView item registration.
   *
   * This prevents VS Code "Element already registered" errors when the same
   * item appears in multiple contexts (root, child, relationship).
   */
  getTreeViewId(): string {
    if (!this.parentId) {
      // Root level items
      return `hierarchy-root-${this.item.id}`;
    }

    // Child level: include parent and relationship type
    // Use full parent chain to ensure uniqueness across tree
    const relType = this.relationshipType || 'child';
    const ancestorChain = Array.from(this.ancestorIds).sort().join('-');
    return ancestorChain
      ? `${ancestorChain}-${relType}-${this.item.id}`
      : `${this.parentId}-${relType}-${this.item.id}`;
  }

  toTreeItem(): vscode.TreeItem {
    const hasChildren = this.hierarchical && this.hasImplementedByLinks(this.filterState);

    let collapsibleState = vscode.TreeItemCollapsibleState.None;
    if (hasChildren) {
      if (this.isExpanded !== undefined) {
        collapsibleState = this.isExpanded
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed;
      } else {
        collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      }
    }

    const treeItem = new vscode.TreeItem(`${this.item.id}: ${this.item.title}`, collapsibleState);

    treeItem.id = this.getTreeViewId();
    treeItem.contextValue = 'workItem';
    treeItem.iconPath = this.getIcon();
    treeItem.description = undefined;

    // Add visual priority indicator to tooltip
    const priorityIcons: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🔵',
      low: '⚪',
    };
    const priorityIcon = priorityIcons[this.item.priority] || '⚪';
    treeItem.tooltip = `${this.item.type.toUpperCase()} | ${this.item.status} | ${priorityIcon} Priority: ${this.item.priority}`;

    // Set resourceUri for FileDecorationProvider (colored badges in separate column!)
    treeItem.resourceUri = createItemUri(this.item.id, this.item.status, this.item.priority);

    treeItem.command = {
      command: 'devsteps.openItem',
      title: 'Open Item',
      arguments: [this.item.id],
    };

    return treeItem;
  }

  async getChildren(
    workspaceRoot: vscode.Uri,
    filterState?: FilterState,
    expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]> {
    if (!this.hierarchical) return [];

    try {
      const effectiveFilter = filterState || this.filterState;

      // Build map of child items with their relationship types
      interface ChildWithRelation {
        item: WorkItem;
        relationType: string;
      }
      const childrenWithRelations: ChildWithRelation[] = [];

      // Helper to load and track relationship type
      const loadChildWithRelation = async (childId: string, relationType: string) => {
        // Skip if child is already in parent chain (cycle detection)
        if (this.ancestorIds.has(childId)) {
          return;
        }

        const child = await loadItemWithLinks(workspaceRoot, childId);
        if (child) {
          childrenWithRelations.push({ item: child, relationType });
        }
      };

      // Load children from each relationship type
      const implementedBy = this.item.linked_items?.['implemented-by'] || [];
      for (const childId of implementedBy) {
        await loadChildWithRelation(childId, 'implemented-by');
      }

      const blockedBy = this.item.linked_items?.['blocked-by'] || [];
      for (const childId of blockedBy) {
        await loadChildWithRelation(childId, 'blocked-by');
      }

      const testedBy = this.item.linked_items?.['tested-by'] || [];
      for (const childId of testedBy) {
        await loadChildWithRelation(childId, 'tested-by');
      }

      const requiredBy = this.item.linked_items?.['required-by'] || [];
      for (const childId of requiredBy) {
        await loadChildWithRelation(childId, 'required-by');
      }

      // Include relates-to if not hidden
      if (!effectiveFilter?.hideRelatesTo) {
        const relatesTo = this.item.linked_items?.['relates-to'] || [];
        for (const childId of relatesTo) {
          await loadChildWithRelation(childId, 'relates-to');
        }
      }

      // Apply hideDone filter
      let filteredChildren = childrenWithRelations;
      if (effectiveFilter?.hideDone) {
        filteredChildren = childrenWithRelations.filter(({ item }) => item.status !== 'done');
      }

      // Build new ancestor set for children (current ancestors + this item)
      const childAncestors = new Set(this.ancestorIds);
      childAncestors.add(this.item.id);

      return filteredChildren.map(({ item, relationType }) => {
        const isExpanded = expandedHierarchyItems?.has(item.id);
        return new WorkItemNode(
          item,
          true,
          effectiveFilter,
          isExpanded,
          this.item.id,
          relationType,
          childAncestors
        );
      });
    } catch (error) {
      console.error('Failed to load child items:', error);
      return [];
    }
  }

  /**
   * Check if node has visible children based on current filter state
   * Public method for TreeDataProvider to re-evaluate collapsible state
   */
  hasVisibleChildren(filterState?: FilterState): boolean {
    const hasLinks = this.hasImplementedByLinks(filterState);
    if (!hasLinks) return false;

    // Check if any children would actually be visible (not in ancestor chain)
    const implementedBy = this.item.linked_items?.['implemented-by'] || [];
    const blockedBy = this.item.linked_items?.['blocked-by'] || [];
    const testedBy = this.item.linked_items?.['tested-by'] || [];
    const requiredBy = this.item.linked_items?.['required-by'] || [];
    const relatesTo = (!filterState?.hideRelatesTo && this.item.linked_items?.['relates-to']) || [];

    const allChildren = [...implementedBy, ...blockedBy, ...testedBy, ...requiredBy, ...relatesTo];

    // At least one child must not be in ancestor chain
    return allChildren.some((childId) => !this.ancestorIds.has(childId));
  }

  private hasImplementedByLinks(filterState?: FilterState): boolean {
    const implementedBy = this.item.linked_items?.['implemented-by'];
    const blockedBy = this.item.linked_items?.['blocked-by'];
    const testedBy = this.item.linked_items?.['tested-by'];
    const requiredBy = this.item.linked_items?.['required-by'];
    const relatesTo = this.item.linked_items?.['relates-to'];

    const hasHierarchyLinks =
      (Array.isArray(implementedBy) && implementedBy.length > 0) ||
      (Array.isArray(blockedBy) && blockedBy.length > 0) ||
      (Array.isArray(testedBy) && testedBy.length > 0) ||
      (Array.isArray(requiredBy) && requiredBy.length > 0);

    // Only count relates-to if not hidden by filter
    const hasRelatesTo =
      !filterState?.hideRelatesTo && Array.isArray(relatesTo) && relatesTo.length > 0;

    return hasHierarchyLinks || hasRelatesTo;
  }

  private getIcon(): vscode.ThemeIcon {
    // Use centralized icon system with priority-based coloring
    return getItemIconWithPriority(this.item.type as ItemType, this.item.priority);
  }
}
