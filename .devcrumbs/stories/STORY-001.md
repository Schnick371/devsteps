# Shared Package - Core Business Logic

## Overview
Central package containing all shared types, schemas, validation logic, and utilities used across CLI, MCP Server, and VS Code Extension.

## Responsibilities
- **Type Definitions**: TypeScript interfaces for all domain models
- **Zod Schemas**: Runtime validation for configuration and data
- **Core Functions**: Business logic for work item management
- **Utilities**: File system operations, caching, context generation

## Key Modules
```typescript
// Types
export type { DevCrumbsConfig, DevCrumbsIndex, WorkItem, ... }

// Schemas
export { projectSchema, configSchema, itemSchema, ... }

// Core Functions
export { addItem, getItem, listItems, updateItem, ... }

// Utils
export { getCache, analyzePackages, getQuickContext, ... }
```

## Implementation Status
✅ Project initialization (init.ts)
✅ Item CRUD operations (add.ts, get.ts, list.ts, update.ts)
✅ Bulk operations (bulk-update.ts)
✅ Context generation (context.ts)
✅ Caching system (cache.ts)
✅ Zod validation schemas