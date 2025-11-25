#!/bin/bash

# Fix all API calls in commands/index.ts to match new shared package API

FILE="packages/vscode-extension/src/commands/index.ts"

echo "🔧 Fixing API calls in $FILE..."

# Fix listItems calls - change from object parameter to devcrumbsPath string
sed -i 's/await listItems({ *path: workspaceFolder\.uri\.fsPath *})/await listItems(path.join(workspaceFolder.uri.fsPath, '"'"'.devsteps'"'"'))/g' "$FILE"

# Fix result checks - remove .success checks for listItems
sed -i 's/if (!allItems\.success || !allItems\.items/if (!allItems.items/g' "$FILE"

# Fix result checks - remove .success checks for getItem  
sed -i 's/if (!itemResult\.success || !itemResult\.item)/if (!itemResult.metadata)/g' "$FILE"

# Fix property access - change itemResult.item to itemResult.metadata
sed -i 's/itemResult\.item/itemResult.metadata/g' "$FILE"

# Fix updateItem calls - add devcrumbsPath parameter
sed -i 's/await updateItem({/const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '"'"'.devsteps'"'"');\n        const result = await updateItem(devcrumbsPath, {/g' "$FILE"

# Fix updateItem result checks - remove .success/.error 
sed -i 's/if (result\.success)/if (result.metadata)/g' "$FILE"
sed -i 's/result\.error || '"'"'Unknown error'"'"'/'"'"'Update failed'"'"'/g' "$FILE"

echo "✅ API calls fixed!"
echo "📝 Building extension..."
