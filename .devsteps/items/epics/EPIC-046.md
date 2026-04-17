Transform DevSteps from a code-tracker + CCMS into a full Knowledge-Operating-System. Combines Diataxis-typed Atomic Content Items (ACI), BOM-Rollup assembly, MCP-based structured retrieval, and AI-assisted authoring flows.

## Vision
A Knowledge-OS where:
- Every doc item is a typed ACI (diataxis_type as first-class indexed field)
- AI can query atoms by intent (`get_atoms_by_intent`)
- AI can generate BOM manifests for audience personas
- Content change propagation via dirty-bit pattern (when Reference atom changes, transcluding How-tos get flagged)
- Dynamic assembly: user question → live rollup of relevant atoms (no vector DB needed at DevSteps scale)

## Architecture Foundation
- DevSteps JSON rollup already emits RAG-compatible `{fragments:[{id,title,content}]}` (format: 'json')
- BM25 achieves 85% recall at ~1000 items — no vector store needed
- Transclusion (`{{ref:ITEM-ID}}`) is the inheritance mechanism (pull model)
- Missing: diataxis_type as first-class indexed field (blocks everything else)

## Research Basis
- tmp/analysis-internal-knowledge-os-session1.md
- tmp/analysis-research-knowledge-os-session1.md
- tmp/analysis-context-diataxis-ccms-session1.md