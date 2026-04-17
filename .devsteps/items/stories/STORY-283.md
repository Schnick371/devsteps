When an AI author calls mcp_devsteps_add with type=doc without providing a
diataxis_type in the YAML frontmatter or metadata, the tool response should
include a next_steps[] nudge prompting the author to classify the type.

Similarly, devsteps_docs_new tool should recommend running devsteps_docs_classify
after creation.

## Acceptance Criteria
- mcp_devsteps_add response: when item.type === 'doc' and no diataxis_type
  detectable from description: add nudge in next_steps[]
- devsteps_docs_new: add next_steps item: "Run devsteps_docs_classify on this
  item to assign a Diataxis type"
- Non-blocking, informational only