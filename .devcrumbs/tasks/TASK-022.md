# TASK-022: Copyright and Trademark Protection Strategy

## Purpose
Implement comprehensive copyright protection and trademark usage guidelines to protect Thomas Hertel's intellectual property rights.

## Copyright Protection

### 1. Source File Headers
Add copyright notice to all main source files:

**Template:**
\`\`\`typescript
/**
 * DevCrumbs - Developer Task Tracking System
 * 
 * Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
\`\`\`

**Files to update:**
- `packages/mcp-server/src/index.ts`
- `packages/mcp-server/src/http-server.ts`
- `packages/cli/src/index.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/core/index.ts`

### 2. Package Metadata
Update all package.json files:
\`\`\`json
{
  "author": {
    "name": "Thomas Hertel",
    "email": "the@devcrumbs.dev",
    "url": "https://devcrumbs.dev"
  },
  "copyright": "Copyright © 2025 Thomas Hertel"
}
\`\`\`

## Trademark Protection

### 3. Create TRADEMARK.md
\`\`\`markdown
# DevCrumbs Trademark Usage Policy

## Trademark Ownership

"DevCrumbs" is a trademark of **Thomas Hertel** (the@devcrumbs.dev). All rights reserved.

## Scope of Apache License 2.0

The Apache License 2.0 grants you broad permissions to use, modify, and distribute the **DevCrumbs software**. However, per Section 6 of the license:

> This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor.

## What You CAN Do ✅

**Use the Software:**
- Use DevCrumbs as-is for any purpose (personal, commercial, etc.)
- Modify DevCrumbs source code
- Redistribute DevCrumbs under Apache 2.0 terms
- Create derivative works based on DevCrumbs

**Refer to DevCrumbs:**
- State "based on DevCrumbs" or "powered by DevCrumbs"
- Link to https://devcrumbs.dev or this repository
- Write articles/tutorials about DevCrumbs

## What You CANNOT Do ❌

**Trademark Infringement:**
- ❌ Name your product/service "DevCrumbs" or "DevCrumbs [Something]"
- ❌ Use "DevCrumbs" in domain names (e.g., devcrumbs-plus.com)
- ❌ Imply official endorsement by Thomas Hertel without authorization
- ❌ Use the DevCrumbs name/logo in a way that confuses users about origin

**Examples of Violations:**
- "DevCrumbs Pro" (implies official enhanced version)
- "DevCrumbs Cloud" (implies official cloud service)
- "DevCrumbs for VS Code" (use "Task Tracker for VS Code (uses DevCrumbs)")

## Proper Attribution

When distributing DevCrumbs or derivative works, you MUST:

1. **Retain License Notice:**
   - Keep the LICENSE.md file
   - Include copyright notice: "Copyright © 2025 Thomas Hertel"

2. **Acknowledge Origin:**
   - State "based on DevCrumbs by Thomas Hertel"
   - Link to original project: https://github.com/Schnick371/devcrumbs

3. **Distinguish Your Work:**
   - Use a different name for your derivative
   - Make it clear you are not the original author

**Example:**
> "TaskFlow is a task tracking system based on DevCrumbs by Thomas Hertel (https://devcrumbs.dev). TaskFlow is not affiliated with or endorsed by the DevCrumbs project."

## Requesting Permission

For uses not covered by this policy, contact:

**Thomas Hertel**  
the@devcrumbs.dev

We may grant trademark licenses for:
- Educational partnerships
- Non-profit use
- Commercial integrations (case-by-case)

## Enforcement

We take trademark protection seriously. Violations may result in:
1. Cease and desist notice
2. Request to rename your project
3. Legal action (if necessary)

We prefer friendly resolution. If you're unsure about usage, just ask!

## Common Law Trademark Rights

"DevCrumbs" is protected as a common law trademark through:
- Domain ownership: devcrumbs.dev (registered [DATE])
- First use in commerce: [DATE]
- Continuous use in software distribution

No formal trademark registration is required for enforcement under US law.

---

**Last Updated**: November 23, 2025  
**Contact**: the@devcrumbs.dev
\`\`\`

### 4. Create NOTICE File
Per Apache License 2.0, create `/NOTICE`:
\`\`\`
DevCrumbs - Developer Task Tracking System

Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)

This product includes software developed at DevCrumbs (https://devcrumbs.dev).

Licensed under the Apache License 2.0.
See LICENSE.md for details.

---

THIRD-PARTY ATTRIBUTIONS:

Codicons
Copyright (c) Microsoft Corporation
Licensed under CC-BY-4.0
https://github.com/microsoft/vscode-codicons
\`\`\`

## Implementation Checklist
- [ ] Add copyright headers to main source files
- [ ] Update package.json author fields
- [ ] Create TRADEMARK.md file
- [ ] Create NOTICE file
- [ ] Update LICENSE.md with copyright notice (if not done in TASK-016)
- [ ] Add trademark symbol (™) to README.md first mention: "DevCrumbs™"

## Legal References
- Apache License 2.0, Section 6 (Trademark restriction)
- Common law trademark rights (US)
- Prior use defense via domain registration

## Dependencies
- Requires: TASK-016 (LICENSE fix) completed
- Complements: TASK-017 (README enhancement)