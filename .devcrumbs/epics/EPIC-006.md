# Project Health & Data Integrity

## Vision
DevCrumbs automatically detects and reports project data problems, guiding users to maintain healthy, consistent project structures - like a "doctor" for your project data.

## Business Value
- **Prevent data corruption** - Catch problems before they spread
- **Maintain consistency** - Ensure methodology rules followed
- **Build confidence** - Users trust their project data
- **Save time** - Auto-detect issues vs manual inspection

## Problem
Currently DevCrumbs creates new items with validation (EPIC-005), but doesn't check EXISTING data for:
- Invalid relationships violating methodology
- Orphaned items without connections
- Broken references to deleted items
- Index inconsistencies
- Status logic violations
- Metadata quality issues

## Solution
Extend `devcrumbs doctor` command to comprehensively check project health across multiple dimensions.

## Stories

1. **Relationship Validation & Integrity** (Q1 - High Priority)
   - Validate existing links against methodology rules
   - Find orphaned items (no connections)
   - Find broken references (point to non-existent items)
   - Detect asymmetric links

2. **Index Consistency & Repair** (Q2)
   - Check index.json vs item files sync
   - Validate counters and stats
   - Auto-repair with --fix flag

3. **Status & Workflow Logic** (Q2)
   - Epic done but children draft
   - Blocked without blocked-by link
   - Obsolete without superseded_by

4. **Metadata Quality Checks** (Q3)
   - Missing required fields
   - Invalid enum values
   - File system integrity

## Success Criteria
- Developer runs `devcrumbs doctor` and gets clear report
- Problems found with actionable fixes
- --fix flag auto-repairs common issues
- Zero false positives (accurate detection)

## Related Work
- EPIC-005: Validates NEW relationships (prevention)
- EPIC-006: Validates EXISTING data (detection)
