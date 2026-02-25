#!/usr/bin/env bash
# ============================================================
# publish-next.sh — DevSteps Pre-Release Publisher
# ============================================================
#
# Publishes all DevSteps packages as pre-release:
#   - npm packages (shared, cli, mcp-server) → --tag next
#   - VS Code extension (extension) → vsce publish --pre-release
#
# PREREQUISITES:
#   1. Valid npm auth token:         npm login
#   2. Valid Azure DevOps PAT token: export VSCE_PAT=<your-pat>
#      (Scope: Marketplace → Manage)
#   3. On the correct release branch
#   4. All packages built: npm run build:ordered
#
# VERSION NOTE:
#   npm packages:        semver (e.g. 1.1.0-next.1) → --tag next
#   VS Code extension:   N.N.N only (e.g. 1.0.1) → vsce publish --pre-release
#   The Marketplace does NOT support semver pre-release suffixes.
#   Pre-release status comes ONLY from the --pre-release flag, NOT package.json.
#
# USAGE:
#   export VSCE_PAT=<your-azure-devops-pat>
#   bash scripts/publish-next.sh
# ============================================================

set -euo pipefail

NPM_VERSION="1.1.0-next.1"
EXTENSION_VERSION="1.0.3"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()  { echo -e "${GREEN}✅${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠️ ${NC} $1"; }
fail(){ echo -e "${RED}❌${NC} $1"; exit 1; }

log "DevSteps Pre-Release Publisher"
log "  npm packages:  ${NPM_VERSION} (--tag next)"
log "  extension:     ${EXTENSION_VERSION} (--pre-release)"
echo ""

# ─── PRE-FLIGHT CHECKS ───────────────────────────────────────────────────────

log "Phase 0: Pre-flight checks"

# Check npm auth
if ! npm whoami &>/dev/null; then
  fail "npm auth failed. Run: npm login\n       Then retry this script."
fi
NPM_USER=$(npm whoami)
ok "npm logged in as: ${NPM_USER}"

# Check vsce PAT
if [[ -z "${VSCE_PAT:-}" ]]; then
  fail "VSCE_PAT not set.\n       Run: export VSCE_PAT=<your-azure-devops-pat>\n       Then retry this script."
fi
ok "VSCE_PAT is set"

# Verify npm package versions
log "Verifying npm package versions..."
for pkg in shared cli mcp-server; do
  PKG_VERSION=$(node -e "console.log(require('./packages/${pkg}/package.json').version)")
  if [[ "$PKG_VERSION" != "$NPM_VERSION" ]]; then
    fail "packages/${pkg}/package.json version=${PKG_VERSION} (expected ${NPM_VERSION})"
  fi
  ok "packages/${pkg}: ${PKG_VERSION}"
done

# Verify extension version
EXT_VERSION=$(node -e "console.log(require('./packages/extension/package.json').version)")
if [[ "$EXT_VERSION" != "$EXTENSION_VERSION" ]]; then
  fail "packages/extension/package.json version=${EXT_VERSION} (expected ${EXTENSION_VERSION})"
fi
ok "packages/extension: ${EXT_VERSION}"

# Check dist exists
[[ -f "packages/shared/dist/index.js" ]]    || fail "shared not built — run: npm run build:ordered"
[[ -f "packages/cli/dist/index.cjs" ]]       || fail "cli not built — run: npm run build:ordered"
[[ -f "packages/mcp-server/dist/index.bundled.mjs" ]] || fail "mcp-server not built — run: npm run build:ordered"
[[ -f "packages/extension/dist/extension.js" ]]       || fail "extension not built — run: npm run build:ordered"
ok "All dist/ outputs present"

# Check @latest is unchanged (must be stable, not pre-release)
LATEST_CLI=$(npm view @schnick371/devsteps-cli@latest version 2>/dev/null || echo "unknown")
log "Current @latest: ${LATEST_CLI}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  npm packages: ${NPM_VERSION} --tag next"
echo "  extension:    ${EXTENSION_VERSION} --pre-release"
echo "  @latest will remain: ${LATEST_CLI}"
echo "═══════════════════════════════════════════════════════"
read -p "Proceed? [y/N] " -n 1 -r
echo ""
[[ $REPLY =~ ^[Yy]$ ]] || { log "Aborted."; exit 0; }
echo ""

