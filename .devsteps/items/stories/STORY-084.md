# Story: CLI Long-form Flags - Improve Command Discoverability

## User Story
**As a** DevSteps CLI user  
**I want** both short (`-p`) and long-form (`--priority`) flags  
**So that** I can discover commands without memorizing cryptic abbreviations

## Problem
Current CLI syntax causes confusion:
```bash
# Current (confusing):
devsteps add epic "Title" -p not-urgent-important
#                         ↑ What does -p mean? Priority? Eisenhower?

# What users expect (but doesn't work):
devsteps add epic --title "..." --eisenhower "..." --tags "..."
error: unknown option '--title'
```

**Real Impact:** Both developers and AI agents repeatedly get syntax wrong.

## Acceptance Criteria
- [ ] Support `-p` and `--priority` (alias)
- [ ] Support `-t` and `--tags` (alias)
- [ ] Support `-e` and `--eisenhower` (explicit Eisenhower naming)
- [ ] All flags have long-form equivalents
- [ ] Help text shows BOTH forms: `-p, --priority <value>`
- [ ] Backward compatible - existing scripts don't break
- [ ] Update README with new syntax examples

## Technical Approach
Use Commander.js option aliases:
```typescript
.option('-p, --priority <value>', 'Eisenhower quadrant')
.option('-t, --tags <value>', 'Comma-separated tags')
.option('-e, --eisenhower <value>', 'Alias for --priority')
```

## CLI Best Practices (Research)
- **npm**: `-h` = `--help`, `-v` = `--version`
- **git**: `-m` = `--message`, `-a` = `--all`
- **docker**: `-p` = `--publish`, `-d` = `--detach`

**Standard:** Always support both short and long forms.

## Value Proposition
- **Discoverability**: Users can guess `--priority` without docs
- **Self-documenting**: `--eisenhower` clarifies priority system
- **AI-friendly**: LLMs can infer correct syntax from flag names
- **Developer happiness**: Less frustration, faster adoption

## Related Items
- STORY-002: Original CLI implementation (done)
- EPIC-001: Platform Epic (parent)
