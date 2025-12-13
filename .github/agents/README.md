# DevSteps Multi-Agent System

## Overview

The DevSteps agent system uses a **coordinator pattern** with specialized sub-workers, each optimized for specific tasks using the best AI models for their strengths.

## Architecture

```
┌─────────────────────────────────────────┐
│   DevSteps Coordinator (GPT-5 mini)     │
│   - Orchestrates workflow               │
│   - Analyzes tasks & delegates          │
│   - Validates outputs                   │
│   - Manages status & commits            │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────────────┬─────────────────┬─────────────────┐
      │                         │                 │                 │
┌─────▼──────┐      ┌──────────▼────┐   ┌───────▼────────┐ ┌──────▼───────┐
│  Analyzer  │      │  Implementer  │   │  Documenter    │ │   Tester     │
│  (Claude)  │      │    (Grok)     │   │   (Gemini)     │ │  (GPT-5)     │
│            │      │               │   │                │ │              │
│ Deep       │      │ Fast          │   │ Documentation  │ │ Test         │
│ Analysis   │      │ Simple Tasks  │   │ Specialist     │ │ Generation   │
└────────────┘      └───────────────┘   └────────────────┘ └──────────────┘
```

## Agents

### 🎯 devsteps.agent.md (Coordinator)
**Model:** GPT-5 mini (unlimited usage, 0x multiplier)  
**Role:** Orchestrates all work, delegates to specialized sub-workers  
**Responsibilities:**
- Analyze task complexity and file sizes
- Select appropriate sub-worker via decision matrix
- Coordinate multi-agent workflows
- Validate outputs and run quality gates
- Manage DevSteps status tracking and git commits

**Never directly implements code** - always delegates!

### 🔬 devsteps-analyzer.agent.md
**Model:** Claude Sonnet 4.5 (1x multiplier)  
**Specialization:** Complex analysis and architecture  
**Best for:**
- Files >200 lines requiring refactoring
- Architecture decisions and system design
- Complex bug analysis across multiple files
- SOLID principles validation
- Performance optimization requiring deep understanding

**Invoke:** `#runSubagent` with `subagentType=devsteps-analyzer`

### ⚡ devsteps-implementer.agent.md
**Model:** Grok Code Fast 1 (0.25x multiplier - cheapest!)  
**Specialization:** Fast, simple implementations  
**Best for:**
- Utility functions (<150 lines)
- Boilerplate code generation
- Simple bug fixes (single file, clear cause)
- Repetitive edits
- Quick iterations

**CRITICAL:** ⚠️ **NEVER use for files >150 lines!** Will hallucinate or corrupt code!  
**Invoke:** `#runSubagent` with `subagentType=devsteps-implementer`

### 📚 devsteps-documenter.agent.md
**Model:** Gemini 2.5 Pro (1x multiplier, 1M token context!)  
**Specialization:** Documentation and long-form content  
**Best for:**
- README files and project docs
- Architecture decision records (ADRs)
- API documentation
- Technical guides and how-tos
- Analyzing large documents (up to 1,500 pages!)

**Invoke:** `#runSubagent` with `subagentType=devsteps-documenter`

### 🧪 devsteps-tester.agent.md
**Model:** GPT-5 mini (unlimited usage, 0x multiplier)  
**Specialization:** Test generation and debugging  
**Best for:**
- Unit test creation
- Integration test generation
- Debugging test failures
- Test coverage analysis
- Test refactoring

**Invoke:** `#runSubagent` with `subagentType=devsteps-tester`

## Decision Matrix

| Task Type | File Size | Complexity | Delegate To | Cost |
|-----------|-----------|------------|-------------|------|
| New Feature | Any | High | devsteps-analyzer | 1x |
| Utility Function | <150 lines | Low | devsteps-implementer | 0.25x |
| Large Refactor | >200 lines | High | devsteps-analyzer | 1x |
| Boilerplate | <100 lines | Low | devsteps-implementer | 0.25x |
| Documentation | Any | Any | devsteps-documenter | 1x |
| Test Creation | <150 lines | Medium | devsteps-tester | 0x (free!) |
| Bug Fix (simple) | <150 lines | Low | devsteps-implementer | 0.25x |
| Bug Fix (complex) | >200 lines | High | devsteps-analyzer | 1x |

