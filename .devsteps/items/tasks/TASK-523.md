After the regex change in packages/shared, build and test in dependency order:
1. cd packages/shared && npm run build
2. cd packages/mcp-server && npm run build
3. npm test in both packages
4. Run full test suite: npm test (root)

Verify that write_analysis_report accepts PLAN-* IDs in an integration test before marking done.

Affected: packages/shared, packages/mcp-server (rebuild order matters)