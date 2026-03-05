## Goal

Add a first-class `initiative` field to `ItemMetadata` alongside a governed vocabulary file (`.devsteps/groups.json`) — the meta-level strategic grouping above Epic.

## Scope

1. **Schema**: Add `initiative: z.string().optional()` to `ItemMetadata` Zod schema. Add `initiative` to `DevStepsIndex.items` entries for O(1) lookup.

2. **`groups.json` vocabulary**: Create `.devsteps/groups.json` with governed initiative/theme names. MCP update handler validates incoming `initiative` values against this vocab.

3. **MCP + CLI**: Add `initiative` as a filter param in `ListItemsArgs` and `devsteps list --initiative <slug>` CLI flag.

4. **New prompt**: `devsteps-15-meta-hierarchy.prompt.md` — already delivered in SPIKE-024 research output. Review and finalize for production use.

5. **New agent**: `devsteps-R4-worker-meta-hierarchy.agent.md` — already delivered. Review and finalize.

6. **Instructions integration**: `devsteps-meta-hierarchy.instructions.md` — already delivered. Add to `copilot-instructions.md` instruction list.

7. **TreeView group-by-initiative**: New view mode showing items grouped by initiative with coverage indicator (≥50% Epics = full view; 25–49% = warning; <25% = hidden mode).

## Evidence (SPIKE-024)

- `metadata.*` write path is broken (UpdateItemArgs has no metadata map passthrough) — first-class field is the correct implementation path
- Initiative pattern: ADOPT (Linear, Jira Roadmaps, Aha!, Wrike all use this layer)
- Phase 2 gated on Phase 1 (STORY for category normalization) being done

## Blocked by

Phase 1 category normalization story (STORY-198)

## Links

- implements SPIKE-024
- blocked-by STORY-198 (Phase 1)