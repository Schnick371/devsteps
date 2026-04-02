Before implementing Phase 3 (bom_position root field), investigate and define the manifest.yaml file format for the Doc Map hierarchy.

Research questions:
1. What is the minimal schema for docs/manifest.yaml? (Inspired by DITA Maps topicrefs)
2. How are BOM positions (e.g., "1.2.3") validated for uniqueness?
3. How does a "relocate" operation work when a document section moves to a different hierarchy level?
4. What triggers a warning for DOC items missing bom_position when manifest.yaml is present?
5. What index file format for by-bom.json enables efficient tree queries?

Constraint: bom_position is a root ItemMetadata field (not in metadata.classification). Regex: /^\\d+(\\.\\d+)*$/. Phase 3 is blocked until Phase 1+2 are in production.