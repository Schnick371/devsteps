# Story: Temporary File Management Enforcement - Pre-Commit Validation

## User Value

**As a** DevSteps developer,  
**I want** automated prevention of temporary files in project root,  
**so that** repository stays clean per documented Copilot standards.

## Context

The new `temporary-files.instructions.md` defines strict output location rules:
- **NEVER** create temp files in project root
- Designated locations: `Tests/`, `.devsteps/reports/`, `Logs/`
- **Prohibited patterns**: `*-REPORT-*.md`, `EPIC-*.md`, `STORY-*.md`, `BUG-*.md` in root

## Acceptance Criteria

### 1. Pre-Commit Hook
- [ ] Git hook: `.git/hooks/pre-commit`
- [ ] Detect prohibited files in root directory:
  - `*-COMPLETION-REPORT.md`
  - `*-REPORT-*.md`
  - `TEST-REPORT-*.md`
  - `STORY-*.md`, `EPIC-*.md`, `BUG-*.md`, `TASK-*.md`
  - `TestResults.xml` (belongs in `Tests/`)
- [ ] Block commit if violations detected
- [ ] Show helpful error message with correct location

### 2. Doctor Command Integration
- [ ] CLI: `devsteps doctor --check-files`
- [ ] Scan for misplaced temporary files
- [ ] Group violations by type:
  - Test outputs
  - AI-generated reports
  - Work item documentation
  - Build artifacts
- [ ] Suggest correct locations

### 3. Automated Cleanup
- [ ] CLI: `devsteps cleanup --temp-files`
- [ ] Move misplaced files to correct locations:
  - `TestResults.xml` → `Tests/`
  - `*-REPORT-*.md` → `.devsteps/reports/` (or delete with confirmation)
  - Work item files → Report as error (use MCP tools instead)
- [ ] Dry-run mode: `--dry-run` (show what would be moved)
- [ ] Interactive mode: Confirm each move

### 4. .gitignore Validation
- [ ] Verify `.gitignore` includes temporary file patterns
- [ ] Auto-generate missing patterns:
  ```gitignore
  # Temporary AI-Generated Reports
  *-COMPLETION-REPORT.md
  *-REPORT-*.md
  TEST-REPORT-*.md
  STORY-*.md
  EPIC-*.md
  BUG-*.md
  TASK-*.md
  
  # Test outputs
  TestResults.xml
  Tests/*.trx
  !Tests/TestResults.xml
  ```

### 5. Output Location Guide
- [ ] CLI: `devsteps help --output-locations`
- [ ] Display reference table:
  | File Type | Correct Location | Example |
  |-----------|------------------|---------|
  | Test Results | `Tests/` | `Tests/TestResults.xml` |
  | AI Reports | `.devsteps/reports/` | `.devsteps/reports/sprint-summary.md` |
  | Logs | `Logs/` | `Logs/Tasks/build.log` |
  | Work Items | `.devsteps/items/` | Use MCP tools only |

### 6. VS Code Extension Integration
- [ ] Workspace validation on extension activation
- [ ] Show warning notifications for misplaced files
- [ ] Quick fix: "Move to correct location"
- [ ] Status bar indicator: "✓ File hygiene clean"

### 7. Configuration
- [ ] `.devsteps/config.json`:
  ```json
  {
    "fileHygiene": {
      "enforceOutputLocations": true,
      "autoCleanup": false,
      "prohibitedRootPatterns": [
        "*-REPORT-*.md",
        "EPIC-*.md",
        "STORY-*.md"
      ]
    }
  }
  ```

## Definition of Done

- Pre-commit hook implemented and tested
- CLI commands work correctly
- VS Code extension integration complete
- Unit tests pass
- Integration tests added
- Documentation updated
- No linting errors
- Committed with conventional format

## Technical Implementation

**Packages affected:**
- `packages/cli/src/commands/doctor.ts` - File checking
- `packages/cli/src/commands/cleanup.ts` - File movement
- `packages/extension/src/fileHygiene.ts` - VS Code integration
- `packages/shared/src/validation/file-locations.ts` - Validation logic

**Pre-Commit Hook Example:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

PROHIBITED_PATTERNS=(
  "*-REPORT-*.md"
  "EPIC-*.md"
  "STORY-*.md"
  "BUG-*.md"
  "TASK-*.md"
  "TestResults.xml"
)

for pattern in "${PROHIBITED_PATTERNS[@]}"; do
  if git diff --cached --name-only | grep -E "^${pattern}$"; then
    echo "ERROR: Temporary file in root: $pattern"
    echo "See: .github/instructions/temporary-files.instructions.md"
    exit 1
  fi
done
```

## Dependencies

- None (standalone validation)

## Reference

Source: `.github/instructions/temporary-files.instructions.md`

## Estimated Effort

**Complexity:** Medium
**Timeline:** 3-4 days
**Risk:** Low