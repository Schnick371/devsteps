Fixes the cross-ring file re-read problem: exec-planner currently re-reads files that Ring 1/2 analysts already analyzed, because MAP step 5 explicitly calls read_file 'to verify locations' by design.

**Canonical source:** packages/mcp-server/.github/agents/devsteps-R3-exec-planner.agent.md

**Change 1 — MAP step 5 table entry:**
Update step 5 from: 'Assign file paths + line ranges per step from Archaeology data | read_file to verify locations'
To: 'Assign file paths + line ranges per step from Archaeology data | Check Relevant files: in Mandate first; call read_file only for paths NOT listed there'

**Change 2 — Add behavioral rule:**
Add to the Behavioral Rules or similar section: 'If Relevant files: field is present in Mandate (injected by coord at FULL tier), treat those paths as pre-verified — do NOT re-read them in MAP step 5. Call read_file only for paths needed that are absent from Relevant files.'

## Done When
MAP step 5 references Relevant files: check; behavioral rule added; file line count verified ≤max.