# Story: Cross-Project Knowledge Sharing

## User Story
As a developer working across multiple projects, I want to import/export knowledge items between projects so that proven solutions and lessons can be reused organization-wide.

## Acceptance Criteria
- [ ] `devsteps export knowledge --format json --output knowledge-pack.json`
- [ ] `devsteps import knowledge knowledge-pack.json --merge`
- [ ] Export bundles include:
  - Knowledge items (lessons/patterns/antipatterns/decisions)
  - Related code snippets
  - Metadata + relationships
- [ ] Import strategies:
  - Merge (combine with existing)
  - Replace (overwrite conflicts)
  - Preview (dry-run before importing)
- [ ] Handle ID conflicts (auto-remap or warn)
- [ ] Preserve authorship + timestamps

## Example Workflow
```bash
# Project A: Export patterns
$ cd ~/project-a
$ devsteps export knowledge --type pattern --output patterns.json
✅ Exported 8 patterns to patterns.json

# Project B: Import patterns
$ cd ~/project-b
$ devsteps import knowledge ~/project-a/patterns.json --merge
📚 Importing 8 patterns...
  ✅ PATTERN-001 → PATTERN-015 (remapped)
  ✅ PATTERN-002 → PATTERN-016 (remapped)
  ⚠️  PATTERN-003 conflicts with existing (skipped)
✅ Imported 7 patterns
```

## Technical Notes
- JSON format with semantic versioning
- Validate schema compatibility on import
- Support partial imports (select specific items)