---
doc_id: doc-item-verbesserungen-prompt
title: "Prompt: DevSteps DOC-Item Handling verbessern"
diataxis: reference
author: Thomas Hertel
status: draft
last_verified: 2026-04-09
related_items: DOC-033, DOC-034
---

# Prompt: DevSteps DOC-Item Handling verbessern

> **Verwendung:** Diesen Prompt direkt an einen Senior-Developer-Agent übergeben.  
> Alle Aufgaben sind als DevSteps-Items anzulegen — **NIEMALS** `.devsteps/items/docs/*.md` oder `*.json` direkt bearbeiten, ausschließlich MCP-Tools verwenden.

---

Du bist Senior Development Engineer im Compose4TC-Projekt. Du hast Zugriff auf alle DevSteps MCP Tools (`mcp_devsteps_*`). Lege die folgenden Verbesserungs-Items im DevSteps-Backlog an. Prüfe vor jedem `mcp_devsteps_add` per `mcp_devsteps_search` ob ein ähnliches Item bereits existiert.

---

## Aufgaben

### 1. BUG: `mcp_devsteps_list` unterstützt DOC-Typ nicht

**Type:** bug  
**Title:** `mcp_devsteps_list` gibt type=doc immer 0 zurück  
**Priority:** high  
**Description:**  
`mcp_devsteps_list` mit `type=doc` liefert immer `count: 0`, obwohl 85 DOC-Items vorhanden sind (DOC-001 bis DOC-085). `mcp_devsteps_get` per ID funktioniert korrekt. Das Problem tritt auch bei `mcp_devsteps_search` mit `type=doc` auf.

**Akzeptanzkriterium:** `mcp_devsteps_list` mit `type=doc` gibt alle vorhandenen DOC-Items zurück.

---

### 2. TASK: DOC-Item-Status-Workflow definieren und dokumentieren

**Type:** task  
**Title:** DOC-Item Status-Workflow: draft → in-progress → review → done definieren  
**Priority:** medium  
**Description:**  
Aktuell sind alle 85 DOC-Items im Status `draft`. Es gibt keinen definierten Prozess, wann ein DOC-Item auf `in-progress`, `review` oder `done` gesetzt wird und wer das darf.

Folgendes ist zu definieren und in DOC-034 (Documentation Architecture Standard) einzutragen:
- Wer darf Status-Übergänge vornehmen? (Nur coord? Auch andere Agents?)
- Was bedeutet `done` für ein DOC-Item? (Datei existiert + ist reviewed + frontmatter vollständig?)
- Trigger: Wann wird `in-progress` gesetzt? (Bei Beauftragung eines exec-doc Agents)
- Review-Kriterien: Was prüft gate-reviewer bei DOC-Items?

---

### 3. TASK: Duplikat-Bereinigung DOC-001 vs. DOC-052

**Type:** task  
**Title:** Duplikat: DOC-001 und DOC-052 haben identisches Thema (Routing Matrix)  
**Priority:** medium  
**Description:**  
Beide Items beschreiben eine "Routing-Matrix: Install/*.ps1 → Module-Mapping-Referenz":
- **DOC-001** (`routing-matrix-install-module-mapping`) — verknüpft mit TASK-326, detaillierte Beschreibung, strukturiert
- **DOC-052** (`Routing Matrix: Install/*.ps1 → Module Mapping`) — ohne `devsteps_item`, ohne strukturierte Beschreibung

Vorzugehen:
1. DOC-052 prüfen (Inhalt auslesen via `mcp_devsteps_get`)
2. Falls DOC-052 Duplikat ist: Status auf `done` (Hinweis: superseded by DOC-001) setzen und in der Beschreibung vermerken
3. DOC-001 als kanonisches Item bestätigen

---

### 4. TASK: DOC-013 Beschreibung korrigieren (fehlerhafter Inhalt)

**Type:** task  
**Title:** DOC-013 hat falsche Beschreibung (enthält AI-Chatbot-Antwort statt Doku-Spezifikation)  
**Priority:** high  
**Description:**  
DOC-013 (`AI Usage Guidelines`, `source_file: Documentation/AI-Usage.md`) enthält als `description` eine vollständige AI-Chatbot-Antwort über "Implementierungs-Szenarien und Zusammenarbeitsweise", die offensichtlich versehentlich eingefügt wurde. Das ist kein DOC-Item-Inhalt.

Die `description` von DOC-013 ist zu ersetzen durch eine sinnvolle DOC-Spezifikation analog der anderen DOC-Items (Was muss dokumentiert werden? Pflicht-Abschnitte? Abgrenzung?).

**Akzeptanzkriterium:** `description` von DOC-013 beschreibt den Inhalt des Zieldokuments, nicht einen Chatbot-Dialog.

---

### 5. TASK: Fehlendes DOC-Item für reference-node-lifecycle.md anlegen

**Type:** task  
**Title:** DOC-Item für `Documentation/reference-node-lifecycle.md` anlegen  
**Priority:** medium  
**Description:**  
Am 2026-04-08 wurde `Documentation/reference-node-lifecycle.md` erstellt (Node Bootstrap/Init/Install/Deploy Referenz). Es existiert kein entsprechendes DOC-Item im Backlog.

Anzulegendes DOC-Item:
- **doc_id:** `reference-node-lifecycle`
- **title:** `Reference: Node Bootstrap, Init, Install and Deploy`
- **diataxis:** `reference`
- **devsteps_item:** _(verknüpfen mit EPIC-007 oder neuem TASK)_
- **source_file:** `Documentation/reference-node-lifecycle.md`
- **status:** `draft`
- **description:** Vollständige Referenz der CLI-Einstiegspunkte, Parameter und Verhaltensweisen für alle vier Node-Lifecycle-Phasen: Bootstrap (`Bootstrap-Environment.ps1`), Init (`install.ps1 node -Init`), Install (`install.ps1 node -Install`) und Deploy (`install.ps1 node -Deploy`). Enthält Deprecated-Wrapper-Tabelle und Modul-Anforderungen.

---

### 6. STORY: DOC-Item Gesundheitsprüfung / Coverage-Report

**Type:** story  
**Title:** DOC-Item Health Check: Coverage-Report und Qualitätsprüfung  
**Priority:** low  
**Description:**  
Mit 85 DOC-Items ohne systematischen Überblick fehlt ein Werkzeug, das zeigt:
- Welche STORY/TASK-Items haben kein verknüpftes DOC-Item? (Coverage Gap)
- Welche DOC-Items haben `devsteps_item: null`? (Lose Items)
- Welche DOC-Items haben `source_file` gesetzt, aber die Datei existiert nicht? (Broken References)
- Welche DOC-Items sind seit >90 Tagen in `draft`? (Stale Items)

Dieser Report könnte als:
- a) `install.ps1`-Unterbefehl implementiert werden, ODER
- b) als ein loca-MCP-Tool `mcp_devsteps_health` für DOC-Items, ODER
- c) als Pester-Test im Testing-Gate laufen

**Akzeptanzkriterium:** Es gibt einen ausführbaren Report, der die o.g. 4 Metriken ausgibt.

---

### 7. TASK: Parent-Child-Gruppierung für DOC-Items einführen

**Type:** task  
**Title:** DOC-Items mit parent_id gruppieren (nach Diataxis und Thema)  
**Priority:** low  
**Description:**  
Das `parent_id`-Feld in DOC-Items ist bei fast allen Items `null`. Es gibt keine thematische Gruppierung.

Vorschlag: Die 85 Items nach Diataxis und Themenbereich in Gruppen zusammenfassen:
- **Node Lifecycle** (DOC-009, DOC-026–031, DOC-040, DOC-059, neues Item) → gemeinsames Parent
- **CLI & Routing** (DOC-001, DOC-003, DOC-004, DOC-007, DOC-018, DOC-037, DOC-081, DOC-085) → gemeinsames Parent
- **Container & Docker** (DOC-004, DOC-008, DOC-022, DOC-058, DOC-061–070, DOC-078–080) → gemeinsames Parent
- **Architecture & Decisions** (DOC-011, DOC-012, DOC-015, DOC-021, DOC-032, DOC-073, DOC-074) → gemeinsames Parent

Umsetzung: Pro Gruppe ein "Gruppen-Index"-DOC-Item als Parent anlegen, dann `parent_id` bei Kindern setzen (via `mcp_devsteps_update`).

---

## Nicht in Scope

- Inhaltliche Überarbeitung einzelner DOC-Items (das ist Aufgabe von exec-doc)
- Anlegen von Dokumentationsdateien in `Documentation/` (das ist Aufgabe von exec-doc nach Beauftragung)
- Status-Übergänge auf `done` ohne Review (Regel: nur gate-reviewer darf Status `done` setzen)
