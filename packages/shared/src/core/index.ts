/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core module barrel export
 * Re-exports all public operations from the shared core layer.
 */

export { type AddItemArgs, type AddItemResult, addItem } from './add.js';
export {
  type ArchiveItemResult,
  archiveItem,
  type PurgeItemsArgs,
  type PurgeItemsResult,
  purgeItems,
} from './archive.js';
// Auto-migration for external projects
export {
  type AutoMigrationOptions,
  checkMigrationNeeded,
  ensureFullMigration,
  ensureIndexMigrated,
  getMigrationStatusMessage,
  type MigrationCheckResult,
  type MigrationStats,
  migrateItemsDirectory,
  needsItemsDirectoryMigration,
  performMigration,
} from './auto-migrate.js';
export {
  type BulkUpdateResult,
  bulkAddTags,
  bulkRemoveTags,
  bulkUpdateItems,
} from './bulk-update.js';
export { getConfig } from './config.js';
export {
  analyzePackages,
  buildContextMeta,
  type ContextMeta,
  estimateTokens,
  formatContextAsText,
  generateProjectMd,
  getItemCounts,
  getQuickContext,
  getRecentUpdates,
  getStandardContext,
  readProjectMd,
} from './context.js';
export {
  appendDocsMapNode,
  readDocsMap,
  rebuildDocsMapShadow,
  writeDocsMap,
} from './docs-map.js';
export { type GetItemResult, getItem } from './get.js';
export {
  DocFrontmatterSchema,
  type DocFrontmatter,
  extractFrontmatter,
  type FrontmatterResult,
  type FrontmatterWarning,
} from './frontmatter.js';
export { validateWorkspacePath } from './path-guard.js';
export {
  type ClassificationResult,
  DIATAXIS_TYPES,
  type DiataxisType,
  heuristicClassify,
  MIXED_THRESHOLD,
  type ScoreVector,
} from './heuristic-classify.js';
export {
  type ClassifiedEntry,
  createSession,
  findActiveSession,
  generateSessionToken,
  type ImportSession,
  type ImportSessionFile,
  type ImportSessionStatus,
  isSessionExpired,
  readSession,
  type SplitEntry,
  validateSession,
  validateSessionToken,
  writeSession,
} from './import-session.js';
// Index rebuild operations
export {
  type RebuildOptions,
  type RebuildResult,
  rebuildIndex,
} from './index-rebuild.js';
// Refs-style index operations
export * from './index-refs.js';
export { type LinkItemArgs, type LinkItemResult, linkItem } from './link.js';
export { type ListItemsArgs, type ListItemsResult, listItems } from './list.js';
export {
  type UnlinkItemArgs,
  type UnlinkItemResult,
  unlinkItem,
} from './unlink.js';
export { type UpdateItemArgs, type UpdateItemResult, updateItem } from './update.js';
export {
  type ValidationResult,
  validateRelationConflict,
  validateRelationship,
  type WorkItem,
} from './validation.js';
