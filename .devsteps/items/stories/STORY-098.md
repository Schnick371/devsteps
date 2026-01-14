# Story: Coordinator Executor Pattern - Planner-Executor Separation

## User Value

**As a** DevSteps coordinator agent,  
**I want** to delegate planning to specialized sub-agents and execute their plans,  
**so that** I follow the documented "Executor Mode" pattern per Copilot standards.

## Context

The updated `devsteps-coordinator.agent.md` introduces a **critical architectural change**:

**OLD Pattern:**
- Coordinator analyzes, plans, AND executes

**NEW Pattern (2026):**
- Coordinator **delegates** planning to specialists
- Receives detailed plans from sub-agents
- **Executes** plans using edit/execute tools
- Validates results against plan criteria

**Key Capability:** Parallel planning (request multiple plans simultaneously)

## Acceptance Criteria

### 1. Delegation Protocol
- [ ] Coordinator identifies planning needs:
  - Complex analysis → devsteps-analyzer
  - Code implementation → devsteps-implementer
  - Testing strategy → devsteps-tester
  - Documentation → devsteps-documenter
- [ ] Delegates with clear context and constraints
- [ ] Receives structured plan from sub-agent
- [ ] Validates plan completeness before execution

### 2. Parallel Planning Infrastructure
- [ ] Support simultaneous delegation:
  - Example: devsteps-analyzer + devsteps-tester
  - Example: devsteps-implementer + devsteps-documenter
  - Example: All sub-agents for complex features
- [ ] Collect and merge plans
- [ ] Resolve conflicts between plans
- [ ] Coordinate execution sequence

### 3. Plan Execution Protocol
- [ ] Receive plan from sub-agent
- [ ] Review plan structure:
  - Clear steps with acceptance criteria
  - Dependencies identified
  - Success criteria defined
- [ ] Execute steps using `edit/*` and `execute/*` tools
- [ ] Validate each step against plan criteria
- [ ] Update DevSteps item status on completion

### 4. Sub-Agent Communication
- [ ] Standardized plan format:
  ```markdown
  # Implementation Plan: <Title>
  
  ## Context
  - Background and requirements
  
  ## Steps
  1. Step 1 description
     - Acceptance criteria
     - Commands/edits required
  2. Step 2 description
     - ...
  
  ## Success Criteria
  - Testable validation criteria
  
  ## Dependencies
  - Required tools/packages
  ```

### 5. Coordinator Behavior Changes
- [ ] **NEVER** perform analysis directly (delegate to devsteps-analyzer)
- [ ] **NEVER** plan implementation directly (delegate to devsteps-implementer)
- [ ] **ALWAYS** validate plan before execution
- [ ] **ALWAYS** use sub-agent expertise for decisions

### 6. Prompt Updates
- [ ] Update `devsteps-start-work.prompt.md` to reference executor pattern
- [ ] Update `devsteps-workflow.prompt.md` with delegation examples
- [ ] Update `devsteps-coordinator.agent.md` with detailed examples

### 7. Example Workflows

**Simple Feature:**
```
User: Implement story X
Coordinator: @devsteps-implementer create plan for story X
Sub-agent: [Returns detailed plan]
Coordinator: [Executes plan steps]
Coordinator: [Validates against criteria]
```

**Complex Feature (Parallel):**
```
User: Implement story Y with tests and docs
Coordinator: 
  - @devsteps-implementer create implementation plan
  - @devsteps-tester create test plan
  - @devsteps-documenter create documentation plan
[Receive 3 plans simultaneously]
Coordinator: [Merge plans, execute in coordinated sequence]
```

## Definition of Done

- Executor pattern documented in agent files
- Delegation protocols clearly defined
- Parallel planning infrastructure described
- Example workflows provided
- Sub-agent communication format standardized
- No code changes (documentation only)
- Committed with conventional format

## Technical Notes

**This is a DOCUMENTATION story** - no code implementation required. The architectural pattern is already defined in the updated Copilot files. This story ensures:
- Pattern is clearly documented
- Examples are provided
- Sub-agents understand their planning role
- Coordinator understands its execution role

**Affected Files:**
- `.github/agents/devsteps-coordinator.agent.md` (already updated)
- `.github/agents/devsteps-implementer.agent.md` (clarify planning responsibility)
- `.github/agents/devsteps-analyzer.agent.md` (clarify planning responsibility)
- `.github/agents/devsteps-tester.agent.md` (clarify planning responsibility)
- `.github/agents/devsteps-documenter.agent.md` (clarify planning responsibility)

## Dependencies

- None (documentation-only)

## Reference

Source: `.github/agents/devsteps-coordinator.agent.md` (Section: "Executor Mode")

## Estimated Effort

**Complexity:** Low (documentation enhancement)
**Timeline:** 1-2 days
**Risk:** Low