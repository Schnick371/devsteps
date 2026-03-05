## Issues

1. `AI-GUIDE.md` and `HIERARCHY.md` document the `Theme → Initiative → Epic` hierarchy as if it were already implemented. It is not. This was marked as PLANNED in the SPIKE-024 doc pass, but the diagram arrows (`BUG-011 --affects--> FEAT-002` notation) still use `affects` which is not a valid RelationType enum value.

2. The literal CLI flag `--relation affects` has been fixed. However, the diagram arrow notation `--affects-->` in lines 110–111 of AI-GUIDE.md may still mislead future implementors.

## Fix needed

- Ensure all diagrams in AI-GUIDE.md and HIERARCHY.md use valid RelationType values only
- Replace any remaining `affects` arrow notation with `relates-to`
- Verify `HIERARCHY-COMPACT.md` does not have the same issue

## Evidence (SPIKE-024 gate-reviewer ADVISORY-3)

Fixed: replaced `--affects-->` with `--relates-to-->` in:
- `.devsteps/AI-GUIDE.md` (lines 110–111)
- `packages/cli/.devsteps/AI-GUIDE.md` (lines 110–111)