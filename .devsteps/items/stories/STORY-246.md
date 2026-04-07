## Background
Mit den neuen Features brauchen wir eine klare Mindest-VS-Code-Version:
- v1.104: MCP Server Instructions (base prompt injection)
- v1.106: MCP Registry support
- v1.109: registryBaseUrl in MCP manifest
- v1.110: Agent Plugins (.mcp.json)
- v1.112: MCP Sandboxing (macOS/Linux)
- v1.113: CLI Bridging (auto-expose to Copilot CLI + Claude)

## Tasks
1. Analyse: Was ist die Mindest-Version für ein funktionierendes DevSteps-Erlebnis?
2. Extension package.json `engines.vscode` prüfen und ggf. anheben
3. Versionshinweise/Release-Notes anpassen: beim Start warnen wenn VS Code < Minimum
4. Feature-Matrix erstellen: welche Features ab welcher Version verfügbar

## Acceptance Criteria
- [ ] Mindest-VS-Code-Version definiert und in package.json gesetzt
- [ ] Start-Warnung zeigt an wenn Version unterschritten
- [ ] Feature-Matrix in README oder docs dokumentiert