Write-time and on-demand Diataxis compliance validation using heuristicClassify().

## Compliance Rules (signal-based, no new heuristics needed)
- Reference atom (diataxis_type='reference') scores ≥ 0.3 on how-to → VIOLATION (imperative verb leak)
- Tutorial atom scores ≥ 0.4 on reference → VIOLATION (too much raw info, not learning-oriented)
- Explanation atom scores ≥ 0.3 on how-to → VIOLATION (task leak in conceptual content)
- mixed=true with confidence < 0.5 → WARNING (ambiguous type signal)

## Tool Definition
Tool name: devsteps_validate_diataxis_compliance
Input: item_id (required) OR content (inline markdown)
Output: {
  item_id, declared_type, detected_type, confidence, violations: [],
  warnings: [], compliant: boolean, suggestion: string
}

## Acceptance Criteria
- Uses existing heuristicClassify() — no new NLP needed
- Callable standalone AND automatically invoked in write-guard (STORY-280)
- Returns actionable suggestion when violation detected

## Estimated effort: 1 day## BOM-position mismatch violation axis (Semantic Anchor amendment)

Beyond content-level validation (imperative verbs in Reference), add structural BOM position check:

When `devsteps_validate_diataxis_compliance` is called WITH a `bom_path`:
- Read the fragment's position in docs-map.json
- Check: does the parent BOM node's declared `diataxis_type` match the fragment's type?
- If Reference fragment is under a Tutorial BOM node → violation type: "bom-position-mismatch"
- Response includes: `violations: [{ type: 'bom-position-mismatch', bom_node: 'Tutorial X', fragment_type: 'reference' }]`
- Suggestion: `mismatched-intent` tag added to fragment ItemMetadata

Storage: add `'mismatched-intent'` tag to the DOC item (already indexed via by-type) — do NOT add
validation_status to DocsMapNode (BOM manifest must remain a stable structural skeleton).

AC addition: test: reference fragment in tutorial BOM node → violation reported; tag added.