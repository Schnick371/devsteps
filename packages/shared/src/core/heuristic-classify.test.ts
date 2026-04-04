/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for Diataxis heuristic classifier (scoring vector approach, ADR-001)
 */

import { describe, expect, it } from 'vitest';
import { DIATAXIS_TYPES, heuristicClassify, MIXED_THRESHOLD } from './heuristic-classify.js';

describe('heuristicClassify', () => {
  describe('path-based signals', () => {
    it('classifies architecture/ paths as architecture', () => {
      const result = heuristicClassify('# Some doc', 'docs/architecture/adr-007.md');
      expect(result.winner).toBe('architecture');
    });

    it('classifies adr-prefixed files as architecture', () => {
      const result = heuristicClassify('# ADR', 'adr-001-decision.md');
      expect(result.winner).toBe('architecture');
    });

    it('classifies analyst-* paths as research', () => {
      const result = heuristicClassify('# Analysis', 'tmp/analyst-context-session1.md');
      expect(result.winner).toBe('research');
    });

    it('classifies research/ paths as research', () => {
      const result = heuristicClassify('# Findings', 'docs/research/spike-040.md');
      expect(result.winner).toBe('research');
    });
  });

  describe('content-based signals', () => {
    it('classifies tutorial content', () => {
      const excerpt = `# Build Your First API
## Prerequisites
You will learn how to create a REST API.
## Step 1: Set up the project
Let's start by creating a new directory.
## Step 2: Install dependencies`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('tutorial');
    });

    it('classifies how-to content', () => {
      const excerpt = `# Quickstart
## How to configure the server
## Install the dependencies
## Set up environment variables`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('how-to');
    });

    it('classifies reference content', () => {
      const excerpt = `# CLI Reference
## API
## Options
| Flag | Type | Default | Required |
|------|------|---------|----------|
| --port | number | 3000 | no |`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('reference');
    });

    it('classifies explanation content', () => {
      const excerpt = `# Understanding the Architecture
## Overview
## Why we chose this approach
The reason for this design is performance.
This is because the previous approach had scaling issues.`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('explanation');
    });

    it('classifies ADR content by structure', () => {
      const excerpt = `# ADR-008: Use doc ItemType
## Status
Accepted
## Context and Problem Statement
Should we add a new type?
## Decision Drivers
## Considered Options
## Decision Outcome`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('architecture');
    });

    it('classifies research content', () => {
      const excerpt = `# Investigation: Package Bundling
## Research Question
How should we bundle the shared package?
## Methodology
## Findings
The evidence suggests esbuild is optimal.`;
      const result = heuristicClassify(excerpt);
      expect(result.winner).toBe('research');
    });
  });

  describe('scoring vector properties', () => {
    it('returns scores for all Diataxis types', () => {
      const result = heuristicClassify('# Hello');
      for (const type of DIATAXIS_TYPES) {
        expect(result.scores[type]).toBeGreaterThanOrEqual(0);
        expect(result.scores[type]).toBeLessThanOrEqual(1);
      }
    });

    it('detects mixed types when second score >= threshold', () => {
      // Architecture path + explanation content → mixed
      const excerpt = `# Understanding the system
## Overview
The reason for this approach is reliability.
## Background
In contrast to the previous version...`;
      const result = heuristicClassify(excerpt, 'docs/architecture/overview.md');
      expect(result.mixed).toBe(true);
      expect(result.secondType).toBeDefined();
    });

    it('confidence is between 0 and 1', () => {
      const result = heuristicClassify('# Test');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty content', () => {
      const result = heuristicClassify('');
      expect(result.winner).toBeDefined();
      expect(DIATAXIS_TYPES).toContain(result.winner);
    });

    it('handles content with no signals', () => {
      const result = heuristicClassify('# Just a title\n\nNo particular classification signals.');
      expect(result.winner).toBeDefined();
    });
  });
});

describe('MIXED_THRESHOLD', () => {
  it('is 0.4', () => {
    expect(MIXED_THRESHOLD).toBe(0.4);
  });
});
