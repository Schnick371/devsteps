## Objective
Publish @schnick371/devsteps-shared package to npm registry.

## Pre-requisites
- Package already configured in packages/shared/package.json
- Version: 0.5.0
- Scope: @schnick371
- Access: public

## Publishing Steps

### 1. Verify package.json
Check packages/shared/package.json:
- name: @schnick371/devsteps-shared
- version: 0.5.0
- publishConfig: { access: public }
- files: [dist, .github]

### 2. Build package
cd packages/shared && npm run build

### 3. Test build output
Verify dist/ contains all necessary files

### 4. Publish to npm
npm publish

### 5. Verify publication
Check: https://www.npmjs.com/package/@schnick371/devsteps-shared

## Dependencies Update
After publishing, update package.json in:
- packages/cli/package.json
- packages/mcp-server/package.json
- packages/extension/package.json

Change from file:../shared to: ^0.5.0

## Validation
- Package visible on npmjs.com
- Can install with: npm install @schnick371/devsteps-shared
- Other packages can use it as dependency