#!/bin/bash
# Verify Copilot file parity across the three mirror trees:
#   .github/  (root)
#   packages/cli/.github/
#   packages/mcp-server/.github/
#
# Checks:
#   1. File-set parity — prompts, agents, and devsteps-* instructions
#   2. Content parity — md5sum match for every mirrored file
#   3. Numbering — no legacy devsteps-90-* files, devsteps-01 exists
#
# Exit 0 on success, 1 on any mismatch.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

pass() { echo -e "${GREEN}  ✓ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; ERRORS=$((ERRORS + 1)); }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }

ROOT=".github"
CLI="packages/cli/.github"
MCP="packages/mcp-server/.github"

MIRRORS=("$CLI" "$MCP")

echo "🔍 Copilot Files Parity Check"
echo "=============================="

# ─── 1. Numbering guards ────────────────────────────────────────────────

echo ""
echo "1. Numbering guards"

if ls "$REPO_ROOT/$ROOT/prompts"/devsteps-90-*.prompt.md &>/dev/null; then
    fail "Legacy devsteps-90-* prompt found in root"
else
    pass "No legacy devsteps-90-* in root"
fi

for mirror in "${MIRRORS[@]}"; do
    if ls "$REPO_ROOT/$mirror/prompts"/devsteps-90-*.prompt.md &>/dev/null; then
        fail "Legacy devsteps-90-* prompt found in $mirror"
    fi
done

if [ -f "$REPO_ROOT/$ROOT/prompts/devsteps-01-project-context.prompt.md" ]; then
    pass "devsteps-01-project-context exists in root"
else
    fail "devsteps-01-project-context MISSING in root"
fi

# ─── 2. File-set parity ─────────────────────────────────────────────────

echo ""
echo "2. File-set parity (prompts)"

root_prompts=$(ls "$REPO_ROOT/$ROOT/prompts"/devsteps-*.prompt.md 2>/dev/null | xargs -I{} basename {} | sort)

for mirror in "${MIRRORS[@]}"; do
    mirror_prompts=$(ls "$REPO_ROOT/$mirror/prompts"/devsteps-*.prompt.md 2>/dev/null | xargs -I{} basename {} | sort)
    diff_result=$(diff <(echo "$root_prompts") <(echo "$mirror_prompts") || true)
    if [ -z "$diff_result" ]; then
        pass "Prompt file-set matches: root ↔ $mirror"
    else
        fail "Prompt file-set mismatch: root ↔ $mirror"
        echo "$diff_result" | head -20
    fi
done

echo ""
echo "3. File-set parity (agents)"

root_agents=$(ls "$REPO_ROOT/$ROOT/agents"/devsteps-*.agent.md 2>/dev/null | xargs -I{} basename {} | sort)

for mirror in "${MIRRORS[@]}"; do
    mirror_agents=$(ls "$REPO_ROOT/$mirror/agents"/devsteps-*.agent.md 2>/dev/null | xargs -I{} basename {} | sort)
    diff_result=$(diff <(echo "$root_agents") <(echo "$mirror_agents") || true)
    if [ -z "$diff_result" ]; then
        pass "Agent file-set matches: root ↔ $mirror"
    else
        fail "Agent file-set mismatch: root ↔ $mirror"
        echo "$diff_result" | head -20
    fi
done

echo ""
echo "4. File-set parity (instructions — devsteps-* only)"

root_instructions=$(ls "$REPO_ROOT/$ROOT/instructions"/devsteps-*.instructions.md 2>/dev/null | xargs -I{} basename {} | sort)

for mirror in "${MIRRORS[@]}"; do
    mirror_instructions=$(ls "$REPO_ROOT/$mirror/instructions"/devsteps-*.instructions.md 2>/dev/null | xargs -I{} basename {} | sort)
    diff_result=$(diff <(echo "$root_instructions") <(echo "$mirror_instructions") || true)
    if [ -z "$diff_result" ]; then
        pass "Instruction file-set matches: root ↔ $mirror"
    else
        fail "Instruction file-set mismatch: root ↔ $mirror"
        echo "$diff_result" | head -20
    fi
done

# ─── 3. Content parity (md5sum) ─────────────────────────────────────────

echo ""
echo "5. Content parity (md5sum)"

check_content_parity() {
    local subdir=$1
    local pattern=$2
    local label=$3

    for root_file in "$REPO_ROOT/$ROOT/$subdir"/$pattern; do
        [ -f "$root_file" ] || continue
        local basename=$(basename "$root_file")
        local root_hash=$(md5sum "$root_file" | awk '{print $1}')

        for mirror in "${MIRRORS[@]}"; do
            local mirror_file="$REPO_ROOT/$mirror/$subdir/$basename"
            if [ ! -f "$mirror_file" ]; then
                fail "$label $basename missing in $mirror"
                continue
            fi
            local mirror_hash=$(md5sum "$mirror_file" | awk '{print $1}')
            if [ "$root_hash" = "$mirror_hash" ]; then
                pass "$label $basename: root ↔ $mirror"
            else
                fail "$label $basename: CONTENT DIFFERS root ↔ $mirror"
            fi
        done
    done
}

check_content_parity "prompts" "devsteps-*.prompt.md" "Prompt"
check_content_parity "agents" "devsteps-*.agent.md" "Agent"
check_content_parity "instructions" "devsteps-*.instructions.md" "Instruction"

# ─── Summary ─────────────────────────────────────────────────────────────

echo ""
echo "=============================="
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    exit 1
fi
