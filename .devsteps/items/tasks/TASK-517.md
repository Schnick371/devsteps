Die Datei `docs/reference/reference-node-lifecycle.md` (oder ähnlicher Pfad) existiert potenziell ohne zugehöriges DevSteps DOC-Item.

**Aufgabe:**
1. Prüfen ob `reference-node-lifecycle.md` bereits ein zugehöriges DOC-Item hat (search in devsteps)
2. Falls nicht: DOC-Item erstellen via `devsteps_docs_new` mit entsprechendem `affected_paths`-Eintrag und diataxis_type: reference
3. In BOM (`docs-map.json`) als Node registrieren
4. `documents`-Link zum zugehörigen STORY oder EPIC setzen falls vorhanden