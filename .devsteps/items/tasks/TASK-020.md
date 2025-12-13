Created SECURITY.md with comprehensive vulnerability disclosure process and security guidelines.

**Critical Components**:
- **Private Disclosure**: Email-based reporting (the@devsteps.dev) to prevent public exposure
- **Supported Versions**: Clear policy (0.4.x supported, older versions EOL)
- **Response Timeline**: Commitment to 48h acknowledgment, 7d assessment, graduated resolution
- **Disclosure Policy**: Private fix first, public advisory after, CVE assignment for critical

**Security Guidance**:
- User best practices (.devsteps/ permissions, gitignore, updates)
- Contributor guidelines (input validation, credential handling, dependency audits)
- MCP server deployment (containers, HTTPS, rate limiting, CORS)

**Known Considerations**:
- Local file system access with permission recommendations
- HTTP mode security requirements
- Dependency scanning approach

**Legal Protection**:
- Establishes responsible disclosure process
- Protects maintainer from liability for unreported vulnerabilities
- Sets clear expectations for timeline and credit