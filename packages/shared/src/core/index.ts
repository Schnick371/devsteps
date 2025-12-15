export { addItem, type AddItemArgs, type AddItemResult } from './add.js';
export { getItem, type GetItemResult } from './get.js';
export { getConfig } from './config.js';
export { listItems, type ListItemsArgs, type ListItemsResult } from './list.js';
export { updateItem, type UpdateItemArgs, type UpdateItemResult } from './update.js';
export {
  archiveItem,
  type ArchiveItemResult,
  purgeItems,
  type PurgeItemsArgs,
  type PurgeItemsResult,
} from './archive.js';
export {
  getQuickContext,
  analyzePackages,
  getItemCounts,
  getRecentUpdates,
  readProjectMd,
  estimateTokens,
} from './context.js';
export {
  bulkUpdateItems,
  bulkAddTags,
  bulkRemoveTags,
  type BulkUpdateResult,
} from './bulk-update.js';
export { validateRelationship, type ValidationResult, type WorkItem } from './validation.js';

// Refs-style index operations
export * from './index-refs.js';

// Auto-migration for external projects
export {
  checkMigrationNeeded,
  ensureIndexMigrated,
  getMigrationStatusMessage,
  performMigration,
  needsItemsDirectoryMigration,
  migrateItemsDirectory,
  ensureFullMigration,
  type AutoMigrationOptions,
  type MigrationCheckResult,
  type MigrationStats,
} from './auto-migrate.js';

// Index rebuild operations
export {
  rebuildIndex,
  type RebuildResult,
  type RebuildOptions,
} from './index-rebuild.js';
