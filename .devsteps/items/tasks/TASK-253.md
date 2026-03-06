## Task

Modify `copyGithubFiles()` in `packages/shared/src/utils/init-helpers.ts` so that every file copied during `devsteps-init` gets devsteps metadata injected into its YAML frontmatter. This creates a retroactive baseline for modification detection.

## Approach

### Canonical Hash (no circularity)
Hash must be computed from the file content **minus** the devsteps-injected fields — otherwise embedding the hash into the file changes the content changes the hash.

```typescript
const DEVSTEPS_MANAGED_FIELDS = ['devsteps_managed', 'devsteps_version', 'devsteps_hash'];

function computeCanonicalHash(content: string): string {
  const stripped = removeFrontmatterFields(content, DEVSTEPS_MANAGED_FIELDS);
  return 'sha256:' + createHash('sha256').update(stripped, 'utf8').digest('hex');
}
```

### YAML Frontmatter Injection
For a file with frontmatter like:
```yaml
---
description: "..."
applyTo: "**"
---
```
Produce:
```yaml
---
devsteps_managed: true
devsteps_version: "1.1.0-next.2"
devsteps_hash: "sha256:abc123..."
description: "..."
applyTo: "**"
---
```

Parsing: use string-based YAML frontmatter parsing (no external YAML parser needed — delimited by `---` markers). Position devsteps fields at the TOP of frontmatter so they're clearly visible.

### Also: write `.devsteps/.github-manifest.json`
After copying all files, write or update the manifest with per-file entries:
```json
{
  "schema_version": "1",
  "last_updated": "2026-02-23T22:00:00Z",
  "files": {
    ".github/agents/devsteps-t1-coordinator.agent.md": {
      "installed_version": "1.1.0-next.2",
      "installed_at": "2026-02-23T22:00:00Z",
      "canonical_hash": "sha256:...",
      "status": "clean"
    }
  }
}
```

### Also: Add `.devsteps/backups/` to `.gitignore`
In the existing `.gitignore` append logic, add `.devsteps/backups/` to `devstepsEntries`.

## Files
- **Modify**: `packages/shared/src/utils/init-helpers.ts`