# ─── PHASE 1: PUBLISH SHARED (MUST BE FIRST) ─────────────────────────────────

log "Phase 1: Publishing @schnick371/devsteps-shared@${NPM_VERSION} (--tag next)"
(cd packages/shared && npm publish --access public --tag next)
ok "shared published"

# Verify shared immediately
SHARED_NEXT=$(npm view @schnick371/devsteps-shared dist-tags.next 2>/dev/null || echo "")
if [[ "$SHARED_NEXT" != "$NPM_VERSION" ]]; then
  fail "shared publish verification failed! dist-tags.next=${SHARED_NEXT}"
fi
ok "shared @next verified: ${SHARED_NEXT}"

echo ""

# ─── PHASE 2: PUBLISH CLI + MCP-SERVER ───────────────────────────────────────

log "Phase 2a: Publishing @schnick371/devsteps-cli@${NPM_VERSION} (--tag next)"
(cd packages/cli && npm publish --access public --tag next)
ok "cli published"

log "Phase 2b: Publishing @schnick371/devsteps-mcp-server@${NPM_VERSION} (--tag next)"
(cd packages/mcp-server && npm publish --access public --tag next)
ok "mcp-server published"

echo ""

# ─── PHASE 3: PUBLISH EXTENSION AS PRE-RELEASE ───────────────────────────────
#
# IMPORTANT: vsce publish --pre-release is the ONLY way to mark an extension
# as pre-release on the Marketplace. There is NO "preRelease: true" field in
# package.json. Manual upload via the UI cannot mark pre-release on re-upload.
# The extension version MUST be N.N.N (no semver suffixes like -next.1).

log "Phase 3: Publishing VS Code extension v${EXTENSION_VERSION} (--pre-release)"
(cd packages/extension && npx @vscode/vsce publish --pre-release --no-dependencies)
ok "extension published as pre-release"

echo ""

# ─── PHASE 4: VERIFY ALL DIST-TAGS ──────────────────────────────────────────

log "Phase 4: Verification"

for scope_pkg in "devsteps-shared" "devsteps-cli" "devsteps-mcp-server"; do
  PKG_TAGS=$(npm view "@schnick371/${scope_pkg}" dist-tags 2>/dev/null)
  echo "  @schnick371/${scope_pkg}: ${PKG_TAGS}"
done

# Confirm @latest unchanged
LATEST_CLI_AFTER=$(npm view @schnick371/devsteps-cli@latest version 2>/dev/null || echo "unknown")
if [[ "$LATEST_CLI_AFTER" != "$LATEST_CLI" ]]; then
  fail "@latest CHANGED! Was ${LATEST_CLI}, now ${LATEST_CLI_AFTER}.\n  Fix: npm dist-tag add @schnick371/devsteps-cli@1.0.0 latest"
fi
ok "@latest unchanged: ${LATEST_CLI_AFTER}"

# Quick smoke test
log "Smoke test: checking install..."
INSTALLED_VER=$(npx -y --package=@schnick371/devsteps-cli@next devsteps --version 2>/dev/null || echo "smoke_failed")
if [[ "$INSTALLED_VER" == *"${NPM_VERSION}"* ]]; then
  ok "Smoke test passed: devsteps --version = ${INSTALLED_VER}"
else
  warn "Smoke test inconclusive (may need cache refresh): ${INSTALLED_VER}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ All packages published!"
echo ""
echo "  npm @next:  ${NPM_VERSION}"
echo "  extension:  ${EXTENSION_VERSION} (pre-release)"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "NEXT STEPS:"
echo ""
echo "  1. Verify extension on Marketplace:"
echo "     https://marketplace.visualstudio.com/items?itemName=devsteps.devsteps"
echo ""
echo "  2. Announce to testers:"
echo ""
echo "     DevSteps Pre-Release:"
echo "       npm: npm install -g @schnick371/devsteps-cli@next"
echo "       VS Code: Extensions view → DevSteps → Switch to Pre-Release"
echo ""
echo "  3. Iterate with next.2, next.3... by bumping NPM_VERSION in this script,"
echo "     bumping EXTENSION_VERSION (odd patch or odd minor), and running again."
echo ""

