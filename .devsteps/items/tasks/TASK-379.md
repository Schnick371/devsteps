Extend `DocIndex.ts` with Phase 2 method: `scanSymbolAnnotations(workspaceRoot: string): Map<symbolName, string[]>`

**Behavior:**
- Scans all `.ts`, `.js` files for `@see ARCH-[0-9]+-[0-9]+` pattern in JSDoc comments
- Builds in-memory `Map<symbolName, string[]>` (list of ARCH-NNN IDs per symbol name)
- The extension auto-scans at activate() and invalidates on FSW change events
- No DevSteps tool parameter required — fully automatic from source code

**Why JSDoc `@see`:**
- Standard JSDoc convention — known to developers and AI agents
- Annotation lives next to the function → automatically moves with code on rename
- ARCH-NNN IDs are stable (rarely renumbered)
- No separate config file or manifest needed