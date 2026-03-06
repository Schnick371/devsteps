## Goal

Fix the degraded `category` field and introduce an indexed, filterable `by-category` dimension — the highest-ROI change for AI retrieval with no breaking changes.

## Scope

1. **Normalize `category` controlled vocabulary**: Define an enum of 8–10 canonical values (e.g., `platform`, `api`, `cli`, `extension`, `mcp-server`, `testing`, `devops`, `research`, `documentation`). Update Zod schema from `z.string()` to `z.enum([...]).default('general')` with backward-compat.

2. **Migration script**: One-time normalization of all 669+ items from 40+ ad-hoc values (e.g., `vscode`, `VS Code Extension`, `extension` → `extension`; `CLI`, `cli` → `cli`; etc.) using `mcp_devsteps_update` batch mode.

3. **`by-category` index**: Add a `by-category/` directory to `.devsteps/index/` (parallel to `by-type/`, `by-status/`, `by-priority/`). Update `addItem`, `updateItem`, `deleteItem` in `index-refs-core.ts` to maintain it.

4. **MCP + CLI filter**: Add `category` filter to `ListItemsArgs` and `ListCommandOptions`. Wire `devsteps list --type epic --category platform` to resolve via index (O(1)).

5. **TreeView group-by-category**: New view mode in `devstepsTreeDataProvider.ts` alongside flat/hierarchical modes. Show coverage badge. Hide mode if 0% items have non-general category.

## Evidence (SPIKE-024)

- 63.2% of 669 items use category `'general'` (semantic null)
- 40+ distinct values with case inconsistencies (research brief §5)
- Retrieval miss rate: ~45% today; this reduces it significantly
- O(n) scan cost eliminated by by-category index

## Links

- implements SPIKE-024
- relates-to STORY-197 (classification taxonomy — orthogonal, not competing)