## Problem

`devsteps_docs_new` creates the MD file skeleton (with Diataxis frontmatter) but **no DevSteps DOC item**. The user must manually call `devsteps add doc "..."` and set `affected_paths` afterwards.

This causes inconsistency: the file exists, but no indexed **Content Fragment** item tracks it.

## Context

A `doc` item is a **Content Fragment** — one section of a documentation document (H1=Diataxis type, H2=chapter, H3=section, H4=subsection/function). The `devsteps_docs_new` tool creates the raw file; this story makes the DOC item creation atomic with file creation.

## Desired Behavior

Option A (Breaking): `devsteps_docs_new` always creates both — file + DOC item — and sets `affected_paths` automatically.

Option B (Non-Breaking): New parameter `create_item: true` — when set, a DOC item is created in parallel and linked to the file.

**Recommendation: Option B** — backwards compatible; existing workflows are not disrupted.

## Acceptance Criteria

- [ ] `devsteps_docs_new` with `create_item: true` creates MD file + DOC item atomically
- [ ] DOC item `affected_paths` contains the created file path
- [ ] Return value contains `doc_item_id` (e.g. `DOC-042`)
- [ ] DOC item `tags` set with h-level (`h1`/`h2`/etc.) from the heading depth parameter
- [ ] Without `create_item` flag: existing behavior unchanged
- [ ] Integration tests for both paths

## Content Fragment Hierarchy (for implementors)

H1=Diataxis type · H2=chapter · H3=section · H4=subsection/function · H5=detail.
See DOC-059 for full H-level schema.