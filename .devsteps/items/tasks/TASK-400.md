Write unit tests for the heuristicClassify function in the docs import command.

Test cases (one per heuristic pattern):
1. analyst-archaeology.md → research
2. aspect-constraints.md → research
3. docs/architecture/decisions/ADR-001.md → architecture
4. "How to configure X" + "to" in title → how-to
5. "Understanding the data model" heading → explanation
6. "API Reference" heading → reference
7. "You will learn" + numbered steps → tutorial
8. README.md (no pattern match) → explanation (fallback)
9. Symlink path (lstatSync detects) → skipped