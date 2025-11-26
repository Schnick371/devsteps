# Technical Debt: Replace `any[]` with Proper TypeScript Types

## Problem
**TYPE SAFETY VIOLATIONS** - Extensive use of `any` types reduces IDE support and runtime safety:

### TreeView Provider
```typescript
// devstepsTreeDataProvider.ts:100-120
function getItemMethodology(item: WorkItem, allItems: Map<string, WorkItem>): 'scrum' | 'waterfall' {
  const parent = item.linked_items?.implements?.[0];
  if (parent) {
    const parentItem = allItems.get(parent); // ✅ Typed
    // ...
  }
}

// ❌ But then used with `any`:
private getEisenhowerData(items: any[]): EisenhowerData {
  return {
    Q1: items.filter((i: any) => i.eisenhower === 'urgent-important'),
    // ^^ any type means no autocomplete, no type checking
  }
}
```

### Dashboard Panel
```typescript
// dashboardPanel.ts:150-170
private getEisenhowerData(items: any[]): EisenhowerData {
  // ❌ `any[]` loses all type information
  return {
    Q1: items.filter((i: any) => i.eisenhower === 'urgent-important'),
    Q2: items.filter((i: any) => i.eisenhower === 'not-urgent-important'),
    // ...
  };
}

private getBurndownData(tasks: any[]): BurndownData {
  // ❌ `any[]` means typos won't be caught
  const doneTasks = tasks.filter((i: any) => i.status === 'done').length;
  //                                           ^^ Could be 'doen' - no error!
}
```

## Impact
- **No IntelliSense**: Developers lose autocomplete for item properties
- **Runtime Errors**: Typos like `i.stauts` instead of `i.status` won't be caught
- **Maintenance**: Refactoring is harder (Find All References doesn't work)
- **Documentation**: Code is self-documenting with proper types

## Proposed Solution

### 1. Use `WorkItem` Type from Shared Package
```typescript
import type { WorkItem } from '@schnick371/devsteps-shared';

// ✅ Replace `any[]` with `WorkItem[]`
private getEisenhowerData(items: WorkItem[]): EisenhowerData {
  return {
    Q1: items.filter(i => i.eisenhower === 'urgent-important'),
    //                   ^^ Full autocomplete + type safety
  };
}
```

### 2. Create Specific Types for Dashboard
```typescript
interface DashboardItem extends WorkItem {
  // Add computed properties if needed
  displayName?: string;
  icon?: string;
}

private getProjectStats(items: DashboardItem[]): ProjectStats {
  // Now TypeScript knows exact shape of items
  return {
    totalItems: items.length,
    byType: this.groupByType(items), // Type-safe grouping
  };
}
```

### 3. Use Type Guards for Validation
```typescript
function isValidWorkItem(item: any): item is WorkItem {
  return (
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    typeof item.status === 'string'
  );
}

// Usage:
const validItems = rawItems.filter(isValidWorkItem);
// ^^ Type is now `WorkItem[]` instead of `any[]`
```

## Acceptance Criteria
- [ ] All `any[]` replaced with `WorkItem[]` or specific types
- [ ] All `any` parameters have proper types
- [ ] No new TypeScript errors introduced
- [ ] IDE autocomplete works for item properties
- [ ] Type guards added for runtime validation
- [ ] Build passes with `npm run typecheck`

## Implementation Notes
- Use `@schnick371/devsteps-shared` types where possible
- Create extension-specific types in `types/` folder if needed
- Add JSDoc comments for complex types
- Use `unknown` instead of `any` when type is truly unknown

## References
- TypeScript Best Practices 2025: Avoid `any`, prefer `unknown`
- Current implementation: 20+ occurrences of `any[]` in extension code
- devsteps-code-standards.instructions.md: "Use project's linter/formatter settings"
