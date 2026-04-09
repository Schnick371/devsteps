Create tests/integration/artifacts.bats with 4 BATS integration tests:
1. devsteps artifacts status exits 0 and lists file count
2. devsteps artifacts clean --dry-run prints files without moving them (assert original locations unchanged)
3. devsteps artifacts clean --older-than 0 moves files to tmp/archive/YYYY-MM/
4. devsteps artifacts archive <file> --item-id <ID> creates DOC item and moves file to docs/research/

Affected: tests/integration/artifacts.bats (new)