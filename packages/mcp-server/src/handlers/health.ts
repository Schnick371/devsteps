import { getWorkspacePath } from '../workspace.js';

/**
 * Health Check Handler
 *
 * Returns comprehensive server health status including:
 * - Server status (healthy/degraded/unhealthy)
 * - Uptime in seconds
 * - Memory usage in MB
 * - Request metrics (total, failed, avg response time)
 * - Active connections (for future network transports)
 */

interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime_seconds: number;
  memory_mb: number;
  request_count: number;
  error_count: number;
  error_rate: number;
  avg_response_ms: number;
  connections: number;
}

// Server start time
const START_TIME = Date.now();

// Request metrics (in-memory, simple implementation)
let requestCount = 0;
let errorCount = 0;
const responseTimes: number[] = [];
const MAX_RESPONSE_SAMPLES = 100; // Keep last 100 samples

/**
 * Track successful request
 */
export function trackRequestSuccess(durationMs: number) {
  requestCount++;
  responseTimes.push(durationMs);
  if (responseTimes.length > MAX_RESPONSE_SAMPLES) {
    responseTimes.shift();
  }
}

/**
 * Track failed request
 */
export function trackRequestError(durationMs: number) {
  requestCount++;
  errorCount++;
  responseTimes.push(durationMs);
  if (responseTimes.length > MAX_RESPONSE_SAMPLES) {
    responseTimes.shift();
  }
}

/**
 * Calculate health status based on metrics
 */
function calculateHealthStatus(
  errorRate: number,
  avgResponseMs: number
): 'healthy' | 'degraded' | 'unhealthy' {
  // Healthy: error rate < 1%, avg response < 500ms
  if (errorRate < 0.01 && avgResponseMs < 500) {
    return 'healthy';
  }

  // Degraded: error rate < 5%, avg response < 1000ms
  if (errorRate < 0.05 && avgResponseMs < 1000) {
    return 'degraded';
  }

  // Unhealthy: error rate >= 5% or avg response >= 1000ms
  return 'unhealthy';
}

/**
 * Health check handler
 */
export default async function healthHandler() {
  try {
    const uptime = Math.floor((Date.now() - START_TIME) / 1000);
    const mem = process.memoryUsage();
    const memoryMB = Math.round(mem.heapUsed / 1024 / 1024);

    const errorRate = requestCount > 0 ? errorCount / requestCount : 0;
    const avgResponseMs =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const status = calculateHealthStatus(errorRate, avgResponseMs);

    return {
      success: true,
      health: {
        status,
        timestamp: new Date().toISOString(),
        uptime_seconds: uptime,
        memory_mb: memoryMB,
        request_count: requestCount,
        error_count: errorCount,
        error_rate: errorRate,
        avg_response_ms: avgResponseMs,
        connections: 0, // Not implemented for stdio
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
