## Follow-up Forschungsfragen zu SPIKE-021

### zu 3. Parent-Context Injection — wie genau?
Wie wird das LLM-Text-Ergebnis eines subagents in den Parent-Context "injiziert"? Technisch: Was passiert mit dem Text zwischen runSubagent und nächstem LLM-Call?

### zu 4. CBP-Datei-Audit
Analysiere .devsteps/cbp/ ob die Dateien tatsächlich so genutzt werden wie erwartet.

### zu 5. Coord Agent — was genau passiert?
Liest coord das Ergebnis und übergibt Dateipfad direkt weiter? Oder synthetisiert er es intern bevor er es an nächsten subagent gibt?

### zu 6.a. Phantom-Felder — aufnehmen oder entfernen?
report_path, upstream_paths, verdict — brauchen wir sie wirklich?

### zu 6.b. TIER2-PROTOCOL.md LÖSCHEN
Nicht nur deprecieren — vollständig löschen!

### zu 6.c. Quorum-Check als Flag?
War das als Flag-Mechanismus gedacht?

### zu 6.d. VS Code 1.109+ Requirement dokumentieren + in Abhängigkeiten aufnehmen
User Onboarding + package.json engines field + Warnung im CLI?

### zu 6.e. Tracing verbessern
Wie können wir Tracing des Spider Web Dispatch konkret verbessern?