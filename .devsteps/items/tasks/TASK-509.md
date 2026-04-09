Alle 58 DOC-items haben derzeit `affected_paths: []`. Vor der Fail-Fast-Implementierung in TASK-503 müssen alle 58 DOC-items korrekte `affected_paths` erhalten.

**Vorgehen:** Für jedes DOC-item den Wert analog zur `docs-map.json`-Node-Verknüpfung setzen. Batch-Update via `mcp_devsteps_update` (je Item: `affected_paths: ['.devsteps/items/docs/DOC-NNN.json', '.devsteps/items/docs/DOC-NNN.md']`).

**Blocking:** Muss vor TASK-503 (fail-fast) erledigt sein.

**Scope:** 58 items — DOC-001 bis DOC-053 (aktive), ggf. auch obsolete überspringen.## Done

Updated 33 active DOC items via `devsteps update --paths`. 26 skipped (obsolete/cancelled or already had paths). All active DOC items now have `affected_paths` pointing to their own `.json` and `.md` files. P0 prerequisite for TASK-503 (fail-fast) satisfied.