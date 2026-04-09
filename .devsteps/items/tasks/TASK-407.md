## Ziel

Zweites Tool des Dialog-Kette. Nimmt einen Datei-Excerpt, führt `heuristicClassify` aus und gibt Score-Vektor, Gewinner, MIXED-Flag und konkrete `next_steps`-Anweisungen zurück. Bei MIXED-Typ muss Copilot den User nach einer Entscheidung fragen, bevor `devsteps_docs_classify_confirm` aufgerufen wird.

## Datei

`packages/mcp-server/src/handlers/docs-classify.ts` (NEU)  
In `packages/mcp-server/src/server.ts` registrieren.

## Input-Schema (Zod)

```typescript
z.object({
  path: z.string().min(1)
    .describe('Dateipfad aus files[] von devsteps_docs_import'),
  excerpt: z.string()
    .describe('Erste 40 Zeilen des Dateiinhalts'),
  session_id: z.string().uuid(),
  token: z.string().length(64)
    .describe('64-stelliger Hex-HMAC-Token von devsteps_docs_import'),
})
```

## Output-Schema

```typescript
{
  path: string;
  scores: ScoreVector;              // normierter Vektor, alle Werte [0,1]
  winner: DiataxisType;             // Typ mit höchstem Score
  mixed: boolean;                   // true wenn Zweit-Score >= 0.4 × Erst-Score
  signals: string[];                // lesbare Erklärungen der Scoring-Regeln
  suggested_splits?: SplitSuggestion[];  // nur wenn mixed === true
  requires_decision: boolean;       // true genau dann wenn mixed === true
  next_steps: string[];
}
```

## next_steps-Texte

**Bei MIXED (`mixed === true`):**
```
"This file is mixed-type (winner: {winner}, runner-up: {runnerUp} at {runnerUpPct}%).
Present the user with: (A) Accept as {winner}. (B) Split into {n} files per suggested_splits.
(C) Skip. (D) Mark for full rewrite.
Then call devsteps_docs_classify_confirm with decision and session_id/token."
```

**Bei klarem Gewinner:**
```
"Classification clear: {winner} ({score:.0%}).
Call devsteps_docs_classify_confirm with decision='accept', diataxis_type='{winner}', session_id, token."
```

## Implementierungsschritte

1. Token validieren via `validateSessionToken(session, token)` aus TASK-404
2. Session auf Ablauf prüfen via `isSessionExpired(session)`
3. Prüfen ob `path` in `session.files[].path` vorhanden — Fehler wenn nicht
4. `heuristicClassify(excerpt, path)` aus TASK-405 aufrufen
5. `getWinner(scores)` + `isMixed(scores)` + `getSignals(excerpt, path)` ermitteln
6. Bei MIXED: `suggestSplits(excerpt, winner)` aufrufen
7. Antwort mit `next_steps`-Text zurückgeben

**Hinweis:** Das Tool schreibt die Datei noch NICHT in `session.classified[]`. Das passiert erst in `devsteps_docs_classify_confirm` (TASK-408). Grund: Der User muss bei MIXED-Typ erst entscheiden.

## Fehlerfälle

| Bedingung | Antwort |
|-----------|---------|
| Ungültiger Token | `{ success: false, error: "Invalid or expired session token." }` |
| Session nicht gefunden | `{ success: false, error: "Session not found: {session_id}" }` |
| Session abgelaufen | `{ success: false, error: "Session expired. Start a new session with devsteps_docs_import." }` |
| Pfad nicht in Session-files[] | `{ success: false, error: "Path {path} was not part of this import session." }` |

## Tests

1. Eindeutiger Tutorial-Excerpt → `winner === 'tutorial'`, `mixed === false`
2. MIXED-Excerpt (Tutorial + Reference) → `mixed === true`, `suggested_splits` vorhanden
3. Ungültiger Token → Fehler-Antwort
4. Abgelaufene Session → Fehler-Antwort
5. `next_steps` enthält korrekten Tool-Namen (`devsteps_docs_classify_confirm`)

## Voraussetzungen

TASK-404 (Session-Utility) + TASK-405 (heuristicClassify) müssen abgeschlossen sein.

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §3 Tool B (`devsteps_docs_classify`)