Add `devsteps_docs_bom_commit` to MCP tools handler:
- Input: `{ session_id, token, dry_run? }`
- Reads session state, creates DOC Items for all accepted/split files
- Each DOC Item gets metadata.diataxis_type + metadata.source_path + metadata.import_session_id
- Updates DocsMapDocument nodes[] with new BOM entries
- Returns: items_created, bom_nodes_added, skipped, errors[], dry_run result list