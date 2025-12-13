## Objective
Create comprehensive documentation for running integration tests.

## Documentation Sections

### 1. Prerequisites
- BATS installation
- Node.js version
- DevSteps built
- MCP server running (for MCP tests)

### 2. Running Tests
```bash
# Run all tests
npm run test:integration

# Run CLI tests only
npm run test:cli

# Run MCP tests only
npm run test:mcp

# Run specific test file
bats tests/integration/cli/scrum-hierarchy.bats
```

### 3. CI/CD Integration
Example GitHub Actions workflow:
```yaml
- name: Run Integration Tests
  run: |
    npm run build
    npm run test:integration
```

### 4. Test Structure
Explain directory layout and purpose of each test

### 5. Adding New Tests
Guidelines for creating additional test scenarios

### 6. Troubleshooting
Common issues:
- BATS not found
- MCP server not running
- Port conflicts
- Permission errors

### 7. Understanding Test Output
How to read BATS TAP output and Node.js test results

## Acceptance Criteria
- ✅ Clear prerequisites listed
- ✅ Commands for running all test types
- ✅ CI/CD integration examples
- ✅ Troubleshooting guide
- ✅ Contribution guidelines