# CLI Package - Command-Line Interface

## Overview
Developer-friendly command-line tool for managing DevSteps projects and work items from the terminal.

## Commands Implemented
```bash
devsteps init <project-name>     # Initialize new project
devsteps add <type> <title>      # Create work item
devsteps list [--type] [--status] # List work items
devsteps get <id>                # Get item details
devsteps update <id> [options]   # Update work item
devsteps link <source> <target>  # Link items
devsteps search <query>          # Full-text search
devsteps status                  # Project overview
devsteps trace <id>              # Show traceability tree
devsteps archive <id>            # Archive item
devsteps purge [--status]        # Bulk archive
devsteps export [--format]       # Export project data
devsteps context [--level]       # Get project context
devsteps doctor                  # Health check
devsteps setup                   # Interactive setup
```

## Features
✅ Interactive prompts (inquirer)
✅ Colorful output (ora, chalk)
✅ Argument parsing
✅ Error handling with helpful messages
✅ Tab completion support

## Implementation Status
✅ Core commands implemented
✅ Help documentation
✅ Executable binary configuration