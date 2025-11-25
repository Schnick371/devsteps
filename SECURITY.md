# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| < 0.4   | :x:                |

**Recommendation**: Always use the latest version for security updates.

## Reporting a Vulnerability

**DO NOT** report security vulnerabilities through public GitHub issues.

### Private Disclosure Process

Please report security vulnerabilities via email to:

**the@devsteps.dev**

Include in your report:
- Type of issue (e.g., XSS, SQL injection, path traversal, command injection)
- Full paths of affected source files
- Location of affected code (tag/branch/commit)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment (what can an attacker achieve?)

### What to Expect

1. **Acknowledgment**: Within 48 hours
2. **Initial Assessment**: Within 7 days
3. **Status Updates**: Every 7-14 days
4. **Resolution Timeline**: 
   - Critical: 1-7 days
   - High: 7-30 days
   - Medium: 30-90 days
   - Low: Best effort

### Disclosure Policy

- **Private Fix First**: We fix vulnerabilities privately before public disclosure
- **Credit**: You will be credited in release notes (unless you request anonymity)
- **Public Disclosure**: After fix is released, we publish a security advisory
- **CVE Assignment**: Critical vulnerabilities will receive CVE IDs

## Security Best Practices for Users

### Running DevSteps

- ✅ Keep DevSteps updated to latest version
- ✅ Review `.devsteps/` permissions (should NOT be world-readable)
- ✅ Use environment variables for sensitive configuration
- ⚠️ Do NOT commit `.devsteps/` to public repositories (use `.gitignore`)

### Contributing Code

- ✅ Follow secure coding practices
- ✅ Validate all user inputs
- ✅ Avoid hardcoded credentials
- ✅ Review dependencies for known vulnerabilities
- ✅ Run `npm audit` regularly

### MCP Server Deployment

- ✅ Run in containerized environment (Docker)
- ✅ Use read-only file systems where possible
- ✅ Limit network access to necessary ports only
- ✅ Enable logging for audit trails

## Known Security Considerations

### Local File System Access

DevSteps stores data in `.devsteps/` directory with local file system access. Ensure appropriate file permissions:

```bash
# Recommended permissions
chmod 700 .devsteps/
chmod 600 .devsteps/**/*.json
```

### MCP Server HTTP Mode

If running MCP server in HTTP mode (not stdio):
- ✅ Use authentication (API keys, JWT)
- ✅ Enable HTTPS in production
- ✅ Rate limit requests
- ✅ Restrict CORS origins

### Dependencies

This project uses automated dependency scanning:
- **Dependabot**: Automatic PR for dependency updates
- **npm audit**: Run regularly to check for known vulnerabilities
- **License checking**: Ensures Apache 2.0 compatibility

## Security Updates

Security updates are published:
- GitHub Security Advisories
- Release notes with `[SECURITY]` prefix
- Email notification to security@devsteps.dev subscribers (planned)

## Contact

For security concerns: **the@devsteps.dev**

---

**Thank you for helping keep DevSteps secure!**
