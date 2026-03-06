## Problem

`MandateResultSchema` and all CBP loop schemas use `z.literal('1.0')` for `schema_version`. Any future schema version bump (e.g. `'1.1'`) will cause Zod parse errors in the Spider Web Visualization panel and all CBP readers.

## Change Required

In `packages/shared/src/schemas/cbp-mandate.ts` and `packages/shared/src/schemas/cbp-loops.ts`:

```typescript
// BEFORE
schema_version: z.literal('1.0').default('1.0')

// AFTER
schema_version: z.string().regex(/^\\d+\\.\\d+(\\.\\d+)?$/).default('1.0')
```

Add a migration shim in any visualization reader:
```typescript
function normalizeMandateResult(raw: unknown): MandateResult {
  const v = (raw as Record<string, unknown>).schema_version ?? '1.0';
  if (v === '1.0') return MandateResultSchema.parse(raw);
  throw new UnsupportedSchemaVersionError(v); // future migration hook
}
```

## Motivation

- HC-06 constraint from Spider Web Visualization research (2026-03-05)
- ARCH-01 risk: visualization reader breaks on any schema version bump
- `schema_version` must be the first field in serialized JSON (early-exit for readers)

## Prerequisites

None — this is a schema-only change. Run `npm test` after to confirm no Zod parse regressions.

## Acceptance Criteria

- [ ] `z.literal('1.0')` replaced with semver regex in all CBP schemas
- [ ] Default still `'1.0'` (backward compatible)
- [ ] All unit tests pass
- [ ] Migration shim exists in CBP reader code paths