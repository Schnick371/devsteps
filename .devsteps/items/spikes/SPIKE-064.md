Research and design the external PIM synchronization architecture. The goal:
pull technical product data (parameters, specifications, version info) from an external
PIM system and auto-create or update Reference-type DOC items.

## Investigation Questions
1. What adapter interface allows multiple PIM sources (CSV, REST API, Contentful, Sanity)?
2. How to handle conflict: external PIM data vs. manually edited Reference atom?
3. What is the minimal reference atom schema that carries PIM-sourced structured data?
4. Should sync be push (PIM webhook → DevSteps) or pull (scheduled CLI command)?
5. What conflict resolution strategy: PIM-wins | DevSteps-wins | manual-merge?

## Deliverable
A design document (ADR-style) outlining:
- Adapter interface TypeScript spec
- Conflict resolution strategy recommendation
- Estimation of implementation effort
- Go/No-go recommendation based on DevSteps use case

## Note: This is a design spike only — no implementation
## Estimated effort: 1-2 days research