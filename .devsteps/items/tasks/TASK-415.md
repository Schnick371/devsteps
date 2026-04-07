# Task: Git-MCP Konfigurationsbeispiel

Dokumentiere wie modelcontextprotocol/servers git-MCP für DevSteps konfiguriert wird:

## Inhalt

1. Konfigurationsbeispiel in INSTALL.md / README.md:
   ```json
   {
     "mcpServers": {
       "git": {
         "command": "uvx",
         "args": ["mcp-server-git", "--repository", "${workspaceFolder}"]
       }
     }
   }
   ```

2. Erklärung: Welche Copilot-Agenten profitieren (analyst-archaeology, aspect-staleness, analyst-context)

3. Optional: devsteps doctor Hint wenn git_integration=true aber kein Git-MCP konfiguriert

Relates-to: SPIKE-048