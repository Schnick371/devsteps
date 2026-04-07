---
applyTo: "**"
description: "Hybrid Git Ownership Policy — defines who owns each git operation, mandatory guardrails, and advisory hint format for Copilot agents"
---

# Hybrid Git Ownership Policy

## Policy Model

DevSteps uses a **Hybrid Git Ownership model**: the user owns all git state mutations. Agents analyze, prepare, and advise — they never autonomously execute write operations against the repository. Three mandatory guardrails exist that agents MUST enforce regardless of ownership.

---

## Ownership Matrix

| Git Operation | Owner | Agent Role |
|---|---|---|
| Branch creation (`git checkout -b`) | **User** | Advisory: suggest branch name and command |
| Staging changes (`git add`) | **User** | Advisory: list files and suggested command |
| Commit execution (`git commit`) | **User** | Mandatory: prepare formatted message incl. `Implements:` footer; advisory: suggest the full command |
| Merge to main (`git merge`) | **User** | Advisory: suggest `--no-ff` merge command |
| Branch deletion (`git branch -d`) | **User** | Advisory: suggest cleanup command |
| Push to remote (`git push`) | **User** | Mandatory: WARN if target is public remote during development; advisory otherwise |
| Tag creation (`git tag`) | **User** | Advisory: suggest tag name and command |
| Rebase / cherry-pick | **User** | Advisory: suggest strategy and command sequence |
| Stash (`git stash`) | **User** | Advisory: suggest command |
| Repository verification (`git status`, `git log`, `git remote -v`) | Agent | Agents MAY run read-only git commands autonomously for analysis and validation |

---

## Mandatory Guardrails (Non-Negotiable — Agent-Enforced)

These three rules apply regardless of tier, agent type, or context:

### G-1: `Implements:` Footer

Every commit related to a DevSteps work item **MUST** include `Implements: <ID>` in the commit message footer. Agents:

- MUST prepare the commit message in Conventional Commits format with this footer
- MUST include the formatted message in every git hint suggestion
- MUST NOT approve a completion step if the footer is absent from the prepared message

**Example prepared commit message:**
```
feat(scope): implement feature X

Implements: STORY-123
```

### G-2: No Direct `main` Commit

Agents MUST NEVER prepare or suggest a commit that targets `main` directly:

- Work happens on feature branches (`story/<ID>`, `task/<ID>`, `bug/<ID>`, `spike/<ID>`)
- If a user appears to be on `main`, agents MUST surface a warning before any commit suggestion
- Release preparation uses dedicated release branches (`dev/X.Y.Z`, `next/X.Y.Z-next.N`)

### G-3: Release Remote Safety

The DevSteps project uses TWO remotes:

- `origin-private` = private development (default push target)
- `origin` = PUBLIC repository

Agents MUST:

- Warn explicitly before any `git push origin` suggestion during development
- Require explicit user acknowledgment before a public push is presented as the next step
- Always label which remote is being targeted in push suggestions

---

## Advisory Hint Format

When an agent reaches a step requiring a git write operation, it outputs an advisory hint block:

```
💡 Git: user executes — suggested commands:
  git add <files>
  git commit -m "<type>(<scope>): <subject>

Implements: <ID>"
```

For branch operations:
```
💡 Git: user executes — suggested branch:
  git checkout -b story/<ID>
```

For merge operations:
```
💡 Git: user executes — suggested merge:
  git checkout main
  git merge --no-ff story/<ID>
  git branch -d story/<ID>
```

Agents do NOT `run_in_terminal` for git write operations. They output the hint and continue with non-git work or pause for the next agent action.

---

## Agent Read-Only Permissions

Agents MAY autonomously execute these git commands for analysis/validation:

| Command | Purpose |
|---|---|
| `git status --short` | Verify working tree is clean |
| `git log --oneline -N` | Inspect recent history |
| `git remote -v` | Verify remote configuration |
| `git branch --list` | List branches |
| `git tag -l "v*"` | List version tags |
| `git diff --name-only` | List changed files |
| `git show --stat HEAD` | Inspect last commit |

---

## Decision Criteria: When to Use Which Role

| Situation | Agent action |
|---|---|
| Completing implementation work | Prepare hint with `git add` + formatted commit message |
| Item marked done, branch still open | Prepare merge hint with `--no-ff` |
| User hasn't branched yet | Prepare branch creation hint before starting work |
| About to push in release workflow | Verify remote config; warn if target is public; suggest push command |
| Release prep complete | Prepare tagging + push hint labeled with exact remote and scope |

---

## Migration Notes (from Full-Choreography Model)

**Previous model:** agents executed `git add`, `git commit`, `git checkout -b`, `git merge --no-ff` autonomously. Commit steps were imperative phases in worker agent protocols.

**Current model (Hybrid):** agents prepare commit messages and output advisory hints. The three mandatory guardrails (G-1, G-2, G-3) remain enforced at the preparation level — agents validate the message content and remote target before surfacing the hint.

**What did NOT change:**
- Conventional Commits format is still mandatory
- `Implements: <ID>` footer is still mandatory (enforced in message preparation)
- No direct `main` commits — still enforced as a warning gate
- Release remote safety — still enforced as a warning gate before push suggestions

**What changed:**
- Workers no longer run `git add` / `git commit` shell steps
- Coord agents express branch and merge steps as advisory hints, not imperative protocol steps
- Release orchestration prompts present git write sequences as user-execution steps with `💡` markers
