# Task: AI-GUIDE.md Revision-Guidance

Erweitere .devsteps/AI-GUIDE.md mit Guidance für Copilot-Agenten:

## Zu ergänzende Abschnitte

### Staleness-Detection via description_hash
- Koordinatoren SOLLEN `description_hash` bei Mandate-Dispatch einbetten
- aspect-staleness kann hash bei Dispatch-Zeit vs. aktuellem hash vergleichen
- Hash-Mismatch = Anforderung hat sich während des Sprint-Zyklus geändert → FULL triage

### description_edit_count Signal
- edit_count > 3: Item war umstritten → erhöhte Aufmerksamkeit beim Planen
- Empfehlung: coord sollte bei edit_count > 3 automatisch FULL triage erwägen

Betroffen: .devsteps/AI-GUIDE.md, .devsteps/AI-GUIDE-COMPACT.md
Depends-on: STORY-240 (3 JSON-Felder — description_hash muss erst existieren)