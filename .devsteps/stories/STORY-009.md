# Story: Metadata Quality Checks

## User Value
**As a** DevSteps user,  
**I want** doctor to validate metadata completeness and quality,  
**so that** my project documentation remains useful and professional.

## Problem
Metadata quality issues reduce project maintainability:
- Missing descriptions
- Empty titles or excessive length
- Missing authors or timestamps
- Inconsistent categorization
- No affected_paths on tasks

This makes items hard to understand and work with.

## Implementation Approach

### 1. **Required Fields Check**
```typescript
async function checkMetadataQuality() {
  const issues: IntegrityIssue[] = [];
  const allItems = await loadAllItems('.devsteps');
  
  for (const item of allItems) {
    // Check title length
    if (!item.title || item.title.length < 5) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        issue: 'Title too short',
        details: `Title: "${item.title}" (${item.title.length} chars)`,
        fix: 'Provide descriptive title (5-200 chars)'
      });
    }
    
    if (item.title.length > 200) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        issue: 'Title too long',
        details: `Title: "${item.title}" (${item.title.length} chars)`,
        fix: 'Shorten title to under 200 chars'
      });
    }
    
    // Check description file exists
    const descPath = join('.devsteps', `${item.type}s`, `${item.id}.md`);
    if (!existsSync(descPath)) {
      issues.push({
        severity: 'error',
        itemId: item.id,
        issue: 'Missing description file',
        details: `${descPath} not found`,
        fix: 'Create description with devsteps update'
      });
    }
    
    // Check affected_paths for tasks
    if (item.type === 'task' && (!item.affected_paths || item.affected_paths.length === 0)) {
      issues.push({
        severity: 'info',
        itemId: item.id,
        issue: 'Missing affected_paths',
        details: 'Tasks should specify which files they modify',
        fix: 'Add with: devsteps update TASK-XXX --paths file1.ts,file2.ts'
      });
    }
    
    // Check author email format
    if (item.author && !item.author.includes('@')) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        issue: 'Invalid author format',
        details: `Author: "${item.author}" (should be email)`,
        fix: 'Set valid email in author field'
      });
    }
  }
  
  return issues;
}
```

## Checks to Implement
- ✅ Title length (5-200 chars)
- ✅ Description file existence
- ✅ Missing affected_paths on tasks
- ✅ Author email format
- ✅ Missing timestamps
- ✅ Empty or generic descriptions

## Severity Levels
- **Error**: Missing description file (critical)
- **Warning**: Title issues, invalid author
- **Info**: Missing optional fields (affected_paths)

## Acceptance Criteria
- ✅ Validates all metadata fields
- ✅ Provides quality score per item
- ✅ Suggests improvements
- ✅ No auto-fix (editorial decisions)
- ✅ Ignores archived items
