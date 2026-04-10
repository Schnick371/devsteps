Update the content in DOC-059 to reflect the new H3-block granularity model:

- Remove the H4/H5 rows from the \"H-Level Schema\" table (or mark them as content-within, not split-boundary)
- Update the \"One Fragment = One Heading\" section to \"One Fragment = One H3 Block\"
- Update the BOM tree example: remove DOC-004 (H4) and DOC-005 (H5) as separate items
- Add the authoring pattern observation: H3 = domain label (no body text), H4 = payload
- Update the Assembly section: BOM depth = 2, not 5

Affected: `.devsteps/items/docs/DOC-059.json` + `.devsteps/items/docs/DOC-059.md` (via `mcp_devsteps_update`)Done: DOC-059 updated to H1-block model — one doc item = one H1 block, internal H2–H5 are prose content (not separate items), BOM level determines heading offset at assembly time. Deprecated H4/H5-as-items model documented in legacy note.