# Menu Checkmark Pattern Test

## Research Findings

### Native VS Code Solution Found! ✅

**Source:** `vscode/src/vs/workbench/contrib/scm/browser/scmViewPane.ts` (Line ~1133)

VS Code Source Control uses the **`toggled` property** in command definitions - NO duplicate commands needed!

```typescript
class SetListViewModeAction extends ViewAction<SCMViewPane> {
  constructor() {
    super({
      id: 'workbench.scm.action.setListViewMode',
      title: localize('setListViewMode', "View as List"), // No ✓ in title!
      toggled: ContextKeys.SCMViewMode.isEqualTo(ViewMode.List), // ✅ Native checkmark
      menu: { id: Menus.ViewSort, group: '1_viewmode' }
    });
  }
}
```

### The Pattern

1. **Context Keys** for state management:
   ```typescript
   const viewModeContextKey = ContextKeys.SCMViewMode.bindTo(contextKeyService);
   viewModeContextKey.set(ViewMode.List);
   ```

2. **`toggled` property** in command contribution:
   ```json
   {
     "command": "devcrumbs.setViewMode",
     "title": "View as List",
     "toggled": "devcrumbs.viewMode == 'list'"
   }
   ```

3. **No duplicate commands**, no Unicode ✓, native VS Code rendering

## Test Implementation

### Approach A: Native `toggled` Property (RECOMMENDED)

**Test Scenario 1: Toggle (Single Option)**
- Command: `devcrumbs.test.toggleOption`
- Context Key: `devcrumbs.test.optionEnabled`
- Menu with `toggled` clause

**Test Scenario 2: Radio Group (Multiple Options)**
- Commands: `devcrumbs.test.setModeA`, `setModeB`, `setModeC`
- Context Key: `devcrumbs.test.currentMode`
- Each with `toggled: devcrumbs.test.currentMode == 'A'`

**Test Scenario 3: Conditional Visibility**
- Show/hide options based on state
- Combine `when` + `toggled` clauses

### Implementation Steps

1. **Create test context keys** in `extension.ts`
2. **Register test commands** with state management
3. **Add test submenu** to `package.json` with `toggled` properties
4. **Test all scenarios** with real UI interactions
5. **Document findings** with screenshots

### Expected Benefits

✅ Native VS Code behavior (matches Source Control exactly)
✅ No code duplication (single command per option)
✅ Automatic checkmark rendering by VS Code
✅ Clean, maintainable solution
✅ Supports grayed-out inactive options via `when` clauses

## Success Criteria

- [ ] Checkmarks appear/disappear on click
- [ ] Radio group shows only one active option
- [ ] Performance is instant (no flickering)
- [ ] Works in all menu contexts (view/title, submenus)
- [ ] Inactive options can be grayed out with `when` clauses
- [ ] Solution matches VS Code Source Control behavior

## Time Estimate

**2 hours** (reduced from 4h - we found the native solution!)

## Follow-up Actions

After spike completion:
- Create STORY for implementing checkmarks in production menus
- Document pattern in project standards
- Apply to all DevCrumbs TreeView menus