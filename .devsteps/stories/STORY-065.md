# CLI Commands Update - Eisenhower Only

## Objective
Replace `--priority` flag with `--eisenhower` (or keep priority flag but map to eisenhower).

## Commands to Update

**add command:**
```bash
# OLD
devsteps add story "Title" --priority high

# NEW  
devsteps add story "Title" --eisenhower Q2
# OR (keep flag name for UX)
devsteps add story "Title" --priority Q2
```

**list command:**
```bash
# OLD
devsteps list --priority high

# NEW
devsteps list --eisenhower Q1,Q2
# OR
devsteps list --priority Q1,Q2
```

**update command:**
```bash
# OLD
devsteps update STORY-001 --priority critical

# NEW
devsteps update STORY-001 --eisenhower Q1
```

## Implementation

**packages/cli/src/index.ts:**
- Update command descriptions
- Change flag parsing
- Map user input to eisenhower values
- Update help text

**packages/cli/src/commands/*.ts:**
- Update all command handlers
- Change priority → eisenhower in code

## UX Decision
Keep `--priority` flag name (users understand) but accept Q1/Q2/Q3/Q4 values.