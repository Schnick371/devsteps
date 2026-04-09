## Problem

After the April 7, 2026 planning session (BUG-083 fix + TASK-487/488/489/490 creation), approximately 25 `.devsteps/` index and item files remain modified but uncommitted on `main`. These are valid updates but the git working tree is dirty.

## Files affected (from git status)
- .devsteps/index/by-priority/*.json (4 files)
- .devsteps/index/by-status/*.json (8 files)
- .devsteps/index/by-type/*.json (9 files)
- .devsteps/index/counters.json
- .devsteps/items/bugs/BUG-037.json
- .devsteps/items/bugs/BUG-072.json + BUG-072.md

## Fix
`git add .devsteps/ && git commit -m "chore(devsteps): commit index + item updates from apr7 session"`

Verify no unintended files are staged before committing.

## Affected Paths
- .devsteps/index/
- .devsteps/items/bugs/BUG-037.json
- .devsteps/items/bugs/BUG-072.json