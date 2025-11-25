# @schnick371/devsteps-shared

> Never Code Alone. Shared utilities and types for DevSteps packages.

## Overview

Core package providing shared types, schemas, and utilities used across all DevSteps packages (CLI, MCP Server, VS Code Extension).

## Features

- **TypeScript Types**: Complete type definitions for work items, configurations, and API responses
- **Zod Schemas**: Runtime validation for all data structures
- **Core Functions**: File operations, item management, relationship handling
- **Utilities**: ID parsing, timestamp handling, configuration management

## Installation

```bash
npm install @schnick371/devsteps-shared
```

## Usage

```typescript
import { addItem, getItem, listItems } from '@schnick371/devsteps-shared';
import type { ItemType, ItemStatus } from '@schnick371/devsteps-shared';

// Add a new work item
const result = await addItem('/path/to/.devsteps', {
  type: 'task',
  title: 'Implement feature',
  priority: 'high'
});

// Get work item
const item = await getItem('/path/to/.devsteps', 'TASK-001');

// List all items
const items = await listItems('/path/to/.devsteps');
```

## Exports

### Core Functions
- `addItem()` - Create new work item
- `getItem()` - Retrieve work item by ID
- `updateItem()` - Update existing work item
- `deleteItem()` - Delete work item
- `listItems()` - List all work items with filters
- `searchItems()` - Full-text search across items
- `linkItems()` - Create relationships between items
- `archiveItem()` - Archive completed items

### Types
- `ItemType` - Epic, Story, Task, Bug, etc.
- `ItemStatus` - Draft, In Progress, Done, etc.
- `Priority` - Critical, High, Medium, Low
- `Methodology` - Scrum, Waterfall, Hybrid
- `ItemMetadata` - Complete work item structure

### Schemas
- `addItemSchema` - Validation for item creation
- `updateItemSchema` - Validation for updates
- `linkItemSchema` - Validation for relationships

## Documentation

- [DevSteps Documentation](https://devsteps.dev)
- [GitHub Repository](https://github.com/Schnick371/devsteps)
- [Issue Tracker](https://github.com/Schnick371/devsteps/issues)

## License

Apache-2.0 © Thomas Hertel
