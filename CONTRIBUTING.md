# Contributing to DevSteps

Thank you for your interest in contributing! We welcome contributions from everyone.

## Table of Contents
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Developer Certificate of Origin](#developer-certificate-of-origin)

## How Can I Contribute?

### Reporting Bugs
- Use GitHub Issues with the "bug" label
- Include: steps to reproduce, expected behavior, actual behavior
- Add relevant system info (OS, Node version, etc.)

### Suggesting Features
- Use GitHub Issues with the "enhancement" label
- Explain the use case and expected behavior
- Discuss design before implementation

### Contributing Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes following our coding standards
4. Write or update tests as needed
5. Run tests and linting (`npm test`, `npm run lint`)
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
7. Sign your commits (DCO - see below)
8. Push to your fork and submit a Pull Request

## Development Setup

### Prerequisites
- Node.js 20+ or Bun runtime
- Git
- VS Code (recommended)

### Installation
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/devsteps.git
cd devsteps

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Monorepo Structure
- `packages/shared` - Core types, schemas, business logic
- `packages/cli` - Command-line interface
- `packages/mcp-server` - MCP protocol server for AI integration
- `packages/extension` - VS Code extension

## Pull Request Process

1. **Update Documentation**: Update README.md, docs/, or comments if needed
2. **Add Tests**: New features require tests (Vitest)
3. **Run Quality Checks**:
   ```bash
   npm run lint      # Biome linting
   npm run format    # Biome formatting
   npm run typecheck # TypeScript validation
   npm test          # Run test suite
   ```
4. **Commit Message Format**: Use Conventional Commits
   - `feat: add new command`
   - `fix: resolve bug in search`
   - `docs: update installation guide`
   - `refactor: simplify validation logic`

5. **Sign Commits**: Add DCO sign-off (see below)

6. **PR Description**: Explain WHAT changed and WHY

## Coding Standards

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Use explicit types for public APIs
- Avoid `any` (use `unknown` + type guards)

### Formatting
- Biome formatter (automatic via `npm run format`)
- No ESLint/Prettier (Biome handles both)

### File Size
- Components/Services: max 200-300 lines
- Complex modules: max 400 lines
- 1000+ lines = must refactor

### Testing
- Unit tests for business logic
- Integration tests for CLI commands
- E2E tests for critical workflows

## Developer Certificate of Origin

By contributing to this project, you certify that:

> **Developer Certificate of Origin**  
> Version 1.1
>
> By making a contribution to this project, I certify that:
>
> (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or
>
> (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications; or
>
> (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.
>
> (d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

### Signing Commits

```bash
# Sign individual commit
git commit -s -m "feat: add new feature"

# Configure automatic signing
git config --global format.signOff true
```

Your commit message will include:
```
Signed-off-by: Your Name <your.email@example.com>
```

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Security Issues**: Email the@devsteps.dev (see [SECURITY.md](SECURITY.md))
- **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

Thank you for contributing to DevSteps! 🚀
