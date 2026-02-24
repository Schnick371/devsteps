# CLI: `devsteps context generate`

## Purpose

`PROJECT.md` is the authoritative project description read by the AI context system.
Currently it must be written by hand. This command generates it from live project data,
keeping it accurate without manual upkeep.

## Command Design

```
devsteps context generate [--watch] [--dry-run]
```

| Flag | Description |
|---|---|
| (none) | Generate PROJECT.md once and exit |
| `--watch` | Watch `.devsteps/` for changes and regenerate |
| `--dry-run` | Print generated content to stdout, do not write |

Output: `.devsteps/PROJECT.md`

## Sections to Generate

```markdown
# <project_name>

## Description
<from .devsteps/config.json description or README.md first paragraph>

## Tech Stack
<auto-detected from package.json devDependencies + dependencies>

## Project Type
<from .devsteps/config.json methodology>

## Status
<item counts: X Epics, Y open Stories, Z in-progress Tasks>

## Active Work
<last 5 in-progress or recently-updated items, with ID + title>

## Conventions
<from .devsteps/config.json or hardcoded DevSteps conventions>
```

## Implementation Notes

- Extend `packages/shared/src/core/context.ts` → add `generateProjectMd(cwd, devstepsDir): string`
- New sub-command in `packages/cli/src/commands/context.ts`: `context generate`
- After writing: invalidate ContextCache entry for PROJECT.MD key
- `--watch` mode uses `fs.watch()` on `.devsteps/index.json` (updated on every add/update)

## Acceptance Criteria

- [ ] `devsteps context generate` creates/overwrites `.devsteps/PROJECT.md`
- [ ] All 6 sections present with real data from live project state
- [ ] `--dry-run` prints to stdout without writing
- [ ] `--watch` re-generates on index changes (debounced 500ms)
- [ ] After generation, `devsteps_context` tool returns updated content immediately (cache invalidated)
- [ ] Unit test: `generateProjectMd()` with mock project state produces expected markdown structure