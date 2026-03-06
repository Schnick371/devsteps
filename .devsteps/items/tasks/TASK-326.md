## GAP-1 (quality analyst)
`t3_recommendations` (Record<aspect, 'MUST'|'SHOULD'|'COULD'>) und `n_aspects_recommended` (integer) fehlen im `MandateResultSchema` Zod in `packages/shared/src/schemas/cbp-mandate.ts` — diese Felder treiben die coord Round-2-Aspect-Selektion.

## GAP-2
`failed_approaches[]` fehlt im `MandateSchema`.

## Änderungen
- Alle Felder als `.optional()` ergänzen für backward compatibility
- `MandateType`-Enum: `'quality-review'` → `'quality'` umbenennen

## Betroffene Dateien
- `packages/shared/src/schemas/cbp-mandate.ts`

## Acceptance Criteria
- `MandateResultSchema` enthält `t3_recommendations?: z.record(z.enum(['MUST', 'SHOULD', 'COULD']))`
- `MandateResultSchema` enthält `n_aspects_recommended?: z.number().int()`
- `MandateSchema` enthält `failed_approaches?: z.array(z.string())`
- `MandateType`-Enum wurde von `'quality-review'` zu `'quality'` umbenannt
- Alle neuen Felder sind `.optional()` (keine Breaking Change)
- Build und Tests laufen durch (`npm run build && npm test`)