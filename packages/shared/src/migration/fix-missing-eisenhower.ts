#!/usr/bin/env node
/**
 * Fix Script: Add missing eisenhower field to work items
 * 
 * Adds default eisenhower: "not-urgent-important" (Q2) to items missing the field
 */

import { readFileSync, writeFileSync } from 'node:fs';

const FILES_TO_FIX = [
  '.devsteps/bugs/BUG-010.json',
  '.devsteps/bugs/BUG-030.json',
  '.devsteps/bugs/BUG-031.json',
  '.devsteps/requirements/REQ-002.json',
  '.devsteps/tasks/TASK-051.json',
  '.devsteps/tasks/TASK-131.json',
  '.devsteps/tasks/TASK-133.json',
  '.devsteps/tasks/TASK-134.json',
  '.devsteps/tasks/TASK-135.json',
  '.devsteps/tasks/TASK-136.json',
  '.devsteps/tasks/TASK-137.json',
  '.devsteps/tasks/TASK-138.json',
  '.devsteps/tasks/TASK-139.json',
  '.devsteps/tasks/TASK-140.json',
  '.devsteps/tasks/TASK-141.json',
  '.devsteps/tasks/TASK-142.json',
  '.devsteps/tasks/TASK-143.json',
  '.devsteps/tasks/TASK-144.json',
  '.devsteps/tasks/TASK-145.json',
  '.devsteps/tasks/TASK-146.json',
  '.devsteps/tasks/TASK-147.json',
  '.devsteps/tasks/TASK-148.json',
  '.devsteps/tasks/TASK-149.json',
  '.devsteps/tasks/TASK-155.json',
  '.devsteps/tasks/TASK-156.json',
  '.devsteps/tasks/TASK-157.json',
  '.devsteps/tasks/TASK-158.json',
  '.devsteps/tasks/TASK-159.json',
  '.devsteps/tasks/TASK-160.json',
  '.devsteps/tasks/TASK-161.json',
  '.devsteps/tasks/TASK-162.json',
  '.devsteps/tasks/TASK-163.json',
];

console.log('🔄 Adding eisenhower field to 32 items...\n');

for (const file of FILES_TO_FIX) {
  const content = readFileSync(file, 'utf-8');
  const metadata = JSON.parse(content);
  
  if (!metadata.eisenhower) {
    // Insert eisenhower field after status
    const lines = content.split('\n');
    const statusIndex = lines.findIndex(line => line.includes('"status":'));
    
    if (statusIndex !== -1) {
      lines.splice(statusIndex + 1, 0, '  "eisenhower": "not-urgent-important",');
      writeFileSync(file, lines.join('\n'));
      console.log(`✅ Fixed ${metadata.id}`);
    }
  }
}

console.log('\n🎉 All 32 items now have eisenhower field!');
