# Systematic Code Coverage Tracker for API Migration Verification

## User Story

As a developer performing large-scale refactorings (like index.json → index/),
I need a systematic way to find and track ALL code locations using deprecated APIs,
So that I don't miss any usage sites and can verify migration completeness.

## Problem

When migrating APIs (like index.json → index-refs), we discover broken commands AFTER deployment:
- BUG-038: Discovered 8 commands still using index.json after "complete" migration
- No way to verify 100% coverage before merging
- Manual grep searches miss edge cases

## Acceptance Criteria

1. **Discovery Tool**
   - Scan codebase for deprecated API usage patterns
   - Support regex and AST-based detection
   - Generate checklist of all usage sites

2. **Progress Tracking**
   - Mark each usage site as: not-started / in-progress / migrated / verified
   - Show percentage completion
   - Identify high-risk areas (critical paths)

3. **Verification**
   - Run tests for each migrated site
   - Prevent merge until 100% verified
   - Generate migration report

## Implementation Ideas

**Option 1: grep + checklist**
- `grep -r "index.json" packages/` → generates TODO list
- Manual tracking in markdown checklist
- Simple but error-prone

**Option 2: AST-based scanner**
- Parse TypeScript AST
- Find all imports/reads of deprecated API
- Generate DevSteps tasks automatically

**Option 3: Test coverage**
- Write integration tests for each command
- Coverage report shows untested code paths
- Prevents regressions

## Value

**Time Saved**: Prevents hours of debugging production issues  
**Quality**: Ensures systematic, complete migrations
**Reusability**: Tool works for ANY large refactoring (not just index migration)

## Related Work

- BUG-038: The specific incident that motivates this story
- Future migrations: Database schema changes, API v2 transitions, etc.
