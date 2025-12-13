## Objective

Update AI-GUIDE-COMPACT.md to explain Jira 2025 blocks dual nature semantics.

## Implementation Complete ✅

**Changes Made:**

**File: .devsteps/AI-GUIDE-COMPACT.md**

1. **MCP Tools List** (line ~3):
   - Removed "affects" from devsteps-link relationships list
   - Updated to: implements/relates-to/blocks/depends-on/tested-by/supersedes

2. **Bug Handling Section** (lines ~39-42):
   - Changed from "Use implements relation (NOT affects)"
   - Updated to: "Use implements for hierarchy OR blocks for blocking impact"
   - Reflects dual-purpose nature of blocks for Bug

3. **Relation Types Section** (lines ~78-95):
   - **relates-to**: Clarified as "without hierarchy or blocking", informational links
   - **affects**: Completely removed (3 lines eliminated)
   - **blocks/blocked-by**: Extensive update to explain dual nature:
     * Hierarchy mode: Bug blocks Epic/Story/Requirement/Feature (validated)
     * Flexible mode: Story→Story, Task→Task (no validation)
     * Added Jira semantics explanation
     * Usage guidance for Bug blocking scenarios

**Impact:**
- Document now accurately reflects TASK-124/TASK-125 implementation
- Clear guidance for AI agents on when to use blocks hierarchy vs flexible
- Affects completely removed per STORY-053
- Line count: 121 lines (within 130 limit)