DOC-028 erklärt die Semantik des `description`-Feldes in DOC-Items. Aktueller Stand: erklärt, dass `description` = `.md`-Datei-Inhalt ist.

Verbesserung:
- Klarstellen: `description` ist KEIN Kurzbeschreibungsfeld wie bei anderen ItemTypes
- Analogie: Bei DOC-Items entspricht `description` dem Körper des Dokuments (Hauptinhalt)
- Abgrenzung: `title` = Überschrift, `description` = Inhalt
- Hinweis: `get`-Tool gibt JSON-Metadaten + `.md`-Inhalt getrennt zurück

Das DOC-028 Item wurde vom Nutzer manuell um folgenden Satz ergänzt:
'Anders gesagt führt das `doc`-Item eine neue Ebene der Definition von Anforderungen ein, die aber parallel und mit verweisen auf die Hierarchie.'

Dieser Satz muss im Rendering der Dokumentation erscheinen — sicherstellen dass er im Content von DOC-028 korrekt verankert ist.