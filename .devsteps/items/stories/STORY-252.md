## Problem

Copilot muss heute das Dateisystem direkt lesen (`read_file`, `grep_search` etc.) um den Vollinhalt eines DOC-Items abzurufen. Das widerspricht dem Prinzip: **Copilot kommuniziert ausschließlich über MCP-Tools mit DevSteps**.

Das `get`-Tool gibt zwar `description` zurück, aber es fehlt eine strukturierte Sicht auf:
- Den vollständigen MD-Inhalt (wenn das Item mehr als die `description` enthält)
- Eine extrahierte Heading-Liste (für Navigation und BOM-Aufbau)
- `word_count` (für Fortschritts-Tracking)

> **Klarstellung:** Das **Schreiben** von DOC-Item-Inhalten ist bereits abgedeckt — der vorhandene `update`-Tool mit `description`-Feld ist ausreichend. Kein neues Write-Tool benötigt.

## Gewünschtes Verhalten

Erweiterung des `get`-Tools ODER neues Tool `devsteps_doc_read_content`:
```json
{ "id": "DOC-042" }
```
Gibt zurück:
```json
{
  "id": "DOC-042",
  "title": "...",
  "diataxis_type": "reference",
  "content": "# Vollständiger Markdown-Inhalt...",
  "word_count": 1240,
  "headings": ["H1: Titel", "H2: Abschnitt A", ...]
}
```

## Akzeptanzkriterien

- [ ] Vollständiger MD-Inhalt abrufbar via MCP ohne Dateisystem-Zugriff
- [ ] Gibt strukturierte `headings[]`-Liste zurück (Heading-Extraktion)
- [ ] Gibt `word_count` zurück
- [ ] Fehler wenn Item nicht vom Typ `doc` ist