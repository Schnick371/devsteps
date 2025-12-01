# AI Assistant Guide für DevSteps

## 🎯 Kern-Prinzip: Hybrid Methodology verstehen

DevSteps unterstützt **zwei parallele Hierarchien**:
1. **Scrum/Agile**: Epic → [Story | Spike | Bug] → Task
2. **Waterfall**: Requirement → Feature → [Task | Spike | Bug]

**KRITISCH**: Beide Hierarchien existieren gleichzeitig im selben Projekt!

---

## 🚨 Häufigste Fehler vermeiden

### ❌ FALSCH: Spike unter Story
```json
// NIEMALS SO!
{
  "id": "SPIKE-001",
  "linked_items": {
    "implements": ["STORY-004"]  // ❌ FALSCH!
  }
}
```

### ✅ RICHTIG: Spike unter Epic
```json
{
  "id": "SPIKE-001",
  "linked_items": {
    "implements": ["EPIC-003"],  // ✅ RICHTIG!
    "required-by": ["TASK-004"]  // Optional: Spike blockiert Task
  }
}
```

**Grund**: Spike ist auf **gleicher Ebene** wie Story, nicht darunter!

---

## 📋 Vollständige Hierarchie-Regeln

### Scrum/Agile-Baum

```
Theme (optional, strategisch)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   └── Task (Level 3)
        ├── Spike (Level 2) - GLEICHE EBENE WIE STORY!
        │   └── Task (Level 3, optional)
        └── Bug (Level 2)
            └── Task (Level 3)
```

**Erlaubte Links:**
- `Epic → Story` (implemented-by)
- `Epic → Spike` (implemented-by)
- `Epic → Bug` (implemented-by)
- `Story → Task` (implemented-by)
- `Spike → Task` (implemented-by, optional)
- `Spike → Story` (relates-to) - Spike informiert Story
- `Spike → Task` (required-by) - Spike blockiert Task

**Verbotene Links:**
- ❌ `Epic → Task` (direct, muss über Story/Spike/Bug)
- ❌ `Spike → Story` (implements) - Spike ist NICHT unter Story!
- ❌ `Task → Epic` (implements) - nur über Story/Spike/Bug

### Waterfall-Baum

```
Requirement (Level 1)
└── Feature (Level 2)
    ├── Task (Level 3)
    ├── Spike (Level 2.5 - research)
    └── Bug (Level 2.5 - defects)
```

**Erlaubte Links:**
- `Requirement → Feature` (implemented-by)
- `Feature → Task` (implemented-by)
- `Feature → Spike` (relates-to) - optional research
- `Spike → Requirement` (implements) - falls Spike auf Req-Ebene

---

## 🛠️ MCP Tool Usage Patterns

### Spike erstellen (RICHTIG)

```typescript
// 1. Spike erstellen
devsteps-add --type spike --title "Architecture Research" --priority high

// 2. Mit Epic verlinken (NICHT mit Story!)
devsteps-link --source SPIKE-001 --relation implements --target EPIC-003

// 3. Optional: Task-Dependency erstellen
devsteps-link --source SPIKE-001 --relation required-by --target TASK-004

// 4. Optional: Story informieren
devsteps-link --source SPIKE-001 --relation relates-to --target STORY-004
```

### Story erstellen (Standard)

```typescript
// 1. Story erstellen
devsteps-add --type story --title "Feature Implementation"

// 2. Mit Epic verlinken
devsteps-link --source STORY-001 --relation implements --target EPIC-001

// 3. Tasks verlinken
devsteps-link --source TASK-001 --relation implements --target STORY-001
devsteps-link --source TASK-002 --relation implements --target STORY-001
```

### Link-Validierung (vor jedem devsteps-link!)

```typescript
// Prüfe ob Link erlaubt ist:
if (source.type === 'spike' && relation === 'implements') {
  if (target.type === 'story') {
    throw Error('❌ Spike cannot implement Story! Use Epic or Feature.');
  }
  if (target.type !== 'epic' && target.type !== 'feature') {
    throw Error('❌ Spike must implement Epic or Feature only!');
  }
}

if (source.type === 'task' && relation === 'implements') {
  if (target.type === 'epic' || target.type === 'requirement') {
    throw Error('❌ Task cannot implement Epic/Requirement directly!');
  }
  if (!['story', 'spike', 'bug', 'feature'].includes(target.type)) {
    throw Error('❌ Task must implement Story/Spike/Bug/Feature only!');
  }
}
```

---

## 🔍 Trace & Visualisierung

### devsteps-trace verwenden

```bash
# Vollständiger Baum (alle Ebenen, auch done items!)
devsteps-trace EPIC-003 --depth 4

# Zeigt:
EPIC-003
├── STORY-004
│   ├── TASK-001
│   ├── TASK-002
│   └── ...
├── SPIKE-001 (gleiche Ebene wie STORY!)
│   └── required-by: TASK-004
└── SPIKE-002
    └── required-by: TASK-005
```

### Wichtige Filter (für TreeView/Dashboard)

1. **Hierarchie-Ansicht** (Standard):
   - Zeige beide Bäume (Scrum + Waterfall) parallel
   - Gruppierung nach item_type
   - Alle Ebenen sichtbar (auch done!)

2. **Status-Filter**:
   - Draft, In-Progress, Done, Blocked
   - Toggle "Show Completed" (default: ON!)

3. **Eisenhower-Matrix**:
   - Q1 (urgent-important): Zuerst anzeigen
   - Q2 (not-urgent-important): Spikes oft hier!

4. **Historische Ansicht**:
   - **KRITISCH**: Auch erledigte Items müssen sichtbar sein!
   - User will sehen was schon definiert/gemacht wurde
   - Toggle optional, aber default: Show ALL

---

## 🧠 Mental Model für AI

### Spike vs Story - Wann was?

**Story** (Feature-Entwicklung):
- "Implementiere Feature X"
- Liefert Produkt-Wert
- User kann Ergebnis nutzen
- Beispiel: "VS Code Extension Package"

**Spike** (Research/Investigation):
- "Untersuche Ansatz Y"
- Liefert **Wissen**, nicht Features
- Time-boxed (1-3 Tage)
- Informiert Stories/Tasks
- Beispiel: "MCP Architecture Research"

**Beziehung**:
```
EPIC: VS Code Extension
├── STORY: Extension Implementation ← wird umgesetzt
└── SPIKE: Architecture Research   ← informiert Story
    └── required-by: TASK-004      ← blockiert Task
```

### Cross-Methodology Links

**Scrum ↔ Waterfall**:
- Story ↔ Feature (relates-to)
- Epic ↔ Requirement (relates-to, optional)
- Tasks werden geteilt!
- Spikes werden geteilt!

**Beispiel**:
```
EPIC-003 (Scrum)
└── STORY-004 ← relates-to → FEAT-004 (Waterfall)
    ├── TASK-001 (shared!)
    └── TASK-002 (shared!)
```

---

## 📝 Checkliste vor jedem Link-Create

Bevor du `devsteps-link` aufrufst, prüfe:

1. ✅ Ist source.type + relation + target.type erlaubt?
   - Siehe Tabelle in HIERARCHY.md

2. ✅ Spike-Sonderfall?
   - Spike MUSS Epic/Feature implementieren
   - Spike KANN Story relates-to haben
   - Spike KANN Task required-by haben

3. ✅ Gibt es schon einen Link?
   - `devsteps-get <ID>` → prüfe linked_items
   - Keine Duplikate erstellen!

4. ✅ Ist die Richtung korrekt?
   - "implements" = "ist Teil von"
   - "required-by" = "blockiert"
   - "relates-to" = "informiert"

---

## 🎓 Learning from Mistakes

### Fehler #1: Direkter File-Edit statt MCP
**Problem**: Ich habe EPIC-003.json direkt editiert
**Lösung**: IMMER `devsteps-update` oder `devsteps-link` verwenden
**Warum**: Index-Konsistenz, bidirektionale Links, Validierung

### Fehler #2: Spike unter Story gelinkt
**Problem**: `SPIKE-001 --implements--> STORY-004`
**Korrektur**: `SPIKE-001 --implements--> EPIC-003`
**Regel**: Spike ist Geschwister von Story, nicht Kind!

### Fehler #3: Keine Link-Löschung möglich
**Problem**: Es gibt kein `devsteps-unlink` Tool!
**Workaround**: Script mit jq (siehe scripts/fix-spike-links.sh)
**TODO**: Feature-Request für `unlinkItem()` in shared/core/

---

## 🔮 Best Practices für AI Assistants

1. **Vor Link-Erstellung**: Recherchiere Hierarchie-Regeln
2. **Nach Link-Erstellung**: Validiere mit `devsteps-trace`
3. **Bei Unsicherheit**: Lies HIERARCHY.md
4. **Spike-Check**: Immer prüfen ob Spike richtig gelinkt ist
5. **Historische Daten**: Zeige IMMER alle Items (auch done)
6. **Fehler-Korrektur**: Script schreiben statt manuell editieren
7. **Dokumentation**: In HIERARCHY.md nachschlagen, nicht raten

---

## 📚 Weitere Ressourcen

- `.devsteps/HIERARCHY.md` - Vollständige Hierarchie-Definition
- `.devsteps/config.json` - Projekt-Konfiguration mit hierarchies
- `scripts/fix-spike-links.sh` - Beispiel für Link-Korrektur
- `packages/shared/src/core/` - Verfügbare Core-Funktionen

---

**REMEMBER**: DevSteps ist ein **Traceability-System**. Jeder Link hat Bedeutung. Falsche Links = Falsche Traceability = Chaos!
