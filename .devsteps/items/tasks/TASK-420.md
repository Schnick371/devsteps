## Task
Unit-Tests für alle vier bisher ungetestetem Copilot-File-Utils.

Pattern: mkdtempSync + afterEach(rmSync) wie in packages/shared/src/utils/__tests__/context.test.ts

## Units to test
- copyGithubFiles: kopiert Dateien, überschreibt nur managed-files, lässt unmanaged unberührt
- updateCopilotFiles: stale detection, dry_run gibt nur Delta zurück statt zu schreiben
- injectDevstepsComment: YAML frontmatter Annotation korrekt
- backupGithubFiles: Backup-Struktur und Restore

## Acceptance Criteria
- Alle Tests green
- Coverage >80% für diese Utils
- Kein echtes Filesystem außerhalb tmp/