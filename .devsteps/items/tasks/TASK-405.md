## Ziel

Reine Funktion für Diataxis-Klassifikation via Score-Vektor. Kein Filesystem-Zugriff — nur Textanalyse auf dem Excerpt. Basis für `devsteps_docs_classify` (TASK-407).

## Datei

`packages/shared/src/core/heuristic-classify.ts`  
Export via `packages/shared/src/index.ts`

## Exports

```typescript
// Hauptfunktion: gibt normierten Score-Vektor zurück
export function heuristicClassify(excerpt: string, filepath?: string): ScoreVector

// Typ mit höchstem Score
export function getWinner(scores: ScoreVector): DiataxisType

// true wenn second_highest >= threshold × winner (Standard 0.4)
export function isMixed(scores: ScoreVector, threshold?: number): boolean

// Lesbare Erklärungen welche Regeln ausgelöst haben
export function getSignals(excerpt: string, filepath?: string): string[]

// Schlägt Aufteilungen vor wenn Datei gemischt ist
export function suggestSplits(excerpt: string, winner: DiataxisType): SplitSuggestion[]
```

## 9 Scoring-Regeln (additive Gewichte)

| # | Bedingung | Dimension | Gewicht |
|---|-----------|-----------|---------|
| 1 | `filepath` matcht `/analyst-/` oder `/aspect-/` | research | +0.5 |
| 2 | `"You will learn"` im Excerpt | tutorial | +0.4 |
| 3 | H1/H2 beginnt mit `"How to"` oder `"Configure"` oder `"Set up"` | how-to | +0.4 |
| 4 | `"ADR-\\d{3}"` Pattern im Text | architecture | +0.5 |
| 5 | Sowohl `"## Status:"` als auch `"## Consequences:"` vorhanden | architecture | +0.3 |
| 6 | H1 ist eine Frage (`"What is"`, `"Why does"`, `"Why is"`) | explanation | +0.4 |
| 7 | `"## Parameters"` oder `"## Options"` vorhanden | reference | +0.4 |
| 8 | Code-Block-Dichte > 40 % (Anzahl ```` ``` ```` Marker / Zeilenanzahl) | reference | +0.2 |
| 9 | Nummerierte Liste (`"1. "`) in den ersten 20 Zeilen | tutorial | +0.2 |

**Normierung:** `score[typ] = raw[typ] / Summe(alle_roh)`

**Zero-Signal-Fallback** (alle Rohwerte = 0): `{ reference: 0.5, explanation: 0.5, rest: 0 }`

**MIXED-Schwellenwert:** `zweithöchster >= 0.4 × höchster`

## Funktionssignatur (kanonisch — Gate-Note #3)

```typescript
export function heuristicClassify(excerpt: string, filepath?: string): ScoreVector
```

## Tests

`packages/shared/src/core/heuristic-classify.test.ts` — eine Testfunktion pro Regel:

1. `"analyst-archaeology.md"` + Analyse-Content → research dominiert
2. `"You will learn"` im Excerpt → tutorial dominiert  
3. H1 `"How to configure X"` → how-to dominiert
4. `"ADR-001"` im Text → architecture dominiert
5. `"## Status:"` + `"## Consequences:"` → architecture dominiert
6. H1 `"What is the data model?"` → explanation dominiert
7. `"## Parameters"` Tabelle → reference dominiert
8. > 40 % Code-Blöcke → reference boost
9. `"1. "` in Zeile 5 → tutorial boost
10. Leerer String → Fallback `{ reference: 0.5, explanation: 0.5 }`
11. MIXED-Erkennung: Tutorial + Reference Content → `isMixed()` gibt true zurück
12. `getWinner()` gibt immer genau einen Typ zurück

## Abhängigkeiten

- Keine externen Pakete
- Importiert `DiataxisType`, `ScoreVector`, `SplitEntry`, `SplitSuggestion` aus `./import-session.ts`

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §5 (heuristicClassify Pure-Function Spec)