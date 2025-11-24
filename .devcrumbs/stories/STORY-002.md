# CLI Package - Command-Line Interface

## Overview
Developer-friendly command-line tool for managing DevCrumbs projects and work items from the terminal.

## Commands Implemented
```bash
devcrumbs init <project-name>     # Initialize new project
devcrumbs add <type> <title>      # Create work item
devcrumbs list [--type] [--status] # List work items
devcrumbs get <id>                # Get item details
devcrumbs update <id> [options]   # Update work item
devcrumbs link <source> <target>  # Link items
devcrumbs search <query>          # Full-text search
devcrumbs status                  # Project overview
devcrumbs trace <id>              # Show traceability tree
devcrumbs archive <id>            # Archive item
devcrumbs purge [--status]        # Bulk archive
devcrumbs export [--format]       # Export project data
devcrumbs context [--level]       # Get project context
devcrumbs doctor                  # Health check
devcrumbs setup                   # Interactive setup
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