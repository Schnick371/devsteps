## Problem
Aktuell: Extension ist vollständig blind gegenüber laufenden Spider Web Dispatches (0 Referenzen auf mandate/cbp/MandateResult in `packages/extension/src/`).

## Geplante Implementierung

### cbpProvider.ts
- Neuer DataProvider nach bestehendem Muster (5 existieren: burndown/eisenhower/stats/timeline/traceability)
- `AgentDispatchNode` — TreeView-Node für laufende/abgeschlossene Spider Web Dispatches
- File-Watcher auf `.devsteps/cbp/` — reagiert auf neue/geänderte MandateResult-Files
- Zeigt Analyst-Status und Confidence im TreeView

### package.json Ergänzung
- `@schnick371/devsteps-shared` zu `packages/extension/package.json` hinzufügen
- Ermöglicht typisierte MandateResult-Nodes

## Prerequisite
- `@schnick371/devsteps-shared` muss in Extension package.json verfügbar sein

## Acceptance Criteria
- `cbpProvider.ts` existiert in `packages/extension/src/`
- TreeView zeigt aktive und abgeschlossene Spider Web Dispatches
- File-Watcher auf `.devsteps/cbp/` funktioniert
- Analyst-Status (pending/complete/failed) und Confidence-Score sind sichtbar
- Extension baut erfolgreich (`npm run build` in packages/extension)
- Kein bestehender DataProvider wird gebrochen