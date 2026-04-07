Add DOC item governance section to the devsteps-devsteps-usage instructions.

**Content to add:**
1. DOC item purpose: "Documents the existence of a documentation file; makes it findable via mcp_devsteps_search by ID and keywords"
2. Required metadata fields: doc_path (required), anchor (optional), diataxis_type (optional), arch_node_id (optional for ARCH tree bridge), keywords (STRONGLY RECOMMENDED)
3. SSOT ranking:
   - "What documentation exists" → DOC items (searchable via mcp_devsteps_search)
   - "Where is section X in file" → docs-map-positions.json (generated shadow — NOT DOC items)
   - "Which work items relate" → DOC item linked_items.documented-by graph
4. Research file promotion pipeline: git mv → devsteps add --type doc → devsteps link
5. Explicit rules:
   - Do NOT store line_number in DOC metadata (fragile)
   - Do include keywords for search discoverability
   - One DOC item per documentation FILE (not per section)