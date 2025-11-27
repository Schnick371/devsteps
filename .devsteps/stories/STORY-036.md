# Problem: Copilot Workflow Understanding Gaps

## Current Issues
1. **Item hierarchy unclear** - Copilot updates Stories with technical solutions instead of creating Tasks
2. **No branch strategy** - Work happens on main, no isolation per story
3. **No clean state checks** - Uncommitted changes when switching stories
4. **Agent file too verbose** - 134 lines, hard to maintain focus

## Why This Matters
- **Traceability broken:** Solutions documented in wrong item type
- **Merge conflicts:** Multiple stories modifying same files on main
- **Lost context:** No branch = no clear story boundaries
- **Cognitive load:** Too much text reduces Copilot effectiveness

## Success Criteria
✅ Copilot understands: Epic=WHAT, Story=WHY/Problem, Task=HOW/Solution
✅ Story branches created automatically before work starts
✅ Clean state enforced (warn, don't block)
✅ Agent file compressed to ~80 lines
✅ Prompts enhanced with clear workflow steps

## Research Findings
Industry best practice 2025: Story/feature branches (not epic branches)
- Short-lived, tied to user stories
- Pattern: `story/<ID>` or `story/<ID>-slug`
- Multiple parallel branches acceptable
- DevSteps tracks open stories → no forgotten branches

## Solution Approach
1. Add item hierarchy rules to agent (Epic/Story/Task clarity)
2. Extend start-work prompt with story branch workflow
3. Compress agent file (remove verbosity, trust Copilot)
4. Warn on dirty tree, allow developer choice

## Non-Goals
- ❌ Strict blocking (trust developer autonomy)
- ❌ New .instructions.md files (wrong place)
- ❌ Examples and long explanations (Copilot knows better)