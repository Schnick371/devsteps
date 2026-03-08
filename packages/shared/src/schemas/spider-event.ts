/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Spider Web hook event schema — ring_start / ring_stop / session_end
 */
import { z } from 'zod';

export const SpiderEventSchema = z.object({
  event: z.enum(['ring_start', 'ring_stop', 'session_end']),
  ring: z.number().int().min(0).max(5),
  agent_name: z.string(),
  agent_type: z.string(),
  ring_phase: z.string(),
  timestamp: z.string(),
  session_id: z.string(),
  parent_session_id: z.string().nullable(),
  duration_ms: z.number().nullable(),
  mandate_id: z.string().nullable(),
});

export type SpiderEvent = z.infer<typeof SpiderEventSchema>;
