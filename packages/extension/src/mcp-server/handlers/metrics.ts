import { getMetrics, getMetricsJSON } from '../metrics.js';
import { getWorkspacePath } from '../workspace.js';

/**
 * Prometheus Metrics Handler
 *
 * Exposes metrics in Prometheus text format or JSON format.
 * Used by monitoring systems to scrape metrics data.
 */

interface MetricsArguments {
  format?: 'prometheus' | 'json';
}

export default async function metricsHandler(args: { format?: 'prometheus' | 'json' }) {
  try {
    const metrics = args.format === 'json' ? getMetricsJSON() : getMetrics();
    return {
      success: true,
      format: args.format || 'prometheus',
      metrics,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
