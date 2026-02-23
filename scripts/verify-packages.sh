#!/bin/bash
# Verify npm packages before publishing
# Based on npm best practices for package verification

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP_DIR="$REPO_ROOT/tmp/verify-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 DevSteps Package Verification"
echo "================================="

# Create temp directory
mkdir -p "$TMP_DIR"

# Cleanup on exit
trap 'rm -rf "$TMP_DIR"' EXIT

# Verify a single package
verify_package() {
    local package_dir=$1
    local package_name=$2
    local expected_version=$3
    
    echo ""
    echo "📦 Verifying: $package_name"
    echo "-----------------------------------"
    
    cd "$REPO_ROOT/packages/$package_dir"
    
    # Get current version from package.json
    local current_version=$(jq -r '.version' package.json)
    echo "  Version in package.json: $current_version"
    
    if [ "$current_version" != "$expected_version" ]; then
        echo -e "${RED}  ✗ Version mismatch! Expected: $expected_version${NC}"
        return 1
    fi
    
    # Find existing .tgz file
    local tgz_file=$(ls *.tgz 2>/dev/null | head -n 1)
    
    if [ -z "$tgz_file" ]; then
        echo -e "${YELLOW}  ⚠ No .tgz file found - needs packing${NC}"
        return 1
    fi
    
    echo "  Found tarball: $tgz_file"
    
    # Extract to temp directory
    local extract_dir="$TMP_DIR/$package_dir"
    mkdir -p "$extract_dir"
    tar -xzf "$tgz_file" -C "$extract_dir"
    
    # Verify version in tarball
    local tarball_version=$(jq -r '.version' "$extract_dir/package/package.json")
    echo "  Version in tarball: $tarball_version"
    
    if [ "$tarball_version" != "$expected_version" ]; then
        echo -e "${RED}  ✗ Tarball version mismatch!${NC}"
        return 1
    fi
    
    # Calculate and display integrity hash (SHA-512)
    echo "  Calculating integrity hash..."
    local integrity=$(cat "$tgz_file" | openssl dgst -sha512 -binary | openssl base64 -A)
    echo "  Integrity: sha512-${integrity:0:20}..."
    
    # Verify dependencies
    echo "  Dependencies:"
    jq -r '.dependencies // {} | to_entries[] | "    \(.key): \(.value)"' "$extract_dir/package/package.json"
    
    # Check for workspace:* or file: dependencies
    local bad_deps=$(jq -r '.dependencies // {} | to_entries[] | select(.value | startswith("workspace:") or startswith("file:")) | .key' "$extract_dir/package/package.json")
    
    if [ -n "$bad_deps" ]; then
        echo -e "${RED}  ✗ Found workspace/file dependencies that should be replaced:${NC}"
        echo "$bad_deps" | while read dep; do
            echo -e "${RED}    - $dep${NC}"
        done
        return 1
    fi
    
    # List tarball contents
    echo "  Tarball contents (top-level):"
    tar -tzf "$tgz_file" | grep '^package/[^/]*$' | sed 's/^package\///' | head -20 | while read item; do
        echo "    - $item"
    done
    
    local total_files=$(tar -tzf "$tgz_file" | wc -l)
    echo "  Total files in tarball: $total_files"
    
    # Get tarball size
    local size=$(ls -lh "$tgz_file" | awk '{print $5}')
    echo "  Tarball size: $size"
    
    echo -e "${GREEN}  ✓ Package verification passed!${NC}"
}

# Expected version (read from root package.json or shared package)
EXPECTED_VERSION=$(jq -r '.version' "$REPO_ROOT/packages/shared/package.json")
echo "Expected version for all packages: $EXPECTED_VERSION"

# Verify all packages
FAILED=0

verify_package "shared" "@schnick371/devsteps-shared" "$EXPECTED_VERSION" || FAILED=1
verify_package "cli" "@schnick371/devsteps-cli" "$EXPECTED_VERSION" || FAILED=1
verify_package "mcp-server" "@schnick371/devsteps-mcp-server" "$EXPECTED_VERSION" || FAILED=1

echo ""
echo "================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All packages verified successfully!${NC}"
    echo ""
    echo "Ready to publish with:"
    echo "  cd packages/shared && npm publish"
    echo "  cd packages/cli && npm publish"
    echo "  cd packages/mcp-server && npm publish"
    exit 0
else
    echo -e "${RED}❌ Package verification failed!${NC}"
    echo ""
    echo "To fix, run:"
    echo "  1. For each package, run: node ../../scripts/replace-workspace-deps.cjs"
    echo "  2. Then run: npm pack"
    echo "  3. Then run: git checkout package.json"
    exit 1
fi
