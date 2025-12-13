## Implementation Summary

Created intelligent runtime detection with fallback chain for MCP server execution.

### New File: `runtimeDetector.ts` ✅
**Location:** `packages/extension/src/utils/runtimeDetector.ts`

**Functions:**
- `checkCommand(cmd)` - Detects if command exists in PATH, gets version
- `detectMcpRuntime(bundledPath)` - Implements 3-tier fallback chain
- `formatDiagnostics()` - Pretty-prints detection results for logging

**Fallback Chain:**
1. **npx** (preferred) → Auto-downloads from npm registry, no installation needed
2. **node** (fallback) → Uses bundled MCP server at `dist/mcp-server.js`
3. **none** (error) → Shows platform-specific installation guide

### Updated: `mcpServerManager.ts` ✅
**Changes:**
- Import `detectMcpRuntime`, `formatDiagnostics`
- Added `runtimeConfig` property to store detected runtime
- `start()` now calls `detectMcpRuntime()` before registration
- Logs full diagnostics (Node.js, npm, npx versions/paths)
- `provideMcpServerDefinitions` uses detected command/args
- New `showNoRuntimeError()` with actionable buttons:
  - "Install Node.js" → Opens nodejs.org
  - "Check Prerequisites" → Runs validation command
  - "Show Details" → Opens output channel
- Updated `showStatus` to display runtime diagnostics

### Platform Support ✅
**Error messages include:**
- Windows: winget install instructions
- macOS: Homebrew instructions
- Linux: apt/package manager instructions

### Technical Details
- Uses `child_process.spawn()` for command detection
- Handles Windows (`where`) vs Unix (`which`) differences
- Gets version info via `--version` flag
- Parallel detection of all runtimes (Promise.all)
- Graceful error handling with detailed messages

## Testing Notes
**Manual test:** Extension detects npx successfully on this system
**Build:** ✅ No TypeScript errors
**Next:** TASK-151 will add `checkPrerequisites` command for user self-diagnosis