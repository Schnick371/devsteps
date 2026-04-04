/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MADR 4.0 template generator for ADR-type DOC items
 */

/**
 * Generate a MADR 4.0-compliant skeleton description for an ADR document.
 * Called when `type === 'doc'` and the item is identified as an ADR
 * (tags include 'adr' or title starts with 'ADR').
 */
export function generateMadrTemplate(id: string, title: string, date: string): string {
  // Strip "ADR-NNN: " or "ADR-NNN " prefix from title if present
  const cleanTitle = title.replace(/^ADR-\d+[:\s]\s*/i, '').trim();

  return `# ${id}: ${cleanTitle}

## Status

Proposed

## Date

${date}

## Context and Problem Statement

<!-- What is the issue motivating this decision? What problem are we solving? -->

## Decision Drivers

- <!-- Driver 1 -->
- <!-- Driver 2 -->

## Considered Options

| Option | Description | Pros | Cons |
|--------|------------|------|------|
| Option A | <!-- describe --> | <!-- pros --> | <!-- cons --> |
| Option B | <!-- describe --> | <!-- pros --> | <!-- cons --> |

## Decision Outcome

Chosen option: **"<!-- option -->"**, because <!-- justification -->.

### Positive Consequences

- <!-- Benefit 1 -->

### Negative Consequences

- <!-- Drawback 1 -->
- Mitigation: <!-- how to address -->
`;
}

/**
 * Detect whether an item should receive a MADR template based on tags and title.
 */
export function isMadrCandidate(tags: string[], title: string): boolean {
  return tags.includes('adr') || /^ADR[-\s]/i.test(title);
}