## File Size Safety Rules

**CRITICAL:** Grok (devsteps-implementer) is DANGEROUS on large files!

| File Size | Grok | Claude | Gemini | GPT-5 mini |
|-----------|------|--------|--------|------------|
| 0-100 lines | ✅ Safe | ✅ OK (overkill) | ✅ OK | ✅ OK |
| 101-150 lines | ⚠️ Caution | ✅ Good | ✅ Good | ✅ Good |
| 151-200 lines | 🚨 Reject! | ✅ Preferred | ✅ OK | ✅ OK |
| 200+ lines | ⛔ Never! | ✅ Required | ✅ OK for docs | ✅ OK for tests |

**Rule:** If file >150 lines → Coordinator MUST split into smaller modules OR delegate to devsteps-analyzer

## Usage Examples

### Example 1: Simple Utility Function
```
User: "Create a function to validate email addresses"

Coordinator decides:
- File size: New function, ~30 lines
- Complexity: Low (regex pattern)
- Decision: devsteps-implementer

Action: 
#runSubagent subagentType=devsteps-implementer "Create email validation"
```

### Example 2: Complex Refactoring
```
User: "Refactor Install-Node.ps1 error handling"

Coordinator analyzes:
- File size: 187 lines (too large for Grok!)
- Complexity: Moderate to high
- Decision: devsteps-analyzer

Action:
#runSubagent subagentType=devsteps-analyzer "Refactor error handling"
```

### Example 3: Full Workflow
```
User: "Add new config validation feature"

Coordinator orchestrates:
1. devsteps-analyzer: Design validation architecture
2. devsteps-implementer: Implement small validation functions (<100 lines each)
3. devsteps-tester: Create comprehensive test suite
4. devsteps-documenter: Update API docs and README
```

## Model Strengths Summary

### Claude Sonnet 4.5 (devsteps-analyzer)
✅ Deep reasoning, architecture, complex refactoring  
✅ Handles large files (200+ lines) safely  
✅ SOLID principles, design patterns  
⚠️ Slower responses, higher cost (1x)

### Grok Code Fast 1 (devsteps-implementer)
✅ Lightning fast (0.25x cost!)  
✅ Excellent for simple tasks  
✅ Boilerplate generation  
🚨 DANGEROUS on files >150 lines!  
⚠️ Limited complex reasoning

### Gemini 2.5 Pro (devsteps-documenter)
✅ Massive 1M token context (1,500 pages!)  
✅ Excellent document analysis  
✅ Structured content creation  
⚠️ Not optimized for code generation  
⚠️ Cost: 1x multiplier

### GPT-5 mini (devsteps-tester + coordinator)
✅ FREE (0x multiplier - unlimited!)  
✅ Fast and reliable  
✅ Great balance for testing  
✅ Excellent coordinator model  
⚠️ Less creative than Claude

## Cost Optimization

**Cheapest workflow:**
1. Coordinator (GPT-5 mini): 0x - FREE
2. Analysis (Claude): 1x - use sparingly
3. Implementation (Grok): 0.25x - use heavily for small tasks
4. Testing (GPT-5 mini): 0x - FREE
5. Docs (Gemini): 1x - use when needed

**Strategy:** Maximize Grok usage for simple tasks, minimize Claude usage for complex tasks only.

## Integration with DevSteps

All agents follow DevSteps workflow:
1. Search existing items (`#mcp_devsteps_search`)
2. Update status to in-progress
3. Execute via appropriate sub-worker
4. Run quality gates
5. Update status to done
6. Commit immediately with conventional format

## References

- [devsteps.agent.md](devsteps.agent.md) - Coordinator implementation
- [devsteps-analyzer.agent.md](devsteps-analyzer.agent.md) - Complex analysis
- [devsteps-implementer.agent.md](devsteps-implementer.agent.md) - Fast implementation
- [devsteps-documenter.agent.md](devsteps-documenter.agent.md) - Documentation
- [devsteps-tester.agent.md](devsteps-tester.agent.md) - Testing specialist

---

**Created:** December 12, 2025  
**Based on:** GitHub Copilot Agent Mode patterns, Claude Code subagents, and latest 2025 model capabilities
