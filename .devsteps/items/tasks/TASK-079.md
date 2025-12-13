# Compress Agent File - Remove Verbosity

## Objective
Reduce agent.md from 134 lines to ~80 lines by removing redundancy and trusting Copilot.

## Sections to Compress

### 1. "Workflow Process" (currently ~20 lines → ~8 lines)
Remove detailed sub-explanations, keep only prompt file references.

### 2. "Tool Usage Strategy" (currently ~20 lines → ~10 lines)  
List tools without explanations (Copilot knows what they do).

### 3. "Git Workflow" (currently ~5 lines → UPDATE)
Change from epic branches to story branches:
```markdown
**Story branches:** Create `story/<ID>` before status→in-progress
**Tasks:** Use parent story branch OR main  
**Merge:** PR to main when story complete
```

### 4. "Commit Integration" (currently ~15 lines → ~8 lines)
Remove redundant explanations, keep only mandatory rules.

### 5. "Critical Rules" (currently ~10 lines → ~6 lines)
Bullet points only, no explanations.

## Principle
Copilot is smart. Provide rules, not tutorials. Trust over control.