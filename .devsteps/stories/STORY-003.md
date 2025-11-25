# MCP Server Package - AI Integration Protocol

## Overview
Model Context Protocol server providing 15 tools for AI assistants to interact with DevSteps projects.

## MCP Tools Implemented
```typescript
1. devsteps-init        // Initialize project
2. devsteps-add         // Create work item
3. devsteps-get         // Get item details
4. devsteps-list        // List work items
5. devsteps-update      // Update item
6. devsteps-link        // Create relationships
7. devsteps-search      // Full-text search
8. devsteps-status      // Project status
9. devsteps-trace       // Traceability tree
10. devsteps-export     // Export data
11. devsteps-archive    // Archive item
12. devsteps-purge      // Bulk archive
13. devsteps-context    // Project context (3 levels)
14. devsteps-health     // Server health
15. devsteps-metrics    // Prometheus metrics
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