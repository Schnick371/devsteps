The MCP prompts inventory is missing explanation and architecture type templates.
Currently implemented: tutorial, how-to, reference.
Missing: explanation, architecture.

## Acceptance Criteria
- packages/mcp-server/src/handlers/prompts.ts: add two new prompt handlers:
  - devsteps-docs-write-explanation: structured skeleton for Explanation type
    (Overview / Background / Why It Works / Conceptual Map / Related Concepts)
  - devsteps-docs-write-architecture: structured skeleton for Architecture type
    (Purpose / Context / Key Decisions / Components / Trade-offs / ADR Link)
- Both prompts registered in server.ts and http-server.ts
- Mirror copies in .github/prompts/ and packages/cli/.github/prompts/

## Diataxis Explanation structure
Tutorial: learning-oriented (doing → understanding)
Explanation: understanding-oriented (why → insight)
The explanation prompt should NOT include steps or tasks.