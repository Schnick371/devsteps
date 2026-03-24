The instructions file contains a summarized Dispatch Invariants table synced from ADP §1. After Task A-1 adds I-14 to ADP, mirror the invariant here.

**Canonical source:** packages/mcp-server/.github/instructions/devsteps-agent-protocol.instructions.md

Add I-14 row after the I-13 row in the Dispatch Invariants table:
'I-14 | Each mandate covers ONE investigation question; concern-split produces at most MAX_SPLIT=4 additional agents total | Coord MUST scope-split rather than issuing multi-concern mandate; MAX_SPLIT=4 prevents concern-count explosion'

## Done When
I-14 row present in instructions table; wording consistent with ADP §1 I-14; no other changes to file.