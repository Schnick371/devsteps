## Ziel

Session-State-Infrastruktur für den 5-Tool-Dialog-Import. Alle nachfolgenden Tools (TASK-406–410) hängen davon ab.

## Datei

`packages/shared/src/core/import-session.ts`  
Export via `packages/shared/src/index.ts` (barrel)

## Typen (vollständige Definitionen)

```typescript
export type ImportSessionStatus = 'open' | 'classifying' | 'review' | 'committed' | 'aborted';

export type DiataxisType =
  | 'tutorial' | 'how-to' | 'reference'
  | 'explanation' | 'architecture' | 'research';

export interface ScoreVector {
  tutorial: number; howTo: number; reference: number;
  explanation: number; architecture: number; research: number;
}

export interface SplitEntry {
  new_path: string;   // relativ zu Projekt-Root
  sections: string[]; // Abschnittsüberschriften, die in diesen Split gehören
  diataxis_type: DiataxisType;
}

export interface ClassifiedEntry {
  path: string;
  decision: 'accept' | 'split' | 'skip' | 'rewrite';
  diataxis_type?: DiataxisType;
  scores: ScoreVector;
  mixed: boolean;
  splits?: SplitEntry[];
}

export interface ImportSessionFile {
  path: string;         // relativ zu Projekt-Root
  excerpt: string;      // erste 40 Zeilen, mit \n verbunden
  size_bytes: number;
  last_modified: string; // ISO 8601
}

export interface ImportSession {
  session_id: string;   // crypto.randomUUID()
  created_at: string;   // ISO 8601 — Timestamp für HMAC-Ableitung
  ttl_seconds: number;  // Standard: 3600
  scanned_path: string; // absoluter aufgelöster Scan-Pfad
  status: ImportSessionStatus;
  files: ImportSessionFile[];
  classified: ClassifiedEntry[];
  pending: string[];    // Dateipfade noch ohne Entscheidung
}
```

**WICHTIG (Gate-Note #1):** `token_hash` wird NICHT in der Session-Datei gespeichert. Das HMAC wird bei jedem `validateSessionToken`-Aufruf neu aus `session_id + ':' + created_at` abgeleitet.

## Funktionen

```typescript
const SECRET = process.env.DEVSTEPS_IMPORT_SECRET ?? 'devsteps-import';

// Erzeugt HMAC-SHA256(session_id + ':' + created_at, SECRET) als Hex-String
export function generateSessionToken(session_id: string, created_at: string): string

// Vergleich mit crypto.timingSafeEqual — verhindert Timing-Angriffe
export function validateSessionToken(session: ImportSession, token: string): boolean

export function isSessionExpired(session: ImportSession): boolean
// → Date.now() - Date.parse(session.created_at) > session.ttl_seconds * 1000

// Erstellt neue Session oder gibt vorhandene nicht abgelaufene zurück (Idempotenz)
export function createImportSession(
  scanPath: string,
  files: ImportSessionFile[]
): { session: ImportSession; token: string }

// Liest .devsteps/import-sessions/<id>.json; gibt null zurück wenn nicht vorhanden
export function readImportSession(sessionId: string, devstepsDir: string): ImportSession | null

// Atomares Schreiben — .tmp → rename Pattern (wie atomicWriteJson in analysis.ts)
export function writeImportSession(session: ImportSession, devstepsDir: string): void

// Sucht offene nicht abgelaufene Session für denselben scanned_path
export function findExistingSession(
  scanPath: string,
  devstepsDir: string
): { session: ImportSession; token: string } | null
```

## Session-Dateipfad

`.devsteps/import-sessions/<session_id>.json`

## Sicherheit

- `node:crypto` — `createHmac`, `timingSafeEqual` (kein npm-Paket nötig)
- Token nie loggen oder in Fehlermeldungen ausgeben
- `resolveWithin(cwd, path)` → wirft Error wenn Pfad außerhalb Workspace

## Tests

`packages/shared/src/core/import-session.test.ts`:
1. `createImportSession` → erzeugt UUID, gültige ISO-Timestamps, pending = alle file-Pfade
2. `generateSessionToken` + `validateSessionToken` → Round-trip
3. `validateSessionToken` mit falschem Token → false
4. `isSessionExpired` → true nach TTL, false vorher
5. `writeImportSession` + `readImportSession` → Round-trip (temporäres Verzeichnis)
6. `findExistingSession` → gibt vorhandene Session zurück, nicht zweite anlegen

## Abhängigkeiten

- Keine neuen npm-Pakete — nur `node:crypto`, `node:fs`, `node:path`
- `atomicWriteJson`-Pattern aus `packages/shared/src/utils/file-utils.ts` übernehmen

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §2 (Session Contract)