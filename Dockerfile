# Multi-stage Docker build for production MCP server
FROM node:22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/shared/package.json ./packages/shared/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/mcp-server ./packages/mcp-server
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Build packages
RUN pnpm --filter @devcrumbs/shared build
RUN pnpm --filter @devcrumbs/mcp-server build

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nodejs:nodejs packages/mcp-server/package.json ./packages/mcp-server/
COPY --chown=nodejs:nodejs packages/shared/package.json ./packages/shared/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder --chown=nodejs:nodejs /app/packages/mcp-server/dist ./packages/mcp-server/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production \
    LOG_LEVEL=info

# Health check (if HTTP server added later)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:9090/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "packages/mcp-server/dist/index.js"]
