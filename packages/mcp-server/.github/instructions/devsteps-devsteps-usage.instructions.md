---
applyTo: ".devsteps/**"
description: "DevSteps CLI/MCP tool usage - file protection and API contracts"
---

# DevSteps Tool Usage Standards

## File Protection (CRITICAL)

**NEVER edit `.devsteps/` files directly:**
- ❌ Manual JSON/MD edits in `.devsteps/` directory
- ✅ Use devsteps MCP tools exclusively first
- ✅ Use devsteps CLI commands, if MCP tools unavailable (temporary fallback)

**Why:** Ensures index consistency, maintains traceability, prevents corruption.

## CLI Usage

**Standard commands:**
```bash
devsteps add <type> "<title>"        # Create work item
devsteps update <ID> --status <status>  # Update status
devsteps link <source> <relation> <target>  # Link items
devsteps list --type <type>          # List items
devsteps get <ID>                    # Get item details
devsteps trace <ID>                  # Show relationships
```

## MCP Tool Usage

**Standard MCP tools:**
```
#mcp_devsteps_add                    # Create work item
#mcp_devsteps_update                 # Update work item
#mcp_devsteps_link                   # Link items
#mcp_devsteps_list                   # List items
#mcp_devsteps_get                    # Get details
#mcp_devsteps_trace                  # Show traceability
```

**Error handling:**
- All tools return structured error messages
- Check return codes before proceeding
- Never assume success without verification

---

**Workflow details:** See [REGISTRY.md](../agents/REGISTRY.md), [devsteps-10-plan-work.prompt.md](../prompts/devsteps-10-plan-work.prompt.md), [devsteps-20-start-work.prompt.md](../prompts/devsteps-20-start-work.prompt.md)
