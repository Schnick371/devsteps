Create `.devsteps/docs-map.schema.json` providing JSON Schema validation for docs-map.json and VS Code IntelliSense support.

Schema must include:
- $schema, $id, title, description, version + nodes array
- DocsMapNode $def with: id (pattern ^ARCH-[A-Z0-9]+(-[A-Z0-9]+)*$), doc_id? (pattern ^DOC-[0-9]+$), parent_id (string|null), order (number, min 0), title (string), description? (string), devsteps_items (array of strings matching item ID pattern), tsd_heading_depth_max? (number 1-6), default_depth? (enum 1|2|3|4)
- additionalProperties: false on all objects
- $schema pointer at root of docs-map.json for VS Code IntelliSense

Reference: docs/architecture/adr-007-docs-map-format.md §Final Schema