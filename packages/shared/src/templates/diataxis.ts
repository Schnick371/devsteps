/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Diataxis skeleton generator for DOC items.
 * Generates type-appropriate markdown templates when creating doc items.
 *
 * @see STORY-268
 */

import type { DiataxisType } from '../core/heuristic-classify.js';

const DIATAXIS_TITLE_PREFIXES: ReadonlyArray<[RegExp, DiataxisType]> = [
  [/^Tutorial:\s*/i, 'tutorial'],
  [/^How[ -]to\b/i, 'how-to'],
  [/^Reference:\s*/i, 'reference'],
  [/^ADR:\s*/i, 'architecture'],
  [/^Research:\s*/i, 'research'],
];

/**
 * Detect Diataxis type from tags or title prefix.
 * Returns undefined if no match found.
 */
export function detectDiataxisType(
  tags: readonly string[],
  title: string
): DiataxisType | undefined {
  // 1. Check tags for exact Diataxis type match
  const diataxisTypes: ReadonlyArray<DiataxisType> = [
    'tutorial',
    'how-to',
    'reference',
    'explanation',
    'architecture',
    'research',
  ];
  for (const tag of tags) {
    if (diataxisTypes.includes(tag as DiataxisType)) {
      return tag as DiataxisType;
    }
  }

  // 2. Check title prefix
  for (const [pattern, type] of DIATAXIS_TITLE_PREFIXES) {
    if (pattern.test(title)) {
      return type;
    }
  }

  return undefined;
}

/**
 * Generate a Diataxis-appropriate markdown skeleton for a doc item.
 */
export function generateDiataxisSkeleton(title: string, type: DiataxisType): string {
  switch (type) {
    case 'tutorial':
      return `# Tutorial: ${title}

> In this tutorial, you will learn how to …

## Prerequisites

- …

## Step 1: …

Expected output:
\`\`\`
…
\`\`\`

## Step 2: …

## Next Steps

- …
`;

    case 'how-to':
      return `# How to ${title}

> Goal: …

## Prerequisites

- …

## Steps

1. …
2. …
3. …

## Next Steps

- …
`;

    case 'reference':
      return `# Reference: ${title}

## Overview

…

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| … | … | … | … |

## See Also

- …
`;

    case 'explanation':
      return `# ${title}

## Background

…

## How It Works

…

## Trade-offs

…

## Further Reading

- …
`;

    case 'architecture':
      return `# ADR: ${title}

## Status

Proposed

## Context

…

## Decision

…

## Consequences

### Positive

- …

### Negative

- …
`;

    case 'research':
      return `# Research: ${title}

## Question

…

## Methodology

…

## Findings

…

## Recommendations

…

## Sources

- …
`;
  }
}
