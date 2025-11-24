# Docker Quick Start

## Start MCP Server

```bash
docker-compose up -d
```

## Check Health

```bash
# View logs
docker-compose logs -f devcrumbs-mcp

# Check health status
curl http://localhost:3100/health
```

## Stop Server

```bash
docker-compose down
```

## Rebuild After Changes

```bash
docker-compose up -d --build
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
ports:
  - "3101:3100"  # Use different host port
```

### Permission Issues (WSL2)
```bash
# Ensure Docker has WSL2 integration enabled
# Docker Desktop > Settings > Resources > WSL Integration
```

### View Container Logs
```bash
docker logs devcrumbs-mcp-server
```

### Access Container Shell
```bash
docker exec -it devcrumbs-mcp-server sh
```

## Environment Variables

Override in `docker-compose.yml`:
- `MCP_PORT` - Server port (default: 3100)
- `LOG_LEVEL` - Logging level: debug|info|warn|error
- `NODE_ENV` - Environment (production recommended)

## Volume Mounts

By default, mounts `$HOME` directory (read-only) for access to all projects:
- Windows: Maps to WSL2 home via Docker Desktop
- Linux: Direct mount
- macOS: Docker Desktop VM mount
