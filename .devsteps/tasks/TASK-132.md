# Fix MCP Server & CLI - TypeScript Module Resolution Issue

## Summary
**Root Cause:** TypeScript "moduleResolution": "Bundler" prevents .js file emission + missing "type": "module" in CLI

**Impact:** MCP versions 0.6.4-0.6.13 ALL broken via npm, CLI 0.6.11 cannot rebuild

**Solution:** 
- MCP: Changed to Node16 resolution → 0.6.14 works
- CLI: Added "type": "module" → 0.6.12 works

## Results
✅ MCP Server 0.6.14 - FIRST working version since 0.6.1
✅ CLI 0.6.12 - Rebuild fixed, package size reduced 325KB → 182KB
✅ Extension 0.6.11 - Tested with fixed packages, fully functional

## Related Items
- STORY-038 (Production Publication Pipeline)
- TASK-083 (Prepare npm packages)
- TASK-084 (Auto-download in extension)
- TASK-131 (Integration testing)

## Documentation
Complete investigation in .devsteps/tasks/TASK-138.md with:
- 10 versions tested timeline
- Git history analysis
- Failed solutions (prevention)
- Build configuration fixes
- Prevention rules