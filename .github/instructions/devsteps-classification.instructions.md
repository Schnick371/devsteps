---
applyTo: "**"
description: "DevSteps Item Classification Taxonomy — 3-level hierarchy + orthogonal facets for structured backlog retrieval"
---

# DevSteps Classification System

## Theory Foundation

Classification organises knowledge into a **systematic, navigable structure**. DevSteps uses:

1. **Hierarchical Taxonomy** — 3 levels (Domain → Subdomain → Topic). Each level is a specialisation of its parent. Leaves are the most concrete and specific.
2. **Faceted Classification** — Orthogonal dimensions that cut across the hierarchy (Concerns, Scope, Cluster). Items carry multiple facets independently.
3. **Topic Clusters** — Emergent, manually curated flat groupings for cross-domain themes.

Classification is stored in `metadata.classification` on each item — backward-compatible with all existing items. The field is absent on unclassified items and NEVER blocks existing workflows.

---

## Taxonomy — Level 1: Domain (7 nodes)

| Code | Name | Covers |
|------|------|--------|
| `core` | Core | Shared logic, data model, schemas, persistence, indexing, validation, migration |
| `api` | API Layer | External interfaces: MCP server tools/resources, CLI commands, HTTP endpoints |
| `ui` | User Interface | VS Code extension, webview dashboard, TreeView, decorations |
| `ai` | AI / Copilot | Agents, prompts, instructions, Spider Web protocol, classification workflow |
| `devops` | DevOps & Build | Build scripts, CI/CD pipelines, test infrastructure, release/publish process |
| `docs` | Documentation | API docs, architecture docs, user guides, changelogs, legal |
| `research` | Research | Spikes, architecture investigations, competitive analysis, benchmarking |

---

## Taxonomy — Level 2: Subdomain

Specialises Domain. Assign only one subdomain per item.

| Domain | Subdomain codes |
|--------|----------------|
| `core` | `data-model` · `persistence` · `indexing` · `validation` · `migration` · `config` |
| `api` | `mcp` · `cli` · `http` |
| `ui` | `extension` · `webview` · `treeview` · `decorations` · `commands` |
| `ai` | `agents` · `prompts` · `instructions` · `workflow` · `classification` |
| `devops` | `build` · `testing` · `release` · `packaging` · `ci` |
| `docs` | `api-docs` · `architecture` · `user-guide` · `changelog` · `legal` |
| `research` | `spike` · `analysis` · `competitive` · `benchmarking` |

---

## Taxonomy — Level 3: Topic (most specific)

Specialises Subdomain. Assign only one topic per item. New topics can be added as the taxonomy grows.

| Subdomain | Topic codes (examples) |
|-----------|----------------------|
| `core/data-model` | `schemas` · `types` · `constants` · `zod-validation` |
| `core/persistence` | `file-io` · `atomic-write` · `backup` · `compression` |
| `core/indexing` | `by-status` · `by-type` · `by-priority` · `full-text` |
| `api/mcp` | `tools` · `resources` · `prompts-capability` · `transport` · `metrics` |
| `api/cli` | `commands` · `output-format` · `interactive` · `config-cmd` |
| `ui/extension` | `activation` · `tree-view` · `webview-panel` · `status-bar` |
| `ui/webview` | `dashboard` · `charts` · `filters` · `kanban` |
| `ai/agents` | `coord` · `analyst` · `aspect` · `exec` · `worker` · `gate` |
| `ai/prompts` | `entry-points` · `specialized` · `chat-modes` |
| `devops/build` | `esbuild` · `bundling` · `monorepo` · `tsconfig` |
| `devops/testing` | `unit` · `integration` · `bats` · `e2e` |
| `devops/release` | `npm-publish` · `vsix` · `semantic-version` · `changelog-gen` |
| `research/spike` | `library-eval` · `api-exploration` · `architecture-poc` |

---

## Facets (Orthogonal Dimensions)

Facets apply INDEPENDENTLY of the taxonomy hierarchy. An item may carry multiple.

### Concern Facet — cross-cutting quality dimension

`performance` · `security` · `dx` (developer experience) · `reliability` · `observability` · `ux` · `accessibility` · `scalability`

### Scope Facet — breadth of impact

`platform` (all packages) · `package` (one package) · `module` (one module/file group) · `function` (single function/method)

### Cluster — emergent thematic group

Free-text label for manually curated cross-domain groupings.  
Convention: `<theme>-<version-or-milestone>`. Examples: `release-1.0`, `mcp-adoption`, `ai-retrieval-sprint`, `vscode-ux`.

---

## Classification Object Schema

Stored in `metadata.classification` on each `ItemMetadata` JSON:

```
{
  "domain":    "<L1-code>",          // required
  "subdomain": "<L2-code>",          // recommended
  "topic":     "<L3-code>",          // optional — most specific
  "concerns":  ["<concern>", ...],   // optional — facet, multiple allowed
  "scope":     "<scope>",            // optional — facet
  "cluster":   "<cluster-name>"      // optional — topic cluster
}
```

---

## Additional Structuring Methods

Beyond taxonomy, the following complementary methods are available:

1. **Milestone Grouping** — cluster by planned release (`cluster: release-x.y`)
2. **Concern Cross-cut** — query by concern facet to find all performance or security items globally
3. **Knowledge Map** — treat relations (`relates-to`, `depends-on`) as edges; classification nodes become entry-points for graph traversal
4. **Audience Lens** — classify by who consumes the output: `internal` · `user` · `developer` · `operator`

---

## Classifier Invariants

- Classification is NEVER applied automatically at item creation — triggered by `devsteps-45-classify-items` only
- Classification does NOT change item `status`, `type`, or `eisenhower` values
- The `worker-classifier` is a Ring-4 leaf node — it NEVER calls `runSubagent`
- Unclassified items remain valid; classify in batches or on-demand
- When in doubt at L3, stop at L2 — over-classification is worse than under-classification
