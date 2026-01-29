# DevSteps → Code Validation & Automation

## User Story

**As a** developer  
**I want** git operations validated against work item state  
**So that** I prevent invalid commits and maintain workflow discipline

## Acceptance Criteria

1. ✅ Pre-commit hook validates work item exists
2. ✅ Pre-commit hook prevents commits on `draft` status items
3. ✅ Pre-commit hook suggests status update if needed
4. ✅ Post-merge hook automatically marks work item `done`
5. ✅ Branch creation suggests work item ID in name

## Technical Implementation

**Pre-Commit Hook:**
```bash
# .devsteps/hooks/pre-commit
#!/bin/bash
MSG_FILE=".git/COMMIT_EDITMSG"
MSG=$(cat "$MSG_FILE")

# Extract work item IDs
IDS=$(echo "$MSG" | grep -oP '(?<=Implements: )[A-Z]+-[0-9]+')

for ID in $IDS; do
  # Check work item exists
  if ! devsteps get "$ID" &>/dev/null; then
    echo "❌ Error: Work item $ID not found"
    exit 1
  fi
  
  # Check status
  STATUS=$(devsteps get "$ID" --json | jq -r '.status')
  
  if [ "$STATUS" = "draft" ]; then
    echo "⚠️  Warning: $ID is still in draft status"
    echo "   Suggestion: devsteps update $ID --status in-progress"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
done
```

**Post-Merge Hook:**
```bash
# .devsteps/hooks/post-merge
#!/bin/bash
# Detect merged branch
MERGED_BRANCH=$(git reflog -1 | grep -oP 'merge [^ ]+' | cut -d' ' -f2)

# Extract work item ID from branch name
# Supports: story/STORY-042, task/TASK-123, bug/BUG-033
ID=$(echo "$MERGED_BRANCH" | grep -oP '[A-Z]+-[0-9]+')

if [ -n "$ID" ]; then
  # Automatic status update to done
  devsteps update "$ID" --status done
  echo "✅ Automatically marked $ID as done (merged)"
fi
```

**Branch Creation Helper:**
```bash
devsteps branch TASK-042
# Creates: task/TASK-042-{description-from-title}
# Checks out branch automatically
```

**Commit Template Integration:**
```bash
devsteps setup-git-template
# Creates .git/message.txt with:
# type(ID): subject
#
# - What changed
# - Why it changed
#
# Implements: ID
```

## Workflow Integration

**Start Work:**
```bash
devsteps update TASK-042 --status in-progress
devsteps branch TASK-042
# Auto-creates: task/TASK-042-implement-feature
```

**Make Commits:**
```bash
git commit -m "feat(TASK-042): Add validation

Implements: TASK-042"
# Pre-commit validates TASK-042 exists and status
# Post-commit links commit to TASK-042
```

**Complete Work:**
```bash
git checkout main
git merge --no-ff task/TASK-042-implement-feature
# Post-merge automatically marks TASK-042 done
```

## Dependencies

- Pre-commit: Work item validation logic
- Post-merge: Branch name parsing
- CLI --json output format

## Testing

```bash
# Test pre-commit validation
devsteps add task "Test validation"
# Returns: TASK-043 (draft status)

git commit -m "feat(TASK-043): Test

Implements: TASK-043"
# Should warn about draft status

# Test post-merge automation
devsteps update TASK-043 --status in-progress
git checkout -b task/TASK-043-test
git commit --allow-empty -m "feat(TASK-043): Test

Implements: TASK-043"
git checkout main
git merge --no-ff task/TASK-043-test
# Should auto-mark TASK-043 done

devsteps get TASK-043
# Status should be 'done'
```

## Error Handling

- Non-existent work item → abort commit with clear message
- Invalid status → warn but allow override
- Network/file errors → degrade gracefully (log warning, allow commit)
- Hook installation failures → document manual setup