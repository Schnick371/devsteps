---
name: sdevsteps-scan-violation
description: "Strukturelle Code-Qualitätsprüfung: S1-S4 (Dateigröße, Funktionslänge, Concerns, Dead Code) + D1-D12 (DevOps-Tooling: Biome, esbuild, TypeScript strict, ESM). USE FOR: vor Refactoring, in gate-reviewer Qualitätsprüfung, nach Implementierung. Gibt messbare Verletzungs-Tabellen + Scan-Ablauf-Steps."
context: fork
---

# Violation Scan — Strukturelle Code-Qualitätsprüfung

**Invocation:** `/violation-scan` · auto-match: "violation", "code quality", "refactor check", "S1", "D1", "file too large"

## Was prüft dieser Skill?

Messbare Verletzungs-Kriterien für Struktur, Dateigröße und DevOps-Tooling.  
Basis: [`devsteps-code-standards.instructions.md`](.github/instructions/devsteps-code-standards.instructions.md) + [`devsteps-build-devops.instructions.md`](.github/instructions/devsteps-build-devops.instructions.md)

---

## S — Struktur & Größe

| #   | Kriterium                                 | Schwellwert  | Aktion                 |
| --- | ----------------------------------------- | ------------ | ---------------------- |
| S1  | Dateizeilenzahl                           | > 400 Zeilen | Datei aufteilen        |
| S2  | Funktions-/Methodenzeilenzahl             | > 75 Zeilen  | In Helper extrahieren  |
| S3  | Mehrere Top-Level-Concerns in einer Datei | > 1          | Nach Concern aufteilen |
| S4  | Toter / auskommentierter Code             | beliebig     | Löschen                |

---

## D — DevOps-Tooling (Biome, Build, Config)

| #   | Kriterium                                  | Nachweis (grep/find)                                            | Aktion                                |
| --- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------- |
| D1  | Veraltete Linter-/Formatter-Abhängigkeiten | `"eslint"`, `"prettier"`, `"babel"` in `package.json`           | Entfernen — Biome ersetzt beides      |
| D2  | Veraltete Config-Dateien                   | `.eslintrc.*`, `.prettierrc.*`, `.babelrc`, `babel.config.*`    | Löschen                               |
| D3  | Deaktivierungs-Kommentare für alte Tools   | `// eslint-disable`, `// prettier-ignore`                       | Entfernen                             |
| D4  | esbuild-Config ohne Source Maps            | `sourcemap` fehlt in `esbuild.{js,mjs,cjs}`                     | `sourcemap: true` ergänzen            |
| D5  | Inkonsistente esbuild-Configs              | Unterschiedliche `target`, `format`, `platform` ohne Begründung | Auf Root-Baseline normalisieren       |
| D6  | `tsconfig.json` erweitert nicht Root       | `"extends": "../../tsconfig.json"` fehlt                        | Extends ergänzen                      |
| D7  | TypeScript strict mode aus                 | `"strict": false` oder `strict` fehlt                           | Aktivieren                            |
| D8  | Tiefe relative Imports trotz Pfad-Alias    | Imports mit `../../../` oder tiefer                             | Durch Alias ersetzen                  |
| D9  | npm scripts unvollständig                  | `typecheck`, `lint`, `format`, `clean` fehlen in `package.json` | Fehlende ergänzen                     |
| D10 | CJS-Syntax in ESM-Paket                    | `require(`, `module.exports` in Paket mit `"type": "module"`    | Auf ESM migrieren                     |
| D11 | Explizite `any`-Typen                      | `": any"`, `as any`, `<any>` in `.ts`/`.tsx`                    | Durch `unknown` + Type Guard ersetzen |
| D12 | Ungenutzte Imports                         | Biome-reportable unused imports                                 | Entfernen                             |

---

## Scan-Ablauf (für Agents)

1. **Schritt 1 — Größen-Scan:** `Get-ChildItem -Recurse -File | Where-Object { (Get-Content $_.FullName).Count -gt 400 }`
2. **Schritt 2 — D1/D2 — Legacy-Deps:** `Select-String -Recurse -Pattern '"eslint"|"prettier"|"babel"' -Include package.json`
3. **Schritt 3 — D7/D11 — TS-Qualität:** `Select-String -Recurse -Pattern '"strict": false|: any|as any' -Include *.ts`
4. **Schritt 4 — Ergebnis:** Pro Kriterium: Anzahl Vorkommen + erste 5 Pfade

---

## Verwendung

- **`devsteps-48-refactor`**: Violation-Scan als erster Schritt vor Refactor-Dispatch
- **`gate-reviewer`**: Prüft ob keine neuen Violations durch die Implementierung eingeführt wurden
- **Direktaufruf**: `/violation-scan` im Chat gibt Sofort-Übersicht
