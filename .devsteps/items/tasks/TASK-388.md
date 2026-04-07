STORY-222 (draft) description contains two errors found by analyst-archaeology (confidence 0.97):
1. References `DocsMapRoot` type which does NOT exist — actual type is `DocsMapDocument`. This is a compile-fail waiting to happen when STORY-222 is implemented.
2. Uses "reads docs-map.yaml via readDocsMap()" language — after STORY-233 migration, the file is docs-map.json.

Update STORY-222 description to fix both issues:
- Replace `DocsMapRoot` → `DocsMapDocument` in all occurrences
- Replace "docs-map.yaml" → "docs-map.json"
- Keep all other content unchanged

After updating STORY-222, link it to STORY-233 with relationship "depends-on" (STORY-222 depends on STORY-233 being implemented first).