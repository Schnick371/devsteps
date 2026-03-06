## Task

Create `/packages/shared/src/utils/backup-github-files.ts` — the foundational backup utility.

## Implementation

### Interfaces
```typescript
export interface BackupManifest {
  createdAt: string;         // ISO 8601
  packageVersion: string;
  sourceGithubDir: string;
  files: Record<string, { sizeBytes: number; sha256: string }>;
}

export interface BackupResult {
  success: boolean;
  backupDir: string;
  timestamp: string;
  fileCount: number;
  files: string[];
  error?: Error;
}

export interface BackupOptions {
  maxBackups?: number;   // default: 5
  packageVersion?: string;
  skip?: boolean;        // honour --no-backup flag
}
```

### Core Function
```typescript
export function backupGithubFiles(
  githubDir: string,     // .github/ absolute path
  devstepsDir: string,   // .devsteps/ absolute path
  options?: BackupOptions
): BackupResult
```

### Algorithm
1. Collect all `devsteps-*` files from `agents/`, `instructions/`, `prompts/`
2. Create `.devsteps/backups/YYYY-MM-DDTHH-MM-SS/` directory
3. Mirror subdir structure, `copyFileSync` each file, compute SHA-256
4. Write `manifest.json` with per-file checksums
5. Prune oldest backups — keep last `maxBackups` (default 5) via `readdirSync` + sort + `rmSync`
6. On **any** error: clean up partial backup dir, return `{ success: false, error }`

### Timestamp format
`2026-02-23T21-15-00` — colons replaced with `-` for filesystem safety.

### Critical: Backup failure = abort
Callers MUST check `result.success` and abort update if false (unless `skip: true`).

## Files
- **Create**: `packages/shared/src/utils/backup-github-files.ts`
- **Modify**: `packages/shared/src/utils/index.ts` — add re-exports