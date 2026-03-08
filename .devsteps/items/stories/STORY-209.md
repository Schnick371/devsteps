Three interrelated doc/repo hygiene tasks:
1. Remove docs/ from .gitignore (publish architecture docs, privacy policy) but add docs/branding/ to keep branding assets private
2. Add section to INSTALL.md explaining how the MCP server creates per-workspace .devsteps/ folders — important when multiple VS Code windows are open simultaneously
3. Verify and update NOTICE copyright file for accuracyCompleted 2026-03-08. All three tasks done:
1. .gitignore: docs/ → docs/branding/ (exposes architecture docs and privacy policy, hides branding)
2. INSTALL.md: Added 'Per-Workspace Data Storage' section with multi-window isolation, same-folder warning, multi-root workspace note, and fixed placeholder GitHub URLs
3. NOTICE: Added 8 missing attributions (pino, pino-pretty, express, prom-client, chart.js, d3, ora, @inquirer/prompts); corrected pino-pretty copyright from named author to 'the Pino team'
Bonus: docs/PRIVACY-POLICY-DE.md renamed to docs/PRIVACY-POLICY.md (file is now English); CI paths-ignore added for docs/** and **.md; deleted dangling repository-strategy.md tracked file