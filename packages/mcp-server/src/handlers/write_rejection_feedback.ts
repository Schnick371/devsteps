/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler re-export: write_rejection_feedback
 * Thin re-export — delegates to cbp-mandate.ts handler.
 */

import { handleWriteRejectionFeedback } from './cbp-mandate.js';
export default handleWriteRejectionFeedback;
