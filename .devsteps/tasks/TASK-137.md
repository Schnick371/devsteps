## Problem
Both CLI and MCP had hardcoded version '0.1.0' in src/index.ts, causing --version to show wrong version.

## Solution
Import version from package.json using createRequire:
```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
```

## Changes
- CLI: Read version from package.json
- MCP: Read version from package.json (both CLI and server info)
- Testing: CLI shows 0.6.4, MCP shows 0.6.5 ✅

## Why Important
- Version displayed to users must match published package
- Prevents confusion during debugging
- Follows single source of truth principle