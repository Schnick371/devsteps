# Migrate Express 4 → 5 with automated codemods

## Breaking Changes
- Promise support in middleware (async/await)
- Path matching syntax changes
- Deprecated method removals
- MIME type changes

## Our Usage
✅ **Simple use-case**: Only HTTP server for metrics endpoint
✅ **Automated migration**: `npx @expressjs/codemod upgrade`

## Migration Steps
1. Update express: 4.21.2 → 5.1.0
2. Run automated codemods: `npx @expressjs/codemod upgrade`
3. Test HTTP server startup
4. Test metrics endpoint
5. Verify error handling

## Risk Assessment
- **Low risk**: Minimal Express usage
- **Automated**: Codemods handle most changes
- **Better async**: Native promise support

## References
- https://expressjs.com/en/guide/migrating-5.html