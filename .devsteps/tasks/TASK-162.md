# Update CLI Hints for Status Progression

## Objective
Update CLI command hints to guide users through review/testing phase before marking done.

## Changes Required

### packages/cli/src/commands/index.ts

**Current Hints (update command):**
```typescript
💡 Git: git commit -am "feat: completed TASK-XXX"
💡 All implementations of BUG-XXX are complete! Consider closing it.
```

**New Hints:**

**When marking in-progress:**
```typescript
💡 Next: After implementation, mark as 'review' to start testing phase
```

**When marking review:**
```typescript
💡 Testing Phase:
  • Run tests: npm test
  • Verify build: npm run build
  • Manual testing if applicable
  • When all pass: devsteps update <ID> --status done
```

**When marking done:**
```typescript
✅ Quality gates passed!
💡 Git: git commit -am "feat: completed <ID>"
```

**When parent has all children done:**
```typescript
💡 All implementations of <PARENT-ID> are complete! Consider reviewing parent.
```

### packages/cli/src/commands/bulk.ts

Add hint for bulk status updates to review.

## Implementation
- Update hint generation logic
- Add context-aware messages based on status transition
- Include testing commands in review hint
- Emphasize quality gates

## Success Criteria
- CLI guides status progression
- Testing phase clearly explained
- Users understand review requirements
- Hints are actionable
