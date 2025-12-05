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

1. **Schema Migration** (shared) - Remove priority enum, keep eisenhower
2. **Data Migration** - Convert existing items (priority → eisenhower mapping)
3. **CLI Updates** - Replace --priority with eisenhower options
4. **MCP Updates** - Update tool descriptions and handlers
5. **Extension UI** - Rename labels, update filters, new icons
6. **Documentation** - Update all guides, prompts, examples

## Success Criteria

- Zero references to old priority system
- All work items have eisenhower value
- Extension UI shows Eisenhower colors correctly
- Documentation consistent (uses "Priority" label)
- Migration script validates all data