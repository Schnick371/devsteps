# Simplify Priority System - Remove Dual Priority Confusion

## Problem

**Dual priority systems cause confusion:**
- `priority` field: critical/high/medium/low
- `eisenhower` field: Q1/Q2/Q3/Q4  
- Users don't understand which to use
- Extension shows colors (🔴🟠🟡🟢) mixing both systems
- Redundant tracking of urgency/importance

## Solution

**Single system: Eisenhower Matrix (renamed "Priority" in UI)**

### Why Eisenhower Matrix?
- **Industry standard**: Todoist, Monday.com, Airtable all use it
- **Better decision-making**: Forces evaluation of urgency AND importance
- **Proven framework**: Based on Eisenhower's time management principles
- **Clearer outcomes**: Each quadrant has clear action (Do/Schedule/Delegate/Eliminate)

### Color Mapping for the icon in front of the work item text in the tree view
- 🔴 Q1 (Urgent + Important) - Do First
- 🟠 Q2 (Not Urgent + Important) - Schedule  
- 🟡 Q3 (Urgent + Not Important) - Delegate
- 🟢 Q4 (Not Urgent + Not Important) - Eliminate

## Implementation Plan

### Phase 1: Schema & CLI Migration ✅ (STORY-064)
- Remove `priority` field from shared types (AddItemCommandArgs, UpdateItemCommandArgs, ListItemsCommandArgs)
- Remove `--priority` CLI flags across add/list/update/bulk operations
- Update CLI output to display Eisenhower instead of priority
- Remove priority filter logic; retain Eisenhower filters
- **Backward Compatibility**: Migration script (`remove-priority-field.ts`) available to clean existing data

### Phase 2: Documentation Update ✅ (STORY-064)
- README.md: Removed legacy priority examples; clarified Eisenhower as sole system
- Project guidance: All prompts and examples use Eisenhower only
- **Migration Timeline**: Legacy priority field will be removed v0.7.0 (Jan 2026)

### Phase 3: Data Migration (STORY-065)
- Run migration script to remove priority field from all 281+ work items
- Verify all items have valid Eisenhower value (default: not-urgent-not-important)

### Phase 4: Extension & MCP Updates (STORY-066, STORY-067)
- MCP server: Update tool descriptions and handlers
- Extension UI: Rename labels, update filters, display Eisenhower quadrant

### Phase 5: Full Documentation Sync (STORY-068)
- Update all docs, guides, examples to use Eisenhower terminology
- Remove any remaining priority system references

## Success Criteria

- Zero references to old priority system
- All work items have eisenhower value
- Extension UI shows Eisenhower colors correctly
- Documentation consistent (uses "Priority" label)
- Migration script validates all data
- CLI functional with Eisenhower-only options
- Data migration can be run safely without data loss
- Backward compatibility timeline communicated to users