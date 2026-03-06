# Task: devsteps-30-rapid-cycle — Bug-Loop-Detection + Log

## Motivation

Der Rapid-Cycle-Prompt ist der direkteste Angriffspunkt gegen den "Fix Bug A → verursacht Bug B"-Loop. Wenn der Agent VOR dem Fix prüft, ob ähnliche Bugs im Log erwähnt sind, kann er den Loop brechen.

## Änderungen

### Neuer Schritt 0: Bug-Loop-Check
```markdown
### Schritt 0: Bug-Loop-Detection
- Read `.devsteps/logs/PROJECT-LOG.md` — ALLE Einträge (kompakt, suche nach Bug-ID oder Symptom-Begriff)
- Suche: Ist das aktuelle Symptom / die aktuelle Bug-ID schon im Log erwähnt?
- Falls ja: lese den Kontext — welcher Fix hat was verursacht?
- Plane den Fix unter Berücksichtigung bekannter Kausalitäten
- Falls Bug bereits 2x im Log erwähnt: Surface to user als POTENTIAL LOOP vor Implementierung
```

### Post-Rapid-Cycle Log-Write (kompakt)
```markdown
### Post-Fix: Compact Log Entry
Append kurzen Eintrag in PROJECT-LOG.md (kein vollständiger Session-Eintrag):
- Datum + "Rapid-Fix" + Bug-ID
- Was war der Root-Cause (1 Satz)
- Was wurde geändert (1-2 Sätze)
- Falls Loop-Pattern erkannt: explizit dokumentieren
```

## Akzeptanzkriterien
- Bug-Loop-Check ist der allererste Schritt (vor Branch-Prep)
- Bei 2+ Log-Erwähnungen des gleichen Symptoms: explizites User-Signal, kein Silent-Proceed
- Compact Log Entry ist deutlich kürzer als Sprint-Log-Entry (kein Cross-cutting-Abschnitt)