#!/usr/bin/env node
/**
 * Simple validation test to verify hierarchy rules
 * Run: node test-validation.js
 */

import { validateRelationship } from './packages/shared/dist/core/validation.js';

console.log('🧪 Testing Relationship Validation Engine\n');

// Test cases
const tests = [
  // Scrum: Valid cases
  {
    name: 'Scrum: Task → Story (valid)',
    source: { id: 'TASK-001', type: 'task' },
    target: { id: 'STORY-001', type: 'story' },
    relation: 'implements',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'Scrum: Story → Epic (valid)',
    source: { id: 'STORY-001', type: 'story' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'implements',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'Scrum: Spike → Epic (valid)',
    source: { id: 'SPIKE-001', type: 'spike' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'implements',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'Scrum: Bug → Epic via implements (invalid - use relates-to or affects)',
    source: { id: 'BUG-001', type: 'bug' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'implements',
    methodology: 'scrum',
    expected: false,
  },
  {
    name: 'Scrum: Task → Bug (valid - Task implements fix)',
    source: { id: 'TASK-001', type: 'task' },
    target: { id: 'BUG-001', type: 'bug' },
    relation: 'implements',
    methodology: 'scrum',
    expected: true,
  },

  // Scrum: Invalid cases
  {
    name: 'Scrum: Task trying to implement Epic directly (invalid - needs Story)',
    source: { id: 'TASK-001', type: 'task' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'implements',
    methodology: 'scrum',
    expected: false,
  },
  {
    name: 'Scrum: Epic trying to implement Story (invalid - Epics are top-level)',
    source: { id: 'EPIC-001', type: 'epic' },
    target: { id: 'STORY-001', type: 'story' },
    relation: 'implements',
    methodology: 'scrum',
    expected: false,
  },

  // Waterfall: Valid cases
  {
    name: 'Waterfall: Task → Feature (valid)',
    source: { id: 'TASK-001', type: 'task' },
    target: { id: 'FEAT-001', type: 'feature' },
    relation: 'implements',
    methodology: 'waterfall',
    expected: true,
  },
  {
    name: 'Waterfall: Feature → Requirement (valid)',
    source: { id: 'FEAT-001', type: 'feature' },
    target: { id: 'REQ-001', type: 'requirement' },
    relation: 'implements',
    methodology: 'waterfall',
    expected: true,
  },

  // Flexible relationships (always valid)
  {
    name: 'Bug → Epic via relates-to (valid - context)',
    source: { id: 'BUG-001', type: 'bug' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'relates-to',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'Bug → Epic via affects (valid - impact)',
    source: { id: 'BUG-001', type: 'bug' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'affects',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'relates-to always valid (any types)',
    source: { id: 'TASK-001', type: 'task' },
    target: { id: 'EPIC-001', type: 'epic' },
    relation: 'relates-to',
    methodology: 'scrum',
    expected: true,
  },
  {
    name: 'blocks always valid (any types)',
    source: { id: 'BUG-001', type: 'bug' },
    target: { id: 'TASK-001', type: 'task' },
    relation: 'blocks',
    methodology: 'scrum',
    expected: true,
  },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = validateRelationship(test.source, test.target, test.relation, test.methodology);
  const success = result.valid === test.expected;

  if (success) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: ${test.expected ? 'valid' : 'invalid'}`);
    console.log(`   Got: ${result.valid ? 'valid' : 'invalid'}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    if (result.suggestion) console.log(`   Suggestion: ${result.suggestion}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
