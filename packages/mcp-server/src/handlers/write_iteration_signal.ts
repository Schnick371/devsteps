/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler re-export: write_iteration_signal
 * Thin re-export — delegates to cbp-mandate.ts handler.
 */

import { handleWriteIterationSignal } from './cbp-mandate.js';
export default handleWriteIterationSignal;
