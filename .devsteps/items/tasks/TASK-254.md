## Task

Create `packages/shared/src/utils/update-copilot-files.ts` — the core update logic. Depends on TASK for `backup-github-files.ts` and the hash injection (init-helpers modification).

## Interfaces

```typescript
export interface UpdateCopilotFilesOptions {
  sourceGithubDir: string;  // package's .github dir (source of truth)
  projectRoot: string;      // target workspace root
  devstepsDir: string;      // .devsteps/ path
  scope?: ('agents' | 'instructions' | 'prompts')[];  // default: all
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;          // default: true
  packageVersion?: string;
}

export type FileUpdateStatus =
  | 'updated'
  | 'created'
  | 'unchanged'
  | 'skipped_user_modified'
  | 'dry_run_would_update'
  | 'dry_run_would_create';

export interface FileUpdateResult {
  path: string;             // relative path, e.g. ".github/agents/devsteps-t1-coordinator.agent.md"
  status: FileUpdateStatus;
  userModified?: boolean;
  diffLines?: number;
}

export interface UpdateCopilotFilesResult {
  updated: FileUpdateResult[];
  summary: {
    total: number;
    updated: number;
    created: number;
    unchanged: number;
    skippedUserModified: number;
  };
  backupDir?: string;
  dryRun: boolean;
  devstepsVersion: string;
  error?: string;
}
```

## Algorithm

```
function updateCopilotFiles(options):
  // 1. Backup first (if !dryRun && backup)
  if not dryRun and backup:
    backupResult = backupGithubFiles(githubDir, devstepsDir)
    if not backupResult.success:
      throw new Error('Backup failed, aborting update: ' + backupResult.error)

  // 2. Load manifest
  manifest = loadManifest(devstepsDir)

  // 3. For each source file (filtered by scope):
  for each sourceFile in collectFiles(sourceGithubDir, scope):
    destPath = join(projectRoot, '.github', sourceFile.rel)

    // 4. Detect modification
    if exists(destPath):
      detectionResult = detectModification(destPath, sourceFile.canonical_hash, manifest)
      
      if detectionResult.userModified and not force:
        record SKIPPED_USER_MODIFIED
        continue

      sourceHash = computeCanonicalHash(readFile(destPath))
      if sourceHash == computeCanonicalHash(readFile(sourceFile.abs)):
        record UNCHANGED
        continue

      // File differs, not user-modified (or force): update
      if not dryRun:
        injectFrontmatterAndWrite(destPath, sourceFile.content, packageVersion)
        updateManifest(manifest, sourceFile.rel, sourceFile.canonical_hash)
      record UPDATED (or DRY_RUN_WOULD_UPDATE)

    else:
      // New file
      if not dryRun:
        injectFrontmatterAndWrite(destPath, sourceFile.content, packageVersion)
        updateManifest(manifest, sourceFile.rel, sourceFile.canonical_hash)
      record CREATED (or DRY_RUN_WOULD_CREATE)

  // 5. Save manifest
  if not dryRun:
    saveManifest(devstepsDir, manifest)

  return UpdateCopilotFilesResult
```

## Modification Detection Logic (cross-validated)

```
function detectModification(filePath, sourceHash, manifest):
  currentContent = readFile(filePath)
  currentHash = computeCanonicalHash(currentContent)
  embedded = parseFrontmatterField(currentContent, 'devsteps_hash')
  manifestEntry = manifest.files[filePath]

  // Both signals agree: clean
  if manifestEntry?.canonical_hash == currentHash AND embedded == currentHash:
    return { userModified: false, confidence: 'high' }

  // Embedded hash in file matches current content (manifest may be missing/stale)
  if embedded == currentHash AND !manifestEntry:
    return { userModified: false, confidence: 'medium' }

  // Content diverged from any known base: user modified
  return { userModified: true, confidence: determineConfidence(manifestEntry, embedded, currentHash) }
```

## Files
- **Create**: `packages/shared/src/utils/update-copilot-files.ts`
- **Modify**: `packages/shared/src/utils/index.ts` — add re-exports