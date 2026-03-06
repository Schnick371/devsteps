## Context
STORY-199 targets creating `plugin.json` for the VS Code agent plugin marketplace. Before publishing, a compliance and submission checklist must be completed. The `copilot-plugins` repo (Microsoft's official plugin registry) has submission requirements that are not currently documented in DevSteps.

## Research Questions
1. Where is the plugin submission process documented? (copilot-plugins repo? VS Code marketplace portal?)
2. What fields are mandatory in the plugin manifest for marketplace acceptance?
3. What security scans are run before approval? (static analysis, dependency audit, hook review?)
4. Is there a human review step or is it automated?
5. What is the expected approval timeline?
6. Are there content policy requirements (NOTICE file, LICENSE compatibility, trademark)?
7. Does the plugin need to be published to VS Code marketplace first, or is it separate?
8. What telemetry/data collection disclosures are required?

## Deliverable
A checklist document (e.g., `docs/PLUGIN-SUBMISSION-CHECKLIST.md`) covering:
- [ ] Manifest fields complete and validated
- [ ] Security scan passed  
- [ ] License check (MIT compatibility with plugin system)
- [ ] NOTICE file included
- [ ] Trademark compliance (DevSteps name/branding)
- [ ] Privacy policy for telemetry (if any)
- [ ] No hardcoded credentials or secrets in bundled files
- [ ] Plugin tested in clean VS Code profile

## Dependencies
- Requires STORY-199 (plugin.json) to exist before submission
- SECURITY.md update (BUG-061) should be complete before submission review