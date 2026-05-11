---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, cli, commands, reference]
---

# DevSteps CLI

This section covers the `devsteps` command-line interface — installation, all commands with their flags and output formats, and how-to guides for common workflows.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Overview & Installation | Explanation | Prerequisites, npm install, shell completion |
| Command Reference | Reference | All commands grouped by category |
| devsteps init / status / health | Reference | Project initialization, workspace status, health check |
| devsteps add / update / list / get / search | Reference | Core CRUD commands with all flags |
| devsteps export / archive / purge / metrics | Reference | Data management and operational commands |
| devsteps context — Output-Formate & Optionen | Reference | Context generation, level parameter, output modes |
| Output-Formate JSON/YAML/Text | Reference | All --format flags, field filtering, pipe-friendly output |
| How-to: CLI Workflows | How-to | Common daily patterns |
| How-to: Set up a new project | How-to | devsteps init, git hooks, first item |
| How-to: Daily work with the CLI | How-to | List open items, update status, add commit references |
| Architecture — CLI Design | Architecture | Commander structure, output abstraction, test strategy |

## Quick Reference

```bash
devsteps init              # Initialize .devsteps/ in current directory
devsteps add story         # Create a new story (interactive)
devsteps list --status in-progress
devsteps update STORY-042 --status done
devsteps context           # Print structured project context for Copilot
```

The CLI connects directly to `.devsteps/` — no running MCP server required for CRUD operations.
