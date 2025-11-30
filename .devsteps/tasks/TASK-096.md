# Enable GitHub Discussions

## Objective
Enable GitHub Discussions to provide community feedback mechanism for model compatibility testing (linked from Welcome screen in TASK-095).

## Context
- Welcome screen now includes link: `https://github.com/Schnick371/devsteps/discussions`
- Link currently returns 404 until Discussions feature is enabled
- Must be done **before** extension publication to avoid broken links for users

## Prerequisites
- ✅ Repository must be public (or make public first)
- ✅ Must have admin access to repository settings

## Implementation Steps

### 1. Enable Discussions Feature
1. Go to: `https://github.com/Schnick371/devsteps/settings`
2. Scroll to **"Features"** section
3. Check: ☑️ **"Discussions"**
4. Click **"Set up discussions"** button
5. GitHub creates welcome discussion automatically

### 2. Create Custom Categories
Navigate to: `https://github.com/Schnick371/devsteps/discussions`

**Recommended Categories:**

1. **Model Testing Feedback** (Announcement format)
   - Description: "Share your experiences testing DevSteps with different AI models (Claude, GPT-4, etc.)"
   - Icon: 💬
   - Purpose: Direct link target from Welcome screen

2. **General** (Q&A format)
   - Description: "General questions and discussions about DevSteps"
   - Icon: 💡
   - Purpose: Default category

3. **Feature Requests** (Idea format)
   - Description: "Suggest new features or improvements"
   - Icon: 🚀
   - Purpose: Community-driven development

4. **Show and Tell** (Show and Tell format)
   - Description: "Share your DevSteps workflows and success stories"
   - Icon: 🎉
   - Purpose: Community engagement

### 3. Create Welcome Discussion (Optional)
- Pin a welcome message explaining how to provide feedback
- Link to model compatibility documentation
- Explain what information is helpful (model name, version, issues encountered)

## Acceptance Criteria
- ✅ Discussions enabled in repository
- ✅ "Model Testing Feedback" category created
- ✅ Link `https://github.com/Schnick371/devsteps/discussions` returns 200
- ✅ Users can create discussions without issues

## Testing
1. Visit `https://github.com/Schnick371/devsteps/discussions` (should load)
2. Click "New discussion" (should work)
3. Verify "Model Testing Feedback" category appears in dropdown

## Time Estimate
- 5-10 minutes (mostly clicking through GitHub UI)

## Dependencies
- Must be done **before** TASK-087 (Publish extension to VS Code Marketplace)
- Relates to: STORY-046 (Welcome Screen Content Enhancement)
- Blocked by: Repository must be public

## Notes
- Discussions can be disabled later if not used
- Consider adding Discussion templates in `.github/DISCUSSION_TEMPLATES/` (future enhancement)
- Monitor initial discussions for common patterns to improve documentation