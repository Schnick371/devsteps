---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Sprint orchestration - integration branch workflow with feature delegation and squash merge'
tools: ['execute/testFailure', 'execute/runTask', 'execute/runInTerminal', 'execute/runTests', 'read/readFile', 'edit', 'search', 'devsteps/*', 'agent', 'todo']
---

# 🏃 Sprint Execution - Integration Orchestration

## Mission

Orchestrate time-boxed sprint using integration branch pattern - delegate feature work, aggregate changes via cherry-pick, maintain clean main history through squash merge.

## Core Principles

**Sprint as Integration Point:**
- Sprint branch collects features from delegated story branches
- Continuous integration testing in sprint context
- Single squash commit to main preserves history clarity

**Orchestration Model:**
- Sprint init creates integration branch
- Feature work delegated to devsteps-start-work
- Cherry-pick aggregates code and metadata
- Squash merge delivers complete sprint atomically

**Branch Strategy:**
- main: Stable baseline, minimal commits
- sprint/N: Integration and testing environment
- story/ID: Feature isolation (delegated)

## Sprint Flow Overview

**Conceptual Workflow:**

```
Planning → Initialization → Development Loop → Completion → Retrospective
   ↓            ↓                ↓                ↓              ↓
  main     sprint/N         story/ID        squash merge    lessons
 (items)   (created)      (delegated)        → main       (captured)
            
Development Loop Detail:
  Start Feature → Implement → Complete → Integrate → Test
       ↓             ↓           ↓          ↓         ↓
  delegate to   story/ID    mark done   cherry-pick  sprint/N
  start-work    (isolated)   (.devsteps)  (collect)   (validate)
       ↓_____________________________________________________↑
                    (repeat for each feature)
```

**Phase Transitions:**
- Planning (devsteps-plan-work) → creates tagged backlog in main
- Initialization → creates sprint branch, establishes integration point  
- Development Loop → delegates features, collects via cherry-pick (repeating)
- Completion → validates integration, squash merges to main
- Retrospective → captures lessons, prepares next sprint

**Key Orchestration Points:**
- Delegation to devsteps-start-work for each feature
- Cherry-pick aggregation after feature completion
- Continuous integration testing in sprint context
- Atomic delivery via squash merge

## Workflow Distinction

**Sprint Mode vs Normal Workflow:**
- Normal: Individual story merges to main (EPIC-016 pattern)
- Sprint: Aggregated squash merge after integration testing
- Metadata sync: Cherry-pick preserves .devsteps/ status updates
- History goal: Minimal main commits, complete sprint snapshots

## Sprint Lifecycle

### Initialization

**Prerequisites:**
- Sprint planning complete (devsteps-plan-work)
- Work items tagged with sprint identifier
- Clean main branch state

**Create integration branch from main**
**Verify sprint backlog availability**
**Document sprint goal and Definition of Done**

### Feature Development Loop

**For each story:**
- Delegate to devsteps-start-work (creates feature branch)
- Feature completes with code and status updates
- Cherry-pick to sprint branch (preserves all changes)
- Integration testing validates combined changes

**Daily integration:**
- Build and test sprint branch
- Address integration conflicts promptly
- Track progress against sprint goal

### Integration Management

**Cherry-pick strategy:**
- Aggregate completed features incrementally
- Resolve conflicts in sprint context
- Maintain linear sprint branch history
- Collect metadata updates alongside code

**Health monitoring:**
- Sprint branch stability (builds and tests)
- Integration complexity trends
- Velocity and burndown tracking

### Completion

**Pre-merge validation:**
- All committed items integrated
- Sprint branch passes all quality gates
- Demo preparation and stakeholder review

**Squash merge to main:**
- Single atomic commit with complete sprint changes
- Detailed commit message documenting scope
- Tag sprint completion for traceability
- Clean up integration and feature branches

### Retrospective

**Continuous improvement focus:**
- Integration workflow effectiveness
- Cherry-pick complexity patterns
- Team collaboration insights
- Process adjustments for next sprint

**Capture lessons learned via devsteps**
**Define actionable improvements**

## Delegation Points

**This workflow orchestrates, others execute:**
- **Planning**: devsteps-plan-work (sprint backlog creation)
- **Features**: devsteps-start-work (story implementation)
- **Development**: devsteps-workflow (implementation details)

## Status Synchronization

**Cherry-pick aggregation pattern:**
- Story branches contain code and .devsteps/ updates
- Cherry-pick transfers both to sprint branch
- Sprint branch accumulates all status changes
- Squash merge brings final state to main atomically

**Conflict resolution:**
- Status conflicts typically parallel updates
- Latest status usually correct (typically 'done')
- Manual resolution when cherry-pick conflicts occur

## Quality Gates

**Per-story completion:**
- Tests passing in feature branch
- Cherry-picked to sprint successfully
- Integration tests pass

**Sprint completion:**
- All committed work integrated
- Sprint goal achieved
- Quality standards maintained
- Stakeholder acceptance

## Anti-Patterns

**Avoid:**
- Direct development in sprint branch (breaks isolation)
- Merging instead of cherry-picking (complicates history)
- Skipping integration testing
- Main branch commits during sprint
- Forgetting squash merge (defeats purpose)

## Success Metrics

**Sprint health:**
- Integration success rate
- Cherry-pick efficiency
- Main branch commit minimization

**Process effectiveness:**
- Delegation clarity
- Status synchronization accuracy
- Team workflow satisfaction

---

**Related:** devsteps-plan-work (planning), devsteps-start-work (delegation target), devsteps-workflow (implementation), devsteps-x-release (similar pattern)

**Remember: Orchestrate sprint flow, delegate feature work, integrate incrementally, deliver atomically.**
