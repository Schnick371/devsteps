## Problem

STORY-197 delivered the **design** of the Item Classification system (instruction file, prompt, classifier agent, taxonomy with 7 L1 domains × 36 L2 subdomains, facets, ICM-style admin/storage class model). The Zod schema, indexes, and admin vocab file were intentionally deferred.

## Goal

Implement the runtime side of STORY-197 so that classification values can actually be stored, queried, and migrated.

## Deliverables

1. **Schema** — add `metadata.classification` to `ItemMetadataSchema` in `packages/shared/src/schemas/item.ts`:
   - `domain: z.enum(['core','api','ui','ai','devops','docs','research'])`
   - `subdomain: z.string()` — governed vocab
   - `topic: z.string()` — freetext, auto-indexed
   - `concerns: z.array(z.enum(['performance','security','dx','reliability','observability','ux','accessibility','scalability'])).optional()`
   - `scope: z.enum(['platform','package','module','function']).optional()`
   - `audience: z.union([z.string(), z.array(z.string())]).optional()` — for doc items primarily
   - `cluster: z.string().optional()` — freetext

2. **Indexes** — add `by-domain` and `by-topic` index files under `.devsteps/index/`. Implement maintenance in the indexer module (mirror existing `by-status`/`by-type` pattern).

3. **Admin vocab file** — create `.devsteps/classification-schema.json` listing valid domain → subdomain pairs. Add validator that rejects assignments to unknown subdomains unless an admin vocab entry exists.

4. **Migration helper** — implement `worker-classifier` reclassification mode that re-walks items when subdomain vocabulary changes (rename/merge/split).

5. **Tests** — schema unit tests + index integration tests + a Bats CLI test for `devsteps list --classification.domain=ui`.

## Out of scope

- UI surface (TreeView "Group by classification") — separate future story.
- Auto-classification at item creation time — already explicitly excluded by STORY-197.

## Implements

This story implements the runtime side of STORY-197. STORY-197 itself is closed as design-done.

## Relates to

STORY-197, SPIKE-024