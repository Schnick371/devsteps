# Task: CLI getCommand() zeigt neue revision fields

packages/cli/src/commands/item-commands.ts listet Felder explizit (getCommand() Zeilen ~68-108).
Neue optionale Felder werden ohne Änderung nicht angezeigt.

## Fix

Füge Ausgabe für disclosure-Felder hinzu (nur wenn vorhanden):
- description_hash (last 8 chars des SHA für Lesbarkeit)
- description_updated (since X days ago)
- description_edit_count: X edits

Depends-on: STORY-240 (3 JSON-Felder)
Blocked-by: STORY-240 (3 JSON-Felder)