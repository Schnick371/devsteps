/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: metrics
 * Returns Prometheus-format or JSON server metrics.
 */

import { getMetrics, getMetricsJSON } from '../metrics.js';

/**
 * Prometheus Metrics Handler
 *
 * Exposes metrics in Prometheus text format or JSON format.
 * Used by monitoring systems to scrape metrics data.
 */

export interface MetricsArguments {
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
