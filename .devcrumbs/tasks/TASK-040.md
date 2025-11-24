# MCP Server: Enforce Relationship Validation

## Problem
MCP tools currently allow AI to create any relationship without validation.

## Solution
Integrate validation engine in `devcrumbs-link` and `devcrumbs-add` MCP tools.

## Implementation

### 1. Import Validation
```typescript
import { validateRelationship } from '@devcrumbs/shared';
```

### 2. Modify devcrumbs-link Tool
**File:** `packages/mcp-server/src/handlers/devcrumbs-link.ts`

```typescript
async function handler(args: {
  source_id: string;
  relation_type: string;
  target_id: string;
}) {
  try {
    const devcrumbsPath = getDevcrumbsPath();
    
    // Load items
    const sourceResult = await getItem(devcrumbsPath, args.source_id);
    const targetResult = await getItem(devcrumbsPath, args.target_id);
    
    if (!sourceResult.metadata || !targetResult.metadata) {
      return {
        success: false,
        error: 'Item not found',
      };
    }
    
    // Load methodology from project config
    const config = await loadProjectConfig(devcrumbsPath);
    const methodology = config.methodology || 'hybrid';
    
    // Validate relationship
    const validation = validateRelationship(
      sourceResult.metadata,
      targetResult.metadata,
      args.relation_type as RelationType,
      methodology
    );
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        suggestion: validation.suggestion,
        validation_failed: true,
      };
    }
    
    // Proceed with linking...
    await linkItems(devcrumbsPath, args.source_id, args.relation_type, args.target_id);
    
    return {
      success: true,
      message: `Linked ${args.source_id} --${args.relation_type}--> ${args.target_id}`,
      source_id: args.source_id,
      target_id: args.target_id,
      relation: args.relation_type,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3. Return AI-Friendly Error Response
```typescript
// Error response structure
{
  success: false,
  error: "Epics can only implement Stories in Scrum",
  suggestion: "Create a Story first, then link Epic → Story",
  validation_failed: true,
  allowed_relationships: [
    {
      source_type: "epic",
      relation: "implements",
      target_type: "story",
      example: "EPIC-001 --implements--> STORY-001"
    }
  ]
}
```

### 4. Update Tool Schema
**File:** `packages/mcp-server/src/tools/index.ts`

Add to devcrumbs-link description:
```typescript
{
  name: "devcrumbs-link",
  description: `Create relationship between items. 
  
  Validation Rules:
  - Scrum: Epic→Story→Task hierarchy enforced
  - Waterfall: Requirement→Feature→Task hierarchy enforced
  - "relates-to" allowed between any items
  - Other relationships follow business logic
  
  The tool will reject invalid relationships with helpful suggestions.`,
  // ...
}
```

### 5. AI Guidance in Response
When validation fails, guide AI on next steps:
```typescript
{
  success: false,
  error: "Cannot link Epic directly to Task",
  suggestion: "Create a Story first, then link Epic → Story → Task",
  ai_guidance: "Use devcrumbs-add to create a Story, then create two links: Epic→Story and Story→Task",
  example_commands: [
    "devcrumbs-add story 'Feature Implementation' --priority high",
    "devcrumbs-link EPIC-001 implements STORY-XXX",
    "devcrumbs-link STORY-XXX implements TASK-001"
  ]
}
```

## Testing with AI

### Test Prompts
```
AI: "Link EPIC-001 to TASK-001"
MCP: Validation error + suggestion to create Story first
AI: Creates Story, then links Epic→Story→Task ✅

AI: "Make BUG-001 related to STORY-001"
MCP: Success (relates-to always allowed) ✅

AI: "Link TASK-001 implements EPIC-001"
MCP: Validation error (wrong direction) + example ✅
```

## Success Criteria
- ✅ Validation integrated in devcrumbs-link
- ✅ AI-friendly error responses with guidance
- ✅ Tool schema updated with validation rules
- ✅ AI successfully follows suggestions
- ✅ All test scenarios pass

## Dependencies
- Depends on: TASK-038 (validation engine)
