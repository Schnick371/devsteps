## Ziel

Implementierung des Gap-Nummerierungs-Algorithmus für dynamische Step-Einfügung.

### Algorithmus

1. **Initiale Nummerierung**: Top-Level Steps starten bei 10, 20, 30... (Gap = 10)
2. **Insertion**: `insertStep(after, before)` → `floor((after + before) / 2)` → z.B. 15 zwischen 10 und 20
3. **Cascade**: 10 → 15 → 12 → 17 → 11 → 14 (max ~8-9 Insertions pro Gap)
4. **Exhaustion-Detection**: Wenn `candidate === after || candidate === before` → Renumbering nötig
5. **Lokales Renumbering**: Steps im betroffenen Bereich neu nummerieren (10er-Gaps), alte Nummern in `aliases[]` Array
6. **Sub-Steps**: Sequential (10.1, 10.2, 10.3) — kein Gap-Numbering nötig (append-only)
7. **Sort-Key**: `segments.reduce((acc, seg, i) => acc + seg * Math.pow(0.001, i), 0)`

### Acceptance Criteria

- [ ] `insertStep(10, 20)` → 15
- [ ] `insertStep(10, 15)` → 12
- [ ] `insertStep(12, 15)` → 13
- [ ] Exhaustion detection löst Renumbering aus
- [ ] Aliases werden korrekt gespeichert
- [ ] Sort-Key Berechnung für beliebige Tiefe
- [ ] Unit Tests für alle Edge Cases