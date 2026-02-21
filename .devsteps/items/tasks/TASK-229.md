Extend `init.ts` to write a `.gitignore` inside `.devsteps/analysis/` containing:
```
# Analysis envelopes are ephemeral — not versioned
*.json
```
This prevents CompressedVerdict and AnalysisBriefing files from being committed.