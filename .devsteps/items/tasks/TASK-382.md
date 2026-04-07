Set up the permanent research archive infrastructure to prevent research output from being lost.

**Steps:**
1. Create `docs/research/` directory with a `README.md` explaining the archive structure convention:
   - `docs/research/{item_id}/` — one folder per work item
   - `docs/research/{item_id}/agents/` — AI-generated analyst/aspect reports
   - `docs/research/{item_id}/{brief-name}.md` — human-authored research brief
2. Add `tmp/README.md` with: "⚠️ ALL FILES IN THIS DIRECTORY ARE EPHEMERAL. Do NOT create permanent files here. Research output belongs in `docs/research/{item_id}/`."
3. Update `scripts/complete-cleanup.sh` to NOT delete `docs/research/` (add exclusion guard)
4. Verify `docs/research/` is NOT in `.gitignore`

**affected_paths:** `docs/research/README.md`, `tmp/README.md`, `scripts/complete-cleanup.sh`