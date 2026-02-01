---
applyTo: "**"
description: "Security practices for DevSteps development - dependency scanning, secrets, SAST"
---

# Security Practices (DevSecOps)

Security is integrated into the development lifecycle, not bolted on at the end.

## Dependency Security

### npm audit (Every Build)
```bash
# Run audit
npm audit

# Fix automatically where possible
npm audit fix

# Production only (skip devDependencies)
npm audit --production
```

- CI pipeline MUST fail on `high` or `critical` vulnerabilities
- Review `moderate` vulnerabilities, fix when possible
- Document accepted risks for unfixable vulnerabilities

### Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      development-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"
```

### Dependency Review Checklist
Before adding a new dependency:
- [ ] Is it actively maintained? (commits in last 6 months)
- [ ] Does it have known vulnerabilities? (snyk.io, npm audit)
- [ ] What's the license? (compatible with Apache 2.0)
- [ ] Is the package size reasonable?
- [ ] Can we implement this ourselves? (reduce attack surface)

### Lockfile Hygiene
- **Always commit** `package-lock.json`
- Use `npm ci` in CI (not `npm install`)
- Review lockfile changes in PRs
- Periodically regenerate to remove stale entries

## Secrets Management

### Never Commit Secrets
```gitignore
# .gitignore - CRITICAL
.env
.env.*
*.pem
*.key
secrets/
```

### Environment Variables
```bash
# .env.example (commit this, not .env!)
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_KEY=your-api-key-here
```

### Secret Detection
- Use pre-commit hooks to scan for secrets
- Tools: GitGuardian, gitleaks, detect-secrets
- Rotate immediately if secrets are exposed
- Check git history, not just current files

### GitHub Actions Secrets
```yaml
# Reference secrets in workflows
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  
# Never echo secrets
- run: echo "Token is set" # NOT: echo ${{ secrets.NPM_TOKEN }}
```

## Static Application Security Testing (SAST)

### CodeQL (GitHub Native)
```yaml
# .github/workflows/codeql.yml
name: "CodeQL"
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
```

### Common Vulnerabilities to Prevent

#### Injection Attacks
```typescript
// ❌ Bad: SQL Injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
db.query(query, [userId]);
```

#### Path Traversal
```typescript
// ❌ Bad: Path traversal risk
const filePath = `./data/${userInput}`;

// ✅ Good: Validate and sanitize
const safeName = path.basename(userInput);
const filePath = path.join('./data', safeName);
if (!filePath.startsWith('./data/')) throw new Error('Invalid path');
```

#### Prototype Pollution
```typescript
// ❌ Bad: Unsafe object merge
Object.assign(target, userInput);

// ✅ Good: Validate keys
const safeKeys = ['name', 'email'];
for (const key of safeKeys) {
  if (key in userInput) target[key] = userInput[key];
}
```

## Input Validation

### Validate All External Input
```typescript
import { z } from 'zod';

// Define schema
const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

// Validate at boundary
function handleRequest(input: unknown) {
  const validated = UserInputSchema.parse(input);
  // Now safe to use
}
```

### Sanitize Output
- Escape HTML in user-generated content
- Use Content Security Policy (CSP) headers
- Set appropriate CORS policies

## CI/CD Security Pipeline

### Recommended Pipeline Order
```yaml
jobs:
  security:
    steps:
      # 1. Checkout with limited depth
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1
      
      # 2. Install with frozen lockfile
      - run: npm ci
      
      # 3. Dependency audit
      - run: npm audit --audit-level=high
      
      # 4. SAST scan
      - uses: github/codeql-action/analyze@v3
      
      # 5. Secret scan
      - uses: gitleaks/gitleaks-action@v2
      
      # 6. Build (after security checks)
      - run: npm run build
```

## OWASP Top 10 Checklist

| Vulnerability | Mitigation |
|--------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | Strong passwords, MFA, secure sessions |
| Sensitive Data Exposure | Encryption, proper key management |
| XXE | Disable external entities in XML parsers |
| Broken Access Control | Principle of least privilege |
| Security Misconfiguration | Secure defaults, remove unused features |
| XSS | Output encoding, CSP headers |
| Insecure Deserialization | Validate before deserializing |
| Vulnerable Components | Dependabot, npm audit |
| Insufficient Logging | Structured logging, monitoring |

## Security Incident Response

1. **Detect**: Monitor alerts, user reports
2. **Contain**: Disable affected features, rotate credentials
3. **Assess**: Determine scope and impact
4. **Remediate**: Fix vulnerability, deploy patch
5. **Review**: Post-mortem, update practices

## Security Contacts

- Report vulnerabilities: security@devsteps.dev
- See SECURITY.md for disclosure policy

---

**See:** oss-professional-practices.instructions.md for CI/CD integration
