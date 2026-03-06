# Story: Prompt-Integration — alle Einstiegspunkte

## Motivation

"Nur Sprint wäre zu kurz gedacht." Jeder Prompt, der einen Agenten-Workflow startet, ist ein potenzieller Session-Start. Alle müssen das Log-Protokoll kennen und nutzen.

## Betroffene Prompts

### `devsteps-20-start-work.prompt.md` (Implementierungs-Start)
- Vor Arbeit: Lies PROJECT-LOG.md letzte 2 Einträge + Epic-Log falls zutreffend
- Erhöht Kontext ohne T2-Overhead: "Was hat beim letzten Mal funktioniert/gefehlt?"

### `devsteps-25-review.prompt.md` (Review-Walkthrough)
- Nach Review: Option "Write findings to Epic Log"
- Reviewer-Walks erzeugen wertvolle Erkenntnisse — die sollen persistiert werden

### `devsteps-30-rapid-cycle.prompt.md` (Schneller Fix-Loop)
- Zu Beginn: Prüfe ob aktueller Bug schon im Log erwähnt ist (Bug-Loop-Detection!)
- Nach Abschluss: Append Rapid-Cycle-Entry (kompakt, da kein Sprint-Overhead)
- Das ist die direkte Antwort auf den "Fix Bug A → verursacht Bug B"-Loop

### `devsteps-40-sprint.prompt.md` (Sprint-Start)  
- Expliziter "Session-Context from Log" Schritt als erster Punkt nach Branch-Check

### `devsteps-90-project-context.prompt.md` (Kontext-Laden)
- Falls `PROJECT-LOG.md` existiert: als letzten Schritt laden (narrativer Kontext ergänzt strukturellen)
- Alternativ: nur "days since last entry" als Staleness-Signal

## Akzeptanzkriterien

1. `devsteps-20-start-work`: Log-Read-Schritt vor Implementierung eingebaut
2. `devsteps-25-review`: Log-Write-Option nach Review eingebaut
3. `devsteps-30-rapid-cycle`: Bug-Loop-Detection (prüft Log auf bekannte Bug-Patterns) + compact Log-Write nach Abschluss
4. `devsteps-40-sprint`: "Session-Context from Log" als expliziter erster Schritt
5. `devsteps-90-project-context`: PROJECT-LOG.md in Ladeprotokoll integriert (nach README.md, optional)