## Root Cause

`BUG-032.json` has `linked_items.implements: ["BUG-032"]` — a self-referential link. 
When `getItemMethodology()` processes BUG-032 (type=bug, a shared type), it traverses to
the parent (which is BUG-032 itself), and enters infinite recursion → stack overflow → the
entire flat view crashes silently (caught by try/catch → returns []).

## Fix

Remove `"BUG-032"` from `linked_items.implements` in BUG-032.json. 
BUG-032 already has the correct context link via `relates-to: ["STORY-061"]`.

Use `mcp_devsteps_update` to set the implements field to [] for BUG-032 (cannot use
mcp_devsteps_link to remove a link; use update with description/field override, or
manually via CLI `devsteps update BUG-032 --remove-link implements:BUG-032` if available).

After the fix, the flat view restores immediately without extension restart.

## Verification
1. Ensure `.devsteps/items/bugs/BUG-032.json` has `implements: []`
2. Reload VS Code extension → flat view should show all items including DOC items

## Affected Paths
- .devsteps/items/bugs/BUG-032.json