# Migrate Chalk 4 → 5 (ESM-only)

## Breaking Change
Chalk 5 is **pure ESM** - no CommonJS support.

## Our Status
✅ **Already ESM**: All packages have `"type": "module"`

## Migration Steps
1. Update chalk: 4.1.2 → 5.6.2
2. Verify all imports use ESM syntax
3. Test CLI spinner/output functionality
4. Check colored console output

## Risk Assessment
- **Low risk**: We're already ESM
- **CLI only**: Only used in packages/cli
- **Simple usage**: Basic color/styling only

## References
- https://github.com/chalk/chalk/releases/tag/v5.0.0