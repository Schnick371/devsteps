# STORY-240 — Schema-Spezifikation: 3 ItemMetadata-Felder

<!-- bom-node: ARCH-SPIKE048-SCHEMA | parent: ARCH-SPIKE048 | doc_subtype: reference | status: approved -->
<!-- devsteps_items: SPIKE-048, STORY-240 | created_at: 2026-04-04 | classification: core/data-model/schemas -->

**Item:** STORY-240  
**Typ:** Referenz-Dokument (L2 unter Research Brief) — Technische Spezifikation  
**Datum:** 2026-04-04  
**Status:** approved — bereit für Implementation (BUG-079 ✅ Voraussetzung bereits gefixt)

---

## Kontext und Begründung

`ItemMetadata` enthält heute `metadata.updated` das bei JEDER Feldänderung setzt — Status-Transitionen, Tag-Änderungen, Priority-Updates, und Beschreibungsänderungen werden gleichbehandelt. Für AI-Agenten ist die Frage "Hat sich die _Anforderung_ (description) geändert?" aber fundamental verschieden von "Hat sich der _Status_ geändert?".

Diese Spezifikation definiert drei minimale optionale Felder die diese Lücke schließen.

---

## Neue Felder: Vollständige Spezifikation

### 1. `description_hash: string`

| Eigenschaft | Wert |
|-------------|------|
| **Typ** | `z.string().optional().default("")` |
| **Semantik** | Content-Hash der aktuellen `.md`-Datei |
| **Format** | SHA-256, erste 16 Hex-Zeichen (8 Bytes = 64-Bit) |
| **Berechnung** | `createHash('sha256').update(normalizedContent).digest('hex').slice(0, 16)` |
| **Zeitpunkt** | Nach MD-Write (update.ts); bei Erstellung (add.ts) |
| **Leer-String Default** | Neue Items ohne initiale Beschreibung erhalten `""` |

**Normalisierung vor Hash-Berechnung:**
```typescript
// normalizeMarkdown() wird bereits angewendet beim Schreiben
// → Trailing whitespace, CRLF→LF, Trailing newlines werden normalisiert
// → Hash bleibt stabil bei reinen Whitespace-Änderungen
const normalizedContent = normalizeMarkdown(description);  // bereits existierend
const hash = createHash('sha256').update(normalizedContent).digest('hex').slice(0, 16);
```

**Beispiel:**
```json
{ "description_hash": "a4f8b2c1d3e5f7a9" }
```

**Warum 16 Hex-Chars?**
- 64-bit Hash-Space: 2^64 ≈ 18 Quintillionen Kombinationen
- Kollisionswahrscheinlichkeit bei 1000 Items: < 10^-13 (praktisch null)
- Kompakter im JSON (16 vs. 64 Zeichen)

---

### 2. `description_updated: string` (ISO 8601)

| Eigenschaft | Wert |
|-------------|------|
| **Typ** | `z.string().datetime().optional()` |
| **Semantik** | Zeitstempel der letzten _Beschreibungsänderung_ |
| **Setzt bei** | `update()` mit `description` oder `append_description` Parameter |
| **Setzt NICHT bei** | Status-Transitions, Priority-Changes, Tag-Updates, Title-Changes |
| **Zeitpunkt** | Gleich wie MD-Write, vor JSON-Write (Write-Order korrekt nach BUG-079) |
| **Kein Default** | Wert ist `undefined` bis erste Beschreibungsänderung |

**Abgrenzung von `metadata.updated`:**

```
metadata.updated          → setzt bei JEDEM mcp_devsteps_update Aufruf
metadata.description_updated → setzt NUR wenn description/append_description geändert wird
```

**Beispiel:** Item mit 10 Status-Transitions und 2 Description-Edits:
```json
{
  "updated": "2026-04-04T10:00:00Z",       // ← letzter mcp_devsteps_update Aufruf
  "description_updated": "2026-03-28T14:30:00Z",  // ← letzte Requirements-Änderung
  "description_edit_count": 2
}
```

---

### 3. `description_edit_count: number`

| Eigenschaft | Wert |
|-------------|------|
| **Typ** | `z.number().int().nonnegative().default(0)` |
| **Semantik** | Anzahl der Requirements-Änderungen seit Erstellung |
| **Setzt bei** | Gleich wie `description_updated` — bei `description`/`append_description` |
| **Inkrement** | `+1` pro Update, nicht kumulativ per Update |
| **Initial** | `0` in add.ts; Backfill via auto-migrate mit `0` |

**AI-Nutzung:**
```
edit_count=0  → Item nie seit Erstellung geändert (sehr frisch oder sehr stabil)
edit_count=1  → Überarbeitung nach initialem Draft — normal
edit_count=3+ → Mehrfach überarbeitet — erhöhte Kontroverenz-Wahrscheinlichkeit
edit_count=6+ → Stark kontrovers — proaktiv Stakeholder-Klärung empfehlen
```

---

## Implementierungsplan (STORY-240)

### Schritt 1: Zod-Schema (packages/shared/src/schemas/index.ts)

```diff
 export const ItemMetadata = z.object({
   id: z.string(),
   // ... existing fields ...
   commits: z.array(GitCommit).default([]),
+  description_hash: z.string().optional().default(""),
+  description_updated: z.string().datetime().optional(),
+  description_edit_count: z.number().int().nonnegative().default(0),
   metadata: z.record(z.unknown()).optional(),
 });
```

### Schritt 2: update.ts — Hash + Zähler

```typescript
// packages/shared/src/core/update.ts
// Nach MD-Write (BUG-079 bereits gefixt: MD wird vor JSON geschrieben)

import { createHash } from 'node:crypto';

if (args.description !== undefined || args.append_description !== undefined) {
  // MD-Datei wird bereits geschrieben — jetzt Hash berechnen
  const writtenContent = readFileSync(descriptionPath, 'utf-8');
  metadata.description_hash = createHash('sha256')
    .update(writtenContent)
    .digest('hex')
    .slice(0, 16);
  metadata.description_updated = getCurrentTimestamp();
  metadata.description_edit_count = (metadata.description_edit_count ?? 0) + 1;
}
```

### Schritt 3: add.ts — Initialisierung

```typescript
// packages/shared/src/core/add.ts
// Beim Erstellen des initialen MD-Inhalts:

if (args.description) {
  writeFileSync(descriptionPath, normalizeMarkdown(args.description));
  const content = readFileSync(descriptionPath, 'utf-8');
  metadata.description_hash = createHash('sha256')
    .update(content)
    .digest('hex')
    .slice(0, 16);
  metadata.description_updated = metadata.created;  // Erstellungszeitpunkt
  metadata.description_edit_count = 0;
}
```

### Schritt 4: auto-migrate.ts — Backfill für 824 Items

```typescript
// packages/shared/src/core/auto-migrate.ts
// Idempotente Migration: Felder setzen wenn nicht vorhanden

for (const item of allItems) {
  let needsUpdate = false;
  
  if (item.description_hash === undefined) {
    const mdPath = getDescriptionPath(item.id, item.type);
    if (existsSync(mdPath)) {
      const content = readFileSync(mdPath, 'utf-8');
      item.description_hash = createHash('sha256')
        .update(content)
        .digest('hex')
        .slice(0, 16);
    } else {
      item.description_hash = "";  // Leer-String für Items ohne MD
    }
    needsUpdate = true;
  }
  
  if (item.description_edit_count === undefined) {
    item.description_edit_count = 0;  // Konservativ: 0, nicht schätzbar
    needsUpdate = true;
  }
  
  // description_updated: NICHT backfillbar — kein historischer Timestamp bekannt
  // Bleibt undefined für ältere Items; setzt erst beim nächsten Edit
  
  if (needsUpdate) {
    writeFileSync(metadataPath, JSON.stringify(item, null, 2));
  }
}
```

### Schritt 5: Tests (KRITISCH — derzeit 0% Coverage)

Zu erstellen (referenz aspect-quality Output):

```
packages/shared/src/core/__tests__/update.test.ts:
- hash_changes_on_description_update
- hash_stable_on_status_change
- edit_count_increments_on_description_update
- edit_count_stable_on_status_change
- description_updated_changes_on_description_update
- description_updated_stable_on_title_change
- write_order: MD_before_JSON (Regression-Test für BUG-079)

packages/shared/src/core/__tests__/add.test.ts:
- initial_hash_set_on_creation
- initial_edit_count_is_zero
- description_updated_equals_created_on_first_add
```

---

## Breaking Change Assessment

**Kein Breaking Change.** Alle drei Felder sind optional mit Defaults:
- `description_hash: ""` — leerer String wenn nicht gesetzt
- `description_updated: undefined` — nicht vorhanden in alten Items
- `description_edit_count: 0` — Default wenn nicht gesetzt

Bestehende Clients die diese Felder nicht kennen werden nicht beeinträchtigt. JSON-Serialisierung schreibt `undefined`-Felder nicht → alter JSON bleibt kompatibel.

---

## Migrations-Risiko

**Gering.** auto-migrate ist bereits im Codebase vorhanden und wird beim MCP-Server-Start ausgeführt. Neue Migrations-Schritte sind idempotent (prüfen `=== undefined` vor Schreiben). Bei 824 Items und avg. 2KB/Item: ~1.6 MB total — Migration läuft in < 1 Sekunde.

---

*Klassifikation: `core/data-model/schemas` · Scope: `module` · Cluster: `revision-md-001`*  
*Implements: STORY-240 · Depends-on: BUG-079 (✅ done) · Relates-to: SPIKE-048*
