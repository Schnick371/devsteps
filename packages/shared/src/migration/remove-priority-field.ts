#!/usr/bin/env node
/**
 * Migration Script: Remove priority field from all work items
 * 
 * This script:
 * 1. Reads all JSON files in .devsteps/ directories
 * 2. Removes the priority field from metadata
 * 3. Verifies eisenhower field exists
 * 4. Updates index.json to remove priority field
 * 5. Validates data integrity
 * 
 * Run from project root: node packages/shared/src/migration/remove-priority-field.ts
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface WorkItemMetadata {
  id: string;
  type: string;
  title: string;
  status: string;
  priority?: string;
  eisenhower: string;
  [key: string]: unknown;
}

interface IndexItem {
  id: string;
  type: string;
  title: string;
  status: string;
  priority?: string;
  eisenhower: string;
  updated: string;
}

interface Index {
  items: IndexItem[];
  [key: string]: unknown;
}

function findDevStepsDir(startPath: string): string {
  let currentPath = startPath;
  
  while (currentPath !== '/') {
    const devstepsPath = join(currentPath, '.devsteps');
    if (existsSync(devstepsPath) && statSync(devstepsPath).isDirectory()) {
      return devstepsPath;
    }
    currentPath = join(currentPath, '..');
  }
  
  throw new Error('.devsteps directory not found');
}

function getAllJsonFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && entry !== 'archive') {
      files.push(...getAllJsonFiles(fullPath));
    } else if (stat.isFile() && entry.endsWith('.json') && entry !== 'index.json' && entry !== 'config.json') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function migrateWorkItem(filePath: string): { removed: boolean; hasPriority: boolean; hasEisenhower: boolean } {
  const content = readFileSync(filePath, 'utf-8');
  const metadata: WorkItemMetadata = JSON.parse(content);
  
  const hasPriority = 'priority' in metadata;
  const hasEisenhower = 'eisenhower' in metadata && metadata.eisenhower !== undefined;
  
  if (hasPriority) {
    delete metadata.priority;
    writeFileSync(filePath, JSON.stringify(metadata, null, 2) + '\n');
    return { removed: true, hasPriority, hasEisenhower };
  }
  
  return { removed: false, hasPriority, hasEisenhower };
}

function migrateIndex(indexPath: string): { updated: boolean; count: number } {
  const content = readFileSync(indexPath, 'utf-8');
  const index: Index = JSON.parse(content);
  
  let updated = false;
  for (const item of index.items) {
    if ('priority' in item) {
      delete item.priority;
      updated = true;
    }
  }
  
  if (updated) {
    writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
  }
  
  return { updated, count: index.items.length };
}

async function main() {
  console.log('🔄 Starting priority field removal migration...\n');
  
  // Find .devsteps directory
  const devstepsDir = findDevStepsDir(process.cwd());
  console.log(`📁 Found .devsteps at: ${devstepsDir}\n`);
  
  // Get all work item JSON files
  const jsonFiles = getAllJsonFiles(devstepsDir);
  console.log(`📋 Found ${jsonFiles.length} work item JSON files\n`);
  
  // Migrate work items
  let removedCount = 0;
  let missingEisenhower: string[] = [];
  
  for (const filePath of jsonFiles) {
    const result = migrateWorkItem(filePath);
    if (result.removed) {
      removedCount++;
    }
    if (!result.hasEisenhower) {
      missingEisenhower.push(filePath);
    }
  }
  
  console.log(`✅ Removed priority field from ${removedCount} work items`);
  
  if (missingEisenhower.length > 0) {
    console.log(`\n⚠️  WARNING: ${missingEisenhower.length} items missing eisenhower field:`);
    for (const file of missingEisenhower) {
      console.log(`   - ${file}`);
    }
  } else {
    console.log('✅ All work items have eisenhower field');
  }
  
  // Migrate index
  const indexPath = join(devstepsDir, 'index.json');
  const indexResult = migrateIndex(indexPath);
  
  console.log(`\n✅ Updated index.json (${indexResult.count} items)`);
  
  console.log('\n🎉 Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Build project: npm run build');
  console.log('2. Run tests to verify changes');
  console.log('3. Commit changes to feature branch');
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
