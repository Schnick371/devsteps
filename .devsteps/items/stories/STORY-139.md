## Ziel

Definierte Taxonomie der 15 Plan-Typen mit optionalen Templates für häufige Workflows.

### Core Plan Types

| Typ | Key | Wann |
|-----|-----|------|
| Implementation Plan | `implementation` | Feature-Build |
| Test Plan | `test` | Test-Strategie |
| Migration Guide | `migration` | Breaking Changes |
| Deployment Checklist | `deployment` | Release |
| Rollback Plan | `rollback` | Paired mit Deployment |

### Quality & Review

| Code Review Trail | `code-review` | PR/Review |
| Security Audit | `security-audit` | Security-sensitive |
| Performance Benchmark | `perf-benchmark` | Performance-kritisch |
| Accessibility Audit | `a11y-audit` | UI-Änderungen |

### AI-Agent-Specific

| Prerequisite Discovery | `prerequisite` | Auto-generiert bei Step-Failure |
| Refactoring Plan | `refactoring` | Technical Debt |
| Debug Investigation | `debug` | Bug-Analyse |
| Research Spike | `spike` | Time-boxed Exploration |
| Integration Verification | `integration` | Cross-Package |
| Dependency Upgrade | `dep-upgrade` | Dependency Updates |

### Acceptance Criteria

- [ ] Jeder Typ hat Beschreibung und Trigger-Bedingung
- [ ] Optional: Default-Steps Template pro Typ
- [ ] PlanType Enum in shared Schema