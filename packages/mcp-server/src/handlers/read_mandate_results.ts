/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler re-export: read_mandate_results
 * Thin re-export — delegates to cbp-mandate.ts handler.
 */

import { handleReadMandateResults } from './cbp-mandate.js';
export default handleReadMandateResults;
