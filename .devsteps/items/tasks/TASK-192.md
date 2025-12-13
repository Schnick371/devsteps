# Update Item Schema with ULID Support

## Objective

Add ULID and conflict resolution metadata fields to DevStepsItem schema.

## Implementation

### 1. Install ULID Library

```bash
cd packages/shared
pnpm add ulid
pnpm add -D @types/ulid
```

### 2. Update Types (types/index.ts)

```typescript
export interface DevStepsItem {
  // Existing fields
  id: string;                    // TASK-001 (human-readable)
  type: ItemType;
  title: string;
  status: Status;
  priority: Priority;
  
  // NEW: ULID and Conflict Resolution
  ulid: string;                  // 01EQXGPFY8... (unique, sortable)
  created: string;               // ISO timestamp (from ULID)
  modified: string;              // ISO timestamp (LWW)
  version: number;               // Vector clock (starts at 1)
  
  // Optional: Agent tracking
  created_by?: string;           // Agent/User identifier
  modified_by?: string;          // Last modifier
  
  // ... rest of existing fields
}
```

### 3. Update Zod Schema (schemas/item.ts)

```typescript
import { ulid } from 'ulid';

const ulidRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

export const DevStepsItemSchema = z.object({
  id: z.string().regex(/^[A-Z]+-\d+$/),
  ulid: z.string().regex(ulidRegex),
  created: z.string().datetime(),
  modified: z.string().datetime(),
  version: z.number().int().positive(),
  created_by: z.string().optional(),
  modified_by: z.string().optional(),
  // ... existing fields
});
```

### 4. Add Utility Functions

```typescript
// packages/shared/src/utils/ulid-helpers.ts
import { ulid } from 'ulid';

export function generateUlid(): string {
  return ulid();
}

export function extractTimestamp(ulid: string): Date {
  const timestamp = parseInt(ulid.substring(0, 10), 32);
  return new Date(timestamp);
}

export function isValidUlid(value: string): boolean {
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(value);
}
```

## Validation

- [ ] TypeScript compilation succeeds
- [ ] Zod schema validation passes for valid ULIDs
- [ ] Zod schema rejects invalid ULID formats
- [ ] Utility functions correctly generate/parse ULIDs

## Notes

- ULID timestamp precision: milliseconds (48 bits)
- Random component: 80 bits (collision-proof)
- Existing items without ULID handled by migration script (separate task)