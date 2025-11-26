import { getMetrics, getMetricsJSON } from '../metrics.js';

/**
 * Prometheus Metrics Handler
 *
 * Exposes metrics in Prometheus text format or JSON format.
 * Used by monitoring systems to scrape metrics data.
 */

interface MetricsArguments {
  format?: 'prometheus' | 'json';
}

export async function metricsHandler(args?: MetricsArguments): Promise<string> {
  const format = args?.format || 'prometheus';

  if (format === 'json') {
    const metrics = await getMetricsJSON();
    return JSON.stringify(metrics, null, 2);
  }

  // Default: Prometheus text format
  return await getMetrics();
}

export default metricsHandler;
