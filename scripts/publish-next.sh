#!/usr/bin/env bash
# ============================================================
# publish-next.sh — DevSteps 1.1.0-next.1 Pre-Release Publisher
# ============================================================
# 
# PREREQUISITES:
#   1. Valid npm auth token (run: npm login)
#   2. On branch: next/1.1.0-next.1
#   3. All packages built (run: npm run build:ordered first)
#
# USAGE:
#   bash scripts/publish-next.sh
# ============================================================

set -euo pipefail

VERSION="1.1.0-next.1"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()  { echo -e "${GREEN}✅${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠️ ${NC} $1"; }
fail(){ echo -e "${RED}❌${NC} $1"; exit 1; }

log "DevSteps Pre-Release Publisher — v${VERSION}"
echo ""

# ─── PRE-FLIGHT CHECKS ───────────────────────────────────────────────────────

log "Phase 0: Pre-flight checks"

# Check npm auth
if ! npm whoami &>/dev/null; then
  fail "npm auth failed. Run: npm login\n       Then retry this script."
fi
NPM_USER=$(npm whoami)
ok "npm logged in as: ${NPM_USER}"

# Check branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "next/1.1.0-next.1" ]]; then
  warn "Not on next/1.1.0-next.1 (currently: ${CURRENT_BRANCH})"
  read -p "Continue anyway? [y/N] " -n 1 -r
  echo ""
  [[ $REPLY =~ ^[Yy]$ ]] || fail "Aborted."
fi

# Verify versions
log "Verifying package versions..."
for pkg in shared cli mcp-server extension; do
  PKG_VERSION=$(node -e "console.log(require('./packages/${pkg}/package.json').version)")
  if [[ "$PKG_VERSION" != "$VERSION" ]]; then
    fail "packages/${pkg}/package.json version=${PKG_VERSION} (expected ${VERSION})"
  fi
  ok "packages/${pkg}: ${PKG_VERSION}"
done

# Check dist exists
[[ -f "packages/shared/dist/index.js" ]]    || fail "shared not built — run: npm run build --workspace=packages/shared"
[[ -f "packages/cli/dist/index.cjs" ]]       || fail "cli not built — run: npm run build --workspace=packages/cli"
[[ -f "packages/mcp-server/dist/index.bundled.mjs" ]] || fail "mcp-server not built — run: npm run build --workspace=packages/mcp-server"
[[ -f "packages/extension/dist/extension.js" ]]       || fail "extension not built — run: npm run build --workspace=packages/extension"
ok "All dist/ outputs present"

# Check @latest is unchanged (must be 1.0.0)
LATEST_CLI=$(npm view @schnick371/devsteps-cli@latest version 2>/dev/null || echo "unknown")
log "Current @latest: ${LATEST_CLI} (must remain unchanged)"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  About to publish ${VERSION} with --tag next"
echo "  @latest will remain: ${LATEST_CLI}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ─── PHASE 1: PUBLISH SHARED (MUST BE FIRST) ─────────────────────────────────

log "Phase 1: Publishing @schnick371/devsteps-shared@${VERSION} (--tag next)"
(cd packages/shared && npm publish --access public --tag next)
ok "shared published"

# Verify shared immediately
SHARED_NEXT=$(npm view @schnick371/devsteps-shared dist-tags.next 2>/dev/null || echo "")
if [[ "$SHARED_NEXT" != "$VERSION" ]]; then
  fail "shared publish verification failed! dist-tags.next=${SHARED_NEXT}"
fi
ok "shared @next verified: ${SHARED_NEXT}"

echo ""

# ─── PHASE 2: PUBLISH CLI + MCP-SERVER (PARALLEL) ────────────────────────────
# NOTE: Both depend on shared which is now published.

log "Phase 2a: Publishing @schnick371/devsteps-cli@${VERSION} (--tag next)"
(cd packages/cli && npm publish --access public --tag next)
ok "cli published"

log "Phase 2b: Publishing @schnick371/devsteps-mcp-server@${VERSION} (--tag next)"
(cd packages/mcp-server && npm publish --access public --tag next)
ok "mcp-server published"

echo ""

# ─── PHASE 3: VERIFY ALL DIST-TAGS ───────────────────────────────────────────

log "Phase 3: Verification"

for scope_pkg in "devsteps-shared" "devsteps-cli" "devsteps-mcp-server"; do
  PKG_TAGS=$(npm view "@schnick371/${scope_pkg}" dist-tags 2>/dev/null)
  echo "  @schnick371/${scope_pkg}: ${PKG_TAGS}"
done

# Confirm @latest unchanged
LATEST_CLI_AFTER=$(npm view @schnick371/devsteps-cli@latest version 2>/dev/null || echo "unknown")
if [[ "$LATEST_CLI_AFTER" != "$LATEST_CLI" ]]; then
  fail "@latest CHANGED! Was ${LATEST_CLI}, now ${LATEST_CLI_AFTER}. Fix immediately:\n  npm dist-tag add @schnick371/devsteps-cli@1.0.0 latest"
fi
ok "@latest unchanged: ${LATEST_CLI_AFTER}"

# Quick smoke test
log "Smoke test: checking install..."
INSTALLED_VER=$(npx -y --package=@schnick371/devsteps-cli@next devsteps --version 2>/dev/null || echo "smoke_failed")
if [[ "$INSTALLED_VER" == *"${VERSION}"* ]]; then
  ok "Smoke test passed: devsteps --version = ${INSTALLED_VER}"
else
  warn "Smoke test inconclusive (may need cache refresh): ${INSTALLED_VER}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ npm packages published: ${VERSION}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "REMAINING MANUAL STEPS:"
echo ""
echo "  1. Upload VS Code Extension (pre-release VSIX):"
echo "     File: packages/extension/devsteps-${VERSION}-prerelease.vsix"
echo "     URL:  https://marketplace.visualstudio.com/manage/publishers/devsteps"
echo "     ☑️   Check the \"Pre-Release\" checkbox when uploading!"
echo ""
echo "  2. Announce to testers:"
echo ""
echo "     🧪 Pre-Release Available: ${VERSION}"
echo "     Install:"
echo "       npm install -g @schnick371/devsteps-cli@next"
echo "       npm install -g @schnick371/devsteps-mcp-server@next"
echo "     VS Code: Switch to Pre-Release in extension marketplace"
echo ""
echo "  3. Iterate with next.2, next.3... using:"
echo "     bash scripts/publish-next.sh  (after bumping versions)"
echo ""
