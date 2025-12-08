## Problem Statement

In multi-user teams, it's unclear who created which work item. The current ID format (TASK-167) doesn't identify the author/owner.

## Solution

Add optional user postfix to IDs: `TASK-0167-TH` (user initials: "TH")

## Configuration

Add to `.devsteps/config.json`:
```json
{
  "settings": {
    "user_postfix_enabled": false,
    "user_postfix_separator": "-",
    "default_user_initials": ""
  }
}
```

## ID Format Examples

**Enabled:**
- `TASK-0167-TH` (User: Thomas H.)
- `STORY-0071-MS` (User: Maria S.)

**Disabled (default):**
- `TASK-0167`
- `STORY-0071`

## Use Cases

- Multi-user teams tracking ownership
- Parallel work differentiation
- Author identification in work items

## Acceptance Criteria

- Postfix is optional (disabled by default)
- Configurable separator (-, /, _)
- User initials configurable per project
- Backwards compatible (existing IDs work)
- Schema validates both formats
- MCP tools support postfix generation