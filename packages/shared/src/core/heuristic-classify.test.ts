/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for Diataxis heuristic classifier (scoring vector approach, ADR-001)
 */

import { describe, expect, it } from 'vitest';
import {
  DIATAXIS_TYPES,
  heuristicClassify,
  MIXED_THRESHOLD,
  SUBHEADING_RATIO_THRESHOLD,
  TABLE_RATIO_THRESHOLD,
} from './heuristic-classify.js';

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

describe('SUBHEADING_RATIO_THRESHOLD', () => {
  it('is 0.08', () => {
    expect(SUBHEADING_RATIO_THRESHOLD).toBe(0.08);
  });
});

describe('TABLE_RATIO_THRESHOLD', () => {
  it('is 0.25', () => {
    expect(TABLE_RATIO_THRESHOLD).toBe(0.25);
  });
});

describe('heuristicClassify — structural signals (TASK-549)', () => {
  it('boosts explanation score for fragments with rich H2/H3 subheading density', () => {
    // 4 H2 subheadings in a 20-line fragment → subHeadingRatio ~ 0.2 > 0.08
    const excerpt = `# Understanding DevSteps

## Why We Built This
The idea behind DevSteps is structured workflow.

## Core Concepts
In contrast to simple lists, DevSteps models dependencies.

## Background
The reason for this is traceability in AI-assisted development.

## Motivation
History shows that context loss is the main bottleneck.

Some additional prose here about the design.`;
    const baseline = heuristicClassify('# No subheadings\n\nJust some text without headings.');
    const result = heuristicClassify(excerpt);
    expect(result.scores.explanation).toBeGreaterThan(baseline.scores.explanation);
  });

  it('boosts reference score for fragments with high table density (>25% table lines)', () => {
    // Build a fragment with >25% table lines
    const tableRows = Array.from(
      { length: 10 },
      (_, i) => `| option-${i} | string | default-${i} | no |`
    ).join('\n');
    const excerpt = `# CLI Options\n\n| Flag | Type | Default | Required |\n|------|------|---------|----------|\n${tableRows}`;
    const result = heuristicClassify(excerpt);
    expect(result.scores.reference).toBeGreaterThanOrEqual(result.scores.tutorial);
    expect(result.scores.reference).toBeGreaterThanOrEqual(result.scores['how-to']);
  });

  it('boosts reference score for flat structure (single H1, no sub-headings) with tables', () => {
    const excerpt = [
      '# Quick Reference',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| init    | Init project |',
      '| add     | Add item    |',
      '| list    | List items  |',
      '| status  | Show status |',
      '| update  | Update item |',
    ].join('\n');
    const result = heuristicClassify(excerpt);
    // Should have boosted reference (flat + tables > 15%)
    expect(result.scores.reference).toBeGreaterThan(0);
  });
});

describe('heuristicClassify — Scrum-context boost (STORY-293)', () => {
  it('boosts how-to score for German Scrum user story in story_title', () => {
    const excerpt = `# Gerät einschalten\n\nSchritt 1: Drücken Sie den Einschaltknopf.\nSchritt 2: Warten Sie auf die Initialisierung.`;
    const withoutCtx = heuristicClassify(excerpt);
    const withCtx = heuristicClassify(excerpt, undefined, {
      story_title: 'Als Endnutzer möchte ich das Gerät einschalten',
    });
    expect(withCtx.scores['how-to']).toBeGreaterThan(withoutCtx.scores['how-to']);
  });

  it('boosts reference score for Hardware-Schnittstellen Epic title', () => {
    const excerpt = `# API Details\n\nParameter list for the hardware interface.`;
    const withoutCtx = heuristicClassify(excerpt);
    const withCtx = heuristicClassify(excerpt, undefined, {
      epic_title: 'Hardware-Schnittstellen API Referenz',
    });
    expect(withCtx.scores.reference).toBeGreaterThan(withoutCtx.scores.reference);
  });

  it('returns identical scores when context is absent (zero regression)', () => {
    const excerpt = `# Getting Started\n\n## How to configure\nRun the setup command.`;
    const without = heuristicClassify(excerpt, 'docs/guide.md');
    const withUndefined = heuristicClassify(excerpt, 'docs/guide.md', undefined);
    expect(withUndefined.scores).toEqual(without.scores);
    expect(withUndefined.winner).toBe(without.winner);
  });

  it('boosts explanation score for "architektur" / overview context', () => {
    const excerpt = `# System Design\n\nThis document explains the system.`;
    const withCtx = heuristicClassify(excerpt, undefined, {
      epic_title: 'Systemarchitektur und Konzept Hintergrund',
    });
    expect(withCtx.scores.explanation).toBeGreaterThan(0);
  });

  it('boosts how-to score for English user-story pattern "as a user i want to"', () => {
    const excerpt = `# Configure notifications\n\nFollow these steps.`;
    const withCtx = heuristicClassify(excerpt, undefined, {
      story_title: 'As a user I want to configure notifications',
    });
    expect(withCtx.scores['how-to']).toBeGreaterThan(0);
  });
});
