## Context
When both a DevSteps workspace (with `.github/agents/`) and a DevSteps agent plugin (`chat.plugins.paths`) are active simultaneously, VS Code may show duplicate agent entries in the agent picker. The duplication risk is specific to the `chat.plugins.paths` deduplication behaviour, which is undocumented for the case where workspace and plugin declare identical agent IDs.

## Research Questions
1. Does VS Code perform deduplication when workspace `.github/agents/` and plugin agents share the same `id` in frontmatter?
2. If no deduplication: do 34 agents appear twice (68 entries) in the picker with identical names?
3. If deduplication occurs: what is the precedence rule (workspace wins? plugin wins? last-registered wins)?
4. Is there a VS Code setting or manifest field to declare canonical agent ownership?
5. Test procedure: install plugin + open workspace simultaneously, invoke agent picker, count entries

## Test Setup
1. Create a minimal test plugin with one agent (id: `devsteps-test-agent`)
2. Also place same agent `.md` in workspace `.github/agents/`
3. Open VS Code with both workspace and plugin active
4. Open agent picker and observe

## Success Definition
A written test report documenting:
- Whether duplication occurs
- Deduplication behaviour and precedence
- Recommended approach for plugin.json to avoid user-visible duplicates
- Whether agent `id` field conflicts or coexists