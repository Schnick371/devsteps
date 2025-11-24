# MCP Server Package - AI Integration Protocol

## Overview
Model Context Protocol server providing 15 tools for AI assistants to interact with DevCrumbs projects.

## MCP Tools Implemented
```typescript
1. devcrumbs-init        // Initialize project
2. devcrumbs-add         // Create work item
3. devcrumbs-get         // Get item details
4. devcrumbs-list        // List work items
5. devcrumbs-update      // Update item
6. devcrumbs-link        // Create relationships
7. devcrumbs-search      // Full-text search
8. devcrumbs-status      // Project status
9. devcrumbs-trace       // Traceability tree
10. devcrumbs-export     // Export data
11. devcrumbs-archive    // Archive item
12. devcrumbs-purge      // Bulk archive
13. devcrumbs-context    // Project context (3 levels)
14. devcrumbs-health     // Server health
15. devcrumbs-metrics    // Prometheus metrics
```

## Architecture
- **stdio Transport**: Local development (VS Code, Claude Desktop)
- **HTTP Transport**: Remote/production deployments
- **Logging**: Structured logging with pino
- **Metrics**: Prometheus-compatible metrics
- **Error Handling**: Graceful error responses

## Implementation Status
✅ All 15 tools implemented
✅ stdio and HTTP servers
✅ Comprehensive logging
✅ Health checks and metrics
✅ Error handling and validation