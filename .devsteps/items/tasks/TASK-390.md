TASK-377 (draft) specifies shadow format with field `parent_arch_id: string | null`, but STORY-221 (done) actually implemented `position: string` (dot-notation like "1.2.3"). These do NOT match.

After STORY-233 migrates DocsMapNode to adjacency list format (parent_id: string|null + order: number), the natural resolution is:

Recommended shadow format (both representations available from flat list):
- Keep `position: string` (dot-notation, human-readable, derivable from ordered traversal)
- Add `parent_arch_id: string | null` (direct copy of parent_id from DocsMapNode)

Update TASK-377 description to:
1. Acknowledge the current `position` field implementation
2. Specify that after STORY-233, both `position` AND `parent_arch_id` should be included in the shadow
3. Mark STORY-233 as a prerequisite

After updating TASK-377, link it to STORY-233 with relationship "depends-on".