# Strengthen Step 3: Structure Work - Add Explicit Hierarchy Rules

## Task
Restore explicit hierarchy rules from git commit 0cdf6e4 with clear examples and Spike planning guidance.

## Changes Required

### Update "Step 3: Structure Work" Section

```markdown
### Step 3: Structure Work (MANDATORY)

**Determine hierarchy:**
- **Epic → Story → Task** (standard feature development)
- **Epic → Spike → Task** (research → proof-of-concept)
- **Story → Bug (blocks) → Task (fix)** - Bug blocks Story/Feature (parent only)
- **Bug relates-to Epic/Requirement** (context only, NOT implements)

**CRITICAL Hierarchy Rules:**
1. Bug uses `affects` to parent Story/Feature (blocks relationship)
2. Bug uses `relates-to` to Epic/Requirement (context, NOT hierarchy)
3. Task `implements` Bug (fix implementation)
4. Spike creates Stories from outcomes

**Spike planning:**
- Plan follow-up Stories from spike outcomes
- "What did we learn?" → "What should we build?"
- Link Stories to same Epic using `implements`

**Identify dependencies:**
- `depends-on` - Must complete before starting
- `blocks` - Prevents progress on another item
- `relates-to` - Related context, not hierarchical
```

## Acceptance Criteria
- [ ] Explicit hierarchy patterns with arrows documented
- [ ] CRITICAL Hierarchy Rules section added
- [ ] Bug workflow explicitly documented
- [ ] Spike planning guidance restored
- [ ] Dependency types clarified

## File
`.github/prompts/devsteps-plan-work.prompt.md` - Section "Step 3"

## Reference
Git commit 0cdf6e4 has the stronger version