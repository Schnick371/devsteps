## Task
Drei zusammenhängende Korrekturen in einem Commit:

1. sha256() in packages/shared/src/utils/update-copilot-files.ts und packages/shared/src/utils/init-helpers.ts → zu exportierter hashContent() konsolidieren
2. packageVersion in beiden Init-Handlern (CLI + MCP) korrekt übergeben
3. CLI init bekommt --extend-agents Flag als opt-in (entspricht dem MCP extendAgents-Parameter)

## Acceptance Criteria
- hashContent() ist einzige sha256-Impl in shared/utils
- devsteps init --extend-agents=true ruft extendExistingAgents() auf
- Kein "version: unknown" mehr in managed-file Annotationen