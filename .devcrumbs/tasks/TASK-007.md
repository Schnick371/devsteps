# Icons and Theming - Theme-Dependent Monocolor Design

## Objectives
Create monocolor icon system with theme-dependent coloring (NO colored badges/bubbles). All icons use VS Code's ThemeIcon API for automatic theme adaptation.

## Monocolor Icon Strategy

### Core Principle
**Icons are ALWAYS monocolor** - color comes from theme, not from icon itself.

### Implementation Using ThemeIcon
```typescript
// ThemeIcon automatically adapts to current theme
new vscode.ThemeIcon(
  'rocket',                    // Icon ID from Codicons
  new vscode.ThemeColor('symbolIcon.classForeground') // Optional: semantic color
)
```

## Icon Mapping (Codicons)

### Work Item Types
```typescript
const ITEM_TYPE_ICONS: Record<string, string> = {
  // Scrum hierarchy
  epic: 'rocket',           // 🚀 Large initiatives
  story: 'book',            // 📖 User stories
  task: 'checklist',        // ☑️ Tasks
  spike: 'beaker',          // 🧪 Research spikes
  bug: 'bug',               // 🐛 Bug fixes
  test: 'beaker',           // 🧪 Test cases
  
  // Waterfall hierarchy  
  requirement: 'note',      // 📝 Requirements
  feature: 'lightbulb'      // 💡 Features
};
```

### Status-Specific Icons (Optional Enhancement)
```typescript
const STATUS_ICONS: Record<string, string> = {
  draft: 'circle-outline',      // ○ Not started
  planned: 'clock',             // 🕐 Scheduled
  'in-progress': 'sync',        // 🔄 Active work
  review: 'eye',                // 👁️ Under review
  done: 'check',                // ✓ Completed
  blocked: 'circle-slash',      // 🚫 Blocked
  cancelled: 'x',               // ✗ Cancelled
  obsolete: 'archive'           // 📦 Archived
};
```

## Theme-Dependent Colors via ThemeColor

### Semantic Color Tokens (VS Code Built-in)
```typescript
// Use semantic tokens that automatically adapt to theme
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'errorForeground',                      // Red
  high: 'editorWarning.foreground',                 // Orange/Yellow
  medium: 'editorInfo.foreground',                  // Blue
  low: 'descriptionForeground'                      // Gray
};

const STATUS_COLORS: Record<string, string> = {
  'in-progress': 'charts.blue',                     // Blue
  done: 'charts.green',                             // Green
  blocked: 'charts.red',                            // Red
  draft: 'charts.gray',                             // Gray
  review: 'charts.purple'                           // Purple
};
```

### Usage Example
```typescript
class WorkItemTreeItem extends vscode.TreeItem {
  constructor(item: DevCrumbsItem) {
    super(item.title, vscode.TreeItemCollapsibleState.None);
    
    // Monocolor icon with semantic color
    this.iconPath = new vscode.ThemeIcon(
      ITEM_TYPE_ICONS[item.type],
      new vscode.ThemeColor(PRIORITY_COLORS[item.priority])
    );
    
    // Alternatively: Let theme decide color entirely
    this.iconPath = new vscode.ThemeIcon(ITEM_TYPE_ICONS[item.type]);
  }
}
```

## Activity Bar Icon

### Custom SVG (Monocolor)
```xml
<!-- resources/icons/devcrumbs-activitybar.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" 
        fill="currentColor"/> <!-- Uses theme foreground -->
</svg>
```

### Package.json Configuration
```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [{
        "id": "devcrumbs",
        "title": "DevCrumbs",
        "icon": "resources/icons/devcrumbs-activitybar.svg"
      }]
    }
  }
}
```

## Theme Compatibility

### Automatic Adaptation
- **Light themes**: Icons use dark foreground automatically
- **Dark themes**: Icons use light foreground automatically
- **High contrast**: Honors high contrast colors
- **Custom themes**: Adapts to theme's semantic tokens

### NO Custom Color Definitions Needed
```typescript
// ❌ WRONG: Hard-coded colors
this.iconPath = { 
  light: 'icons/light/epic-red.svg',
  dark: 'icons/dark/epic-red.svg' 
};

// ✅ CORRECT: Theme-dependent
this.iconPath = new vscode.ThemeIcon(
  'rocket',
  new vscode.ThemeColor('errorForeground') // For critical priority
);
```

## File Structure
```
packages/vscode-extension/
├── resources/
│   └── icons/
│       └── devcrumbs-activitybar.svg  # Only custom icon needed
└── src/
    └── utils/
        └── icons.ts  # Icon mapping logic
```

## Implementation Steps

1. **Create icon mapping utility** (`src/utils/icons.ts`)
   - Map item types to Codicon names
   - Map priorities to ThemeColor tokens
   - Map statuses to ThemeColor tokens

2. **Use ThemeIcon in TreeDataProvider**
   - Apply to `TreeItem.iconPath`
   - Use semantic color for priority/status
   - Let VS Code handle theme switching

3. **Create Activity Bar SVG**
   - Single monocolor SVG using `currentColor`
   - Automatically adapts to theme

4. **Test across themes**
   - Light Default
   - Dark Default
   - Dark+
   - High Contrast
   - Custom community themes

## Acceptance Criteria
- ✅ All icons monocolor (no colored bubbles)
- ✅ Icons adapt automatically to light/dark/high-contrast themes
- ✅ Priority indicated via semantic color tokens
- ✅ Status indicated via semantic color tokens
- ✅ Activity bar icon uses currentColor
- ✅ Works with ANY VS Code theme (community themes included)
- ✅ NO hard-coded color values in icon paths

## Related Tasks
- **TASK-009**: FileDecorationProvider for additional status badges
- **TASK-002**: TreeView rendering uses these icons