/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Prometheus Metrics for MCP Server
 * Request counters, duration histograms, error rates, and connection gauges.
 */

import { Counter, Gauge, Histogram, Registry } from 'prom-client';

/**
 * Prometheus Metrics for MCP Server
 *
 * Provides comprehensive observability for production deployments:
 * - Request counters by tool and status
 * - Response time histograms
 * - Active connections gauge
 * - Error rate tracking
 */

// Create a custom registry (allows multiple registries if needed)
export const register = new Registry();

// Default labels for all metrics
register.setDefaultLabels({
  service: 'devsteps-mcp-server',
  version: '0.1.0',
});

/**
 * Counter: Total number of tool requests
 * Labels: tool (tool name), status (success/error)
 */
export const requestCounter = new Counter({
  name: 'mcp_tool_requests_total',
  help: 'Total number of MCP tool requests',
  labelNames: ['tool', 'status'],
  registers: [register],
});

/**
 * Histogram: Tool execution duration in seconds
 * Labels: tool (tool name)
 * Buckets optimized for typical MCP operations (10ms to 30s)
 */
export const requestDuration = new Histogram({
  name: 'mcp_tool_duration_seconds',
  help: 'Duration of MCP tool executions in seconds',
  labelNames: ['tool'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30], // 10ms to 30s
  registers: [register],
});

/**
 * Gauge: Current number of active connections
 */
export const activeConnections = new Gauge({
  name: 'mcp_active_connections',
  help: 'Number of currently active MCP connections',
  registers: [register],
});

/**
 * Counter: Total number of errors by type
 * Labels: error_type (type of error encountered)
 */
export const errorCounter = new Counter({
  name: 'mcp_errors_total',
  help: 'Total number of errors by type',
  labelNames: ['error_type', 'tool'],
  registers: [register],
});

/**
 * Gauge: Server uptime in seconds
 */
export const uptime = new Gauge({
  name: 'mcp_uptime_seconds',
  help: 'Server uptime in seconds',
  registers: [register],
});

/**
 * Gauge: Memory usage in bytes
 */
export const memoryUsage = new Gauge({
  name: 'mcp_memory_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'], // heap_used, heap_total, rss, external
  registers: [register],
});

// Update memory metrics every 15 seconds
setInterval(() => {
  const mem = process.memoryUsage();
  memoryUsage.labels('heap_used').set(mem.heapUsed);
  memoryUsage.labels('heap_total').set(mem.heapTotal);
  memoryUsage.labels('rss').set(mem.rss);
  memoryUsage.labels('external').set(mem.external);
}, 15000);

// Track server start time
const START_TIME = Date.now();

// Update uptime every 10 seconds
setInterval(() => {
  uptime.set((Date.now() - START_TIME) / 1000);
}, 10000);

/**
 * Record a successful tool request
 */
export function recordSuccess(toolName: string, durationMs: number): void {
  requestCounter.labels(toolName, 'success').inc();
  requestDuration.labels(toolName).observe(durationMs / 1000); // Convert to seconds
}

/**
 * Record a failed tool request
 */
export function recordError(toolName: string, durationMs: number, errorType: string): void {
  requestCounter.labels(toolName, 'error').inc();
  requestDuration.labels(toolName).observe(durationMs / 1000);
  errorCounter.labels(errorType, toolName).inc();
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Get metrics as JSON for debugging
 */
export async function getMetricsJSON(): Promise<object> {
  return await register.getMetricsAsJSON();
}
