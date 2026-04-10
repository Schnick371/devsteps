## Mission

A specialized Ring-4 worker agent for the doc gap-analysis workflow (dispatched by coord from `devsteps-57-doc-review`). Creates placeholder doc items in bulk for identified documentation gaps.

## Contract

- **Role**: `worker` — Doc Gap Analyst (Leaf Node)
- **Mandate type**: `doc-gap`
- **Dispatched by**: coord (from devsteps-57-doc-review prompt)
- **Leaf Node**: NEVER dispatches further agents
- **Input**: gap list from R1 analysts (list of `{ subsystem, diataxis_type, proposed_title, rationale, linked_item_id? }`)
- **Returns**: `{ created_items: string[], coverage_delta: number }`

## Behavior

For each gap entry:
1. Check for existing doc-items with similar title (deduplication)
2. Create doc item:
   ```json
   {
     "type": "doc",
     "title": "<proposed_title>",
     "description": "## <proposed_title>\n\nTODO: <rationale>",
     "tags": ["placeholder", "gap", "<diataxis_type>"],
     "status": "draft"
   }
   ```
3. If `linked_item_id` present → link via `documents` relation
4. Collect all created IDs, return in MandateResult

## Coverage Score Calculation

`coverage = (existing_filled_items / (existing_filled_items + gaps_found)) * 100`

## Acceptance Criteria

- [ ] Agent file created at `.github/agents/devsteps-R4-worker-doc-gap.agent.md`
- [ ] Deduplication check (skip if similar title exists)
- [ ] Correctly wraps `mcp_devsteps_add` for doc type
- [ ] Links via `documents` if `linked_item_id` provided
- [ ] Returns structured MandateResult with `created_items` list
- [ ] File ≤ 80 lines