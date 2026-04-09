Two Research Briefs were manually committed to git despite tmp/ being in .gitignore:
- tmp/SPIKE-043-DiataxisImport-Research-Brief.md (commits 87a5fea)
- tmp/SPIKE-044-MCPDialog-Research-Brief.md (commit 68c27ba)

Safe migration path: git mv to docs/research/, create DOC items for each, link via documents relation to their parent SPIKE items. No history rewrite needed.

Affected: tmp/ (remove 2 files), docs/research/ (add 2 files), .devsteps/ (add 2 DOC items)