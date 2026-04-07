# Story: Description-spezifische Felder in ItemMetadata

Füge 3 neue optionale Felder zu `ItemMetadata` hinzu die AI-Agenten ermöglichen Staleness-Detection ohne vollständige Git-History zu lesen:

## Felder

- `description_hash: string` (SHA-256 erste 16 Hex-Chars des MD-Inhalts nach normalizeMarkdown)
- `description_updated: string (ISO 8601)` (Timestamp ausschließlich bei description-Änderungen — getrennt von metadata.updated)
- `description_edit_count: number (default 0)` (Counter für Anzahl description-Änderungen)

## Implementierungsschritte

1. `packages/shared/src/schemas/index.ts`: Felder als optional/default hinzufügen
2. `packages/shared/src/core/update.ts`: Nach MD-Write → Hash berechnen, timestamp setzen, count +1
3. `packages/shared/src/core/add.ts`: Initialwerte bei Item-Erstellung setzen
4. auto-migrate: 824 bestehende Items befüllen (idempotent; leere MD → sha256 leer)
5. Unit-Tests für update.ts + add.ts (Coverage derzeit 0%)

## Warum

`metadata.updated` wird bei JEDER Feldänderung gesetzt (status, priority, tags usw.). AI-Agenten können damit nicht erkennen ob sich die Anforderungsbeschreibung geändert hat. Diese 3 Felder schließen diese Lücke mit minimalem Aufwand (< 1 Tag).

Depends-on: BUG-079 (Write-Order in update.ts)

Evidence: arXiv:2504.19413 LOCOMO Benchmark (Recency-Felder 100x token-effizienter als Full-Context), SPIKE-048