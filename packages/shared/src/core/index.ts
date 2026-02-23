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
  estimateTokens,
  getItemCounts,
  getQuickContext,
  getRecentUpdates,
  readProjectMd,
} from './context.js';
export { type GetItemResult, getItem } from './get.js';
// Index rebuild operations
export {
  type RebuildOptions,
  type RebuildResult,
  rebuildIndex,
} from './index-rebuild.js';
// Refs-style index operations
export * from './index-refs.js';
export { type ListItemsArgs, type ListItemsResult, listItems } from './list.js';
export { type LinkItemArgs, type LinkItemResult, linkItem } from './link.js';
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
