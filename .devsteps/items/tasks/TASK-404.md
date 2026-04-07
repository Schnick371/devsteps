Create `packages/shared/src/core/import-session.ts`:
- `ImportSession` interface + Zod schema
- `createImportSession(path)` → generates session_id + HMAC token
- `validateSessionToken(session_id, created_at, token)` → boolean
- `readSession(sessionId)` / `writeSession(session)` atomic
- Sessions stored in `.devsteps/import-sessions/<id>.json`
- NOTE: token_hash NOT stored (re-derived); TTL default 3600s