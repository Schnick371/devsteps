Update DOC-028 content to remove the statement \"each heading level is a separate doc item and a separate BOM node\".

New rule: H3 = doc-item boundary. H4/H5 are content WITHIN the fragment.

Update the \"Document structure\" sentence:

OLD: \"H1 = Diataxis type · H2 = chapter · H3 = section · H4 = subsection/function-level. Each heading level is a separate `doc` item and a separate BOM node.\"

NEW: \"H1/H2 = Diataxis type / chapter (document root). H3 = content fragment boundary — one doc-item per H3 block including all H4, H5, tables, and code content within. H4/H5 are content inside a fragment, never separate items.\"

Also update the BOM tree example if present.

Affected: `.devsteps/items/docs/DOC-028.json` + `.devsteps/items/docs/DOC-028.md` (via `mcp_devsteps_update`)