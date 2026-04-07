Investigate whether adding `keywords?: string[]` to ALL item types (story, task, bug, epic, spike, etc.) would improve semantic and full-text search quality in mcp_devsteps_search.

**Research questions:**
1. What is the current full-text search mechanism? (title + description only? tags included?)
2. Would explicit keywords reduce false negatives for items that are "about" a concept but don't use that word in title/description?
3. What indexing overhead would keywords add? Would a `by-keywords/` index be needed?
4. How would keywords differ from tags? (tags: classification facets; keywords: search terms not otherwise in description)
5. Are there precedents in issue trackers (Linear, Jira, GitHub Issues) for explicit keyword fields?

**Context from SPIKE-041:** keywords?: string[] was identified as critical for DOC items because docs may have meaningful content not in the item description. The same reasoning applies when a STORY is "about" a concept that's named differently in its title (e.g., "STORY: Add Zod coerce" is really about "schema validation" and "type coercion").

**Expected outcome:** Decision + design proposal for keywords on all types, OR evidence that tags + description text search is sufficient.