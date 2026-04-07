`complete-cleanup.sh` indiscriminately removes tmp/analyst-*.md files. Once research files are promoted to DOC items via `git mv`, this script must not delete those files.

**Risk:** 28+ files currently in tmp/ would be deleted, including:
- `tmp/analyst-research-SPIKE-041-session1.md`
- `tmp/analyst-archaeology-SPIKE-041-session1.md`
- All other analyst reports from ongoing research

**Fix:**
1. Add a whitelist check: if `metadata.json` or `.devsteps-doc` sidecar exists for a file → skip deletion
2. OR: after `devsteps docs promote <file>` → `git mv` to `docs/research/` → file is out of tmp/ and safe
3. Update cleanup script to only remove files that are NOT tracked by `loadItemsByType('doc').find(i => i.affected_paths.includes(relPath))`

The research file preservation pipeline (from SPIKE-041 brief) is: `git mv tmp/analyst-X.md docs/research/` → `devsteps add --type doc` → link to SPIKE item.Done: Protective comment block added to scripts/complete-cleanup.sh. Documents that tmp/analyst-*.md and tmp/aspect-*.md MUST NOT be deleted, and provides CLI command to list unprotected research files. Commit 69d8e35. Note: active tmp/ deletion pattern does not currently exist in the script — this is preventive protection.