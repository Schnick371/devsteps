# Git-MCP-Server — Einrichtung für DevSteps Copilot-Agenten

<!-- bom-node: ARCH-SPIKE048-GITCFG | parent: ARCH-SPIKE048 | doc_subtype: how-to | status: approved -->
<!-- devsteps_items: SPIKE-048, TASK-415 | created_at: 2026-04-04 | classification: docs/user-guide -->

**Item:** TASK-415 (ausgehend von SPIKE-048)  
**Typ:** How-To Dokument (L2 unter Research Brief)  
**Datum:** 2026-04-04  
**Status:** approved

---

## Was ist der Git-MCP-Server und warum ist er für DevSteps relevant?

DevSteps Work-Items besitzen zwei Dateien: `{ID}.json` (Metadaten) + `{ID}.md` (Beschreibung/Anforderungen). Wenn ein Copilot-Agent historische Anforderungsversionen sehen will — um z.B. zu prüfen ob eine Anforderung kürzlich geändert wurde — nutzt er normalerweise nur den aktuellen Stand.

Der **Git-MCP-Server** (`@modelcontextprotocol/servers/git`) gibt Copilot-Agenten direkten Zugang zur Git-History aller `.md`-Dateien via MCP-Tools wie `git_log`, `git_show`, und `git_diff`. Kein neuer Code in DevSteps nötig — nur Konfiguration.

**Nutzen für DevSteps-Agenten:**

| Agent | Konkrete Verbesserung |
|-------|----------------------|
| `analyst-archaeology` | Vollständige MD-Revisions-History abrufbar ohne Shell-Zugang |
| `aspect-staleness` | Wann hat sich die Anforderung zuletzt _inhaltlich_ geändert? (vs. metadata.updated das auch Statusänderungen zählt) |
| `analyst-context` | "Dieses Item wurde 4-mal umgeschrieben" — zusätzlicher Komplexitäts-Hinweis |
| `exec-planner` | Frühere Planungs-Ansätze in git-History erkennbar |

---

## Voraussetzungen

- Python 3.10+ (für `uvx` / `mcp-server-git`)
- Git-Repository mit DevSteps-Projekt
- VS Code mit GitHub Copilot Extension ODER Claude Desktop

### Alternative: GitLens/GitKraken MCP (kein `uvx` nötig)

GitLens 17.5 (Sep 2025) bundelt den GitKraken MCP-Server direkt in VS Code. Wenn GitLens installiert ist, ist der Git-MCP-Server möglicherweise bereits verfügbar — prüfbar in den Copilot Extensions.

---

## Einrichtung: VS Code

### Option 1: mcp.json (empfohlen)

Erstelle `.vscode/mcp.json` (oder `.github/mcp.json` für geteilte Konfiguration):

```json
{
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/specification/main/schema/mcp.schema.json",
  "mcpServers": {
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "${workspaceFolder}"],
      "description": "Git history access for DevSteps work items"
    }
  }
}
```

### Option 2: settings.json

```json
// .vscode/settings.json
{
  "mcp.servers": {
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "${workspaceFolder}"]
    }
  }
}
```

---

## Einrichtung: Claude Desktop

`~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "devsteps-git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "/pfad/zum/projekt"],
      "description": "DevSteps project git history"
    }
  }
}
```

---

## Verfügbare MCP-Tools (nach Einrichtung)

### `git_log` — Revisions-History einer Datei

Zeigt alle Commits die eine `.md`-Datei geändert haben:

```
# Beispiel-Nutzung durch AI-Agenten:
git_log({ 
  repo_path: ".",
  max_count: 10,
  file_path: ".devsteps/items/stories/STORY-042.md"
})
```

**Ausgabe:** Liste von Commits mit Hash, Datum, Autor, Commit-Message.

### `git_show` — Inhalt einer Datei zu einem spezifischen Commit

```
git_show({ 
  repo_path: ".",
  revision: "HEAD~3",
  file_path: ".devsteps/items/stories/STORY-042.md"
})
```

**Nutzung:** "Wie sah STORY-042 aus bevor die Requirements letzte Woche geändert wurden?"

### `git_diff` — Was hat sich zwischen zwei Versionen geändert?

```
git_diff({ 
  repo_path: ".",
  old_ref: "HEAD~1",
  new_ref: "HEAD",
  file_path: ".devsteps/items/stories/STORY-042.md"
})
```

**Nutzung:** Zeigt exakt welche Zeilen geändert wurden — Anforderungen hinzugekommen oder entfernt.

---

## Typische AI-Agent Queries

### "Hat sich diese Anforderung in letzten 30 Tagen geändert?"

```
git_log({
  repo_path: ".",
  since: "30 days ago",
  file_path: ".devsteps/items/stories/STORY-042.md"
})
# Kein Ergebnis = keine Änderung = stabil
```

### "Gab es über die Projektlaufzeit mehrere Requirements-Revisionen?"

```
git_log({
  repo_path: ".",
  file_path: ".devsteps/items/stories/STORY-042.md"
})
# Anzahl der Einträge = Revisions-Anzahl
```

### "Welche Items wurden seit Sprint-Start (2026-03-01) verändert?"

```
git_log({
  repo_path: ".",
  since: "2026-03-01",
  grep_pattern: ".devsteps/items"
})
```

---

## Sicherheitshinweise

> **OWASP A03 Command Injection:** Nutze ausschließlich den offiziellen `@modelcontextprotocol/servers/git` MCP-Server (via `uvx mcp-server-git`). Implementiere NIEMALS eigene Git-Shell-Aufrufe via `child_process.exec()` in DevSteps-Code — dies wäre anfällig für Command Injection wenn Pfade/Item-IDs als Shell-Arguments übergeben werden.

Der offizielle MCP-Server nutzt eine sichere Git-Bibliothek ohne Shell-String-Interpolation.

---

## Häufige Fragen

**F: Was passiert wenn `git_integration: false` in config.json gesetzt ist?**  
A: Der Git-MCP-Server ist externe Software und wird bei `git_integration: false` nicht deaktiviert. Er funktioniert solange das Verzeichnis ein Git-Repository ist (oder nicht). Das Flag in DevSteps steuert nur UI-Hints in der Applikation, nicht den MCP-Server.

**F: Werden uncommitted Änderungen gezeigt?**  
A: Nein. Nicht-committete Änderungen an `.md`-Dateien sind über `git_log` unsichtbar. Das ist ein bekanntes Limitation — workaround ist `description_hash` (Option C / STORY-240) das auch uncommitted Änderungen erkennt.

**F: Ist GitLens ein vollwertiger Ersatz?**  
A: GitLens 17.5 bundelt einen kompatiblen MCP-Server direkt in VS Code Copilot. Wenn GitLens bereits installiert ist, kann der `mcp-server-git` überflüssig sein — prüfe in den Copilot-Extensions welche Git-Tools verfügbar sind.

---

*Klassifikation: `docs/user-guide` · Scope: `module` · Cluster: `revision-md-001`*  
*Implements: TASK-415 · Relates-to: SPIKE-048*
