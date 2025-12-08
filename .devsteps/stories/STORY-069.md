# Make TreeView Cycle Detection Configurable

## User Value
Give users control over TreeView cycle detection behavior based on their hierarchy complexity and performance needs.

## Acceptance Criteria
- [ ] Setting `devsteps.treeView.enableCycleDetection` available in VS Code settings
- [ ] Default value: `true` (safe default, prevents duplicate ID errors)
- [ ] When disabled, cycle detection is skipped (performance optimization)
- [ ] Setting change triggers TreeView refresh
- [ ] Documentation explains when to disable (no bidirectional relates-to cycles)

## Context
TASK-155 implemented cycle detection using `ancestorIds` Set to prevent infinite recursion with bidirectional relationships (e.g., EPIC-002 ↔ EPIC-003 relates-to). This works perfectly but adds overhead for every node expansion.

## Use Cases

**Enable (default):**
- Projects with `relates-to` relationships between items at same level
- Bidirectional relationships exist (common in cross-functional work)
- Safety > performance (prevent "Element already registered" errors)

**Disable:**
- Large hierarchies (1000+ items) needing maximum performance
- No bidirectional relationships in data (strict parent→child only)
- Debugging/testing raw VS Code TreeView behavior

## Risks When Disabled
⚠️ If user has bidirectional relationships and disables cycle detection:
- "Element with id X is already registered" errors will occur
- TreeView may fail to expand properly
- User must re-enable setting to fix

## Success Metrics
- Setting works in both flat and hierarchical views
- No regressions when enabled (default behavior)
- Clear error messaging if disabled causes issues