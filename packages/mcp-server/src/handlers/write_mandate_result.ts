/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler re-export: write_mandate_result
 * Thin re-export — delegates to cbp-mandate.ts handler.
 */

import { handleWriteMandateResult } from './cbp-mandate.js';
export default handleWriteMandateResult;